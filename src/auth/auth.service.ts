import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from './entities/register-user.entity';
import { Student } from 'src/users/entities/student.entity';
import { RedisService } from './redis.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { HttpResponseInterface } from 'src/shared/interfaces/http-response.interface';

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
        const { email, student_id, password } = registerDto;

        const student = await this.studentRepository.findOne({
            where: { student_id: Number(student_id) },
        });

        if (!student) {
            throw new BadRequestException('Student ID not found in records.');
        }

        const existing = await this.userRepository.findOne({
            where: [{ student_id }, { email }],
        });

        if (existing) {
            throw new BadRequestException('User already registered.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = this.userRepository.create({
            email,
            student_id,
            password: hashedPassword,
        });

        await this.userRepository.save(newUser);

        return {
            statusCode: 201,
            message: 'Registration successful',
        };
    }

    async login(
        loginDto: LoginDto,
    ): Promise<HttpResponseInterface<{ access_token: string; refresh_token: string; student_id: string }>> {
        const { student_id, password } = loginDto;

        const user = await this.userRepository.findOne({ where: { student_id } });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        const tokens = await this.generateTokens(user.id, student_id);
        await this.redisService.setRefreshToken(student_id, tokens.refresh_token);

        return {
            statusCode: 200,
            message: 'Login successful',
            data: {
                ...tokens,
                student_id,
            },
        };
    }

    async generateTokens(userId: number, student_id: string): Promise<{
        access_token: string;
        refresh_token: string;
    }> {
        const payload = {
            sub: userId,
            student_id,
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
        } catch (err) {
            throw new UnauthorizedException('Invalid access token');
        }

        const student_id = decoded.student_id;
        const stored = await this.redisService.getRefreshToken(student_id);

        if (!stored || stored !== refreshToken) {
            throw new UnauthorizedException('Invalid or missing refresh token');
        }

        const user = await this.userRepository.findOne({ where: { student_id } });
        if (!user) throw new UnauthorizedException('User not found');

        const tokens = await this.generateTokens(user.id, student_id);
        await this.redisService.setRefreshToken(student_id, tokens.refresh_token);

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
        } catch (err) {
            throw new UnauthorizedException('Invalid access token');
        }

        await this.redisService.deleteRefreshToken(decoded.student_id);

        return {
            statusCode: 200,
            message: 'Logged out successfully',
        };
    }
}
