import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() body: { loginDto: LoginDto }) {
    return this.authService.login(body.loginDto);
  }

  @Post('refresh')
  refresh(@Body() body: { student_id: string; refreshToken: string }) {
    return this.authService.refreshTokens(body.student_id, body.refreshToken);
  }

  @Post('logout')
  logout(@Body() body: { student_id: string }) {
    return this.authService.logout(body.student_id);
  }
}
