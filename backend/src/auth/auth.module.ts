import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Student } from 'src/users/entities/student.entity';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from './redis.service';
import { JwtStrategy } from './guards/jwt.strategy';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Student]), JwtModule.register({
    secret: process.env.JWT_ACCESS_SECRET || 'ACCESS_SECRET_KEY',
    signOptions: { expiresIn: '15m' },
  })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RedisService],
})
export class AuthModule { }
