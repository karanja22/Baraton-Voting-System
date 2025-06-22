import { Body, Controller, Post, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const accessToken = extractAccessToken(req);
    return this.authService.refreshToken(accessToken, dto.refreshToken);
  }

  @Post('logout')
  logout(@Req() req: Request) {
    const accessToken = extractAccessToken(req);
    return this.authService.logout(accessToken);
  }
}

function extractAccessToken(req: Request): string {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Missing or invalid Authorization header');
  }
  return authHeader.replace('Bearer ', '');
}
