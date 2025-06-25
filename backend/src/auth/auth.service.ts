import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from './redis.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { HttpResponseInterface } from 'src/shared/interfaces/http-response.interface';
import { Student } from 'src/users/entities/student.entity';
import { Role } from 'src/users/roles.enum';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private redisService: RedisService,

        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Student)
        private studentRepository: Repository<Student>,
    ) { }

    async register(registerDto: RegisterDto): Promise<HttpResponseInterface<null>> {
        const { email, password, identifier, role } = registerDto;
        const finalRole = role || Role.VOTER;

        let student: Student | null = null;

        if (finalRole === Role.VOTER) {
            if (!identifier) throw new BadRequestException('Student ID is required for voters');
            student = await this.studentRepository.findOne({
                where: { student_id: Number(identifier) },
            });

            if (!student) {
                throw new BadRequestException('Student ID not found in records.');
            }
        }

        const existing = await this.userRepository.findOne({
            where: [{ email }, { identifier }] as any,
        });

        if (existing) {
            throw new BadRequestException('User already registered.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = this.userRepository.create({
            email,
            password: hashedPassword,
            role: finalRole,
            identifier,
        } as DeepPartial<User>);

        await this.userRepository.save(newUser);

        return {
            statusCode: 201,
            message: 'Registration successful',
        };
    }

    async login(
        loginDto: LoginDto,
    ): Promise<HttpResponseInterface<{ access_token: string; refresh_token: string; identifier: string }>> {
        const { identifier, password } = loginDto;

        const user = await this.userRepository.findOne({ where: { identifier } });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        let student: Student | null = null;

        if (user.role === Role.VOTER) {
            student = await this.studentRepository.findOne({
                where: { student_id: Number(user.identifier) },
                relations: ['department'],
            });

            if (!student) throw new UnauthorizedException('Student record not found');
        }

        const tokens = await this.generateTokens(user, student);
        await this.redisService.setRefreshToken(user.identifier, tokens.refresh_token);

        return {
            statusCode: 200,
            message: 'Login successful',
            data: {
                ...tokens,
                identifier: user.identifier,
            },
        };
    }

    async generateTokens(
        user: User,
        student?: Student | null,
    ): Promise<{ access_token: string; refresh_token: string }> {
        const payload = {
            sub: user.id,
            email: user.email,
            identifier: user.identifier,
            role: user.role,
            departmentId: student?.department?.id ?? null,
        };

        const access_token = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET || 'ACCESS_SECRET_KEY',
            expiresIn: '15m',
        });

        const refresh_token = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET || 'REFRESH_SECRET_KEY',
            expiresIn: '7d',
        });

        return { access_token, refresh_token };
    }

    async refreshToken(
        accessToken: string,
        refreshToken: string,
    ): Promise<HttpResponseInterface<{ access_token: string; refresh_token: string }>> {
        let decoded: any;

        try {
            decoded = this.jwtService.verify(accessToken, {
                secret: process.env.JWT_ACCESS_SECRET || 'ACCESS_SECRET_KEY',
                ignoreExpiration: true,
            });
        } catch {
            throw new UnauthorizedException('Invalid access token');
        }

        const identifier = decoded.identifier;
        const stored = await this.redisService.getRefreshToken(identifier);

        if (!stored || stored !== refreshToken) {
            throw new UnauthorizedException('Invalid or missing refresh token');
        }

        const user = await this.userRepository.findOne({ where: { identifier } });
        if (!user) throw new UnauthorizedException('User not found');

        let student: Student | null = null;

        if (user.role === Role.VOTER) {
            student = await this.studentRepository.findOne({
                where: { student_id: Number(user.identifier) },
                relations: ['department'],
            });
        }

        const tokens = await this.generateTokens(user, student);
        await this.redisService.setRefreshToken(identifier, tokens.refresh_token);

        return {
            statusCode: 200,
            message: 'Tokens refreshed successfully',
            data: tokens,
        };
    }

    async logout(accessToken: string): Promise<HttpResponseInterface<null>> {
        let decoded: any;

        try {
            decoded = this.jwtService.verify(accessToken, {
                secret: process.env.JWT_ACCESS_SECRET || 'ACCESS_SECRET_KEY',
            });
        } catch {
            throw new UnauthorizedException('Invalid access token');
        }

        const identifier = decoded.identifier;
        await this.redisService.deleteRefreshToken(identifier);

        return {
            statusCode: 200,
            message: 'Logged out successfully',
        };
    }
}
