import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from './entities/register-user.entity';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from 'src/users/entities/student.entity';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from './redis.service';
import { HttpResponse } from 'src/shared/interfaces/http-response.interface';
import { LoginDto } from './dtos/login.dto';

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

    async register(registerDto: RegisterDto): Promise<HttpResponse<null>> {
        const { email, student_id, password } = registerDto;

        const student = await this.studentRepository.findOne({ where: { student_id: Number(student_id) } });
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

    async login(loginDto: LoginDto): Promise<HttpResponse<{ access_token: string; refresh_token: string }>> {
        const { student_id, password } = loginDto;

        const user = await this.userRepository.findOne({ where: { student_id } });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.generateTokens(user.id, student_id);
        await this.redisService.setRefreshToken(student_id, tokens.refresh_token);

        return {
            statusCode: 200,
            message: 'Login successful',
            data: tokens,
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

        return {
            access_token,
            refresh_token,
        };
    }

    async refreshTokens(
        student_id: string,
        refreshToken: string,
    ): Promise<HttpResponse<{ access_token: string; refresh_token: string }>> {
        const stored = await this.redisService.getRefreshToken(student_id);
        if (!stored || stored !== refreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }


        const user = await this.userRepository.findOne({ where: { student_id } });
        if (!user) throw new UnauthorizedException();

        const tokens = await this.generateTokens(user.id, student_id);
        await this.redisService.setRefreshToken(student_id, tokens.refresh_token);

        return {
            statusCode: 200,
            message: 'Tokens refreshed successfully',
            data: tokens,
        };
    }

    async logout(student_id: string): Promise<HttpResponse<null>> {
        await this.redisService.deleteRefreshToken(student_id);
        return {
            statusCode: 200,
            message: 'Logged out successfully',
        };
    }
}
