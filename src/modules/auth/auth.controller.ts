import { 
  Controller, 
  Post, 
  UseGuards, 
  Body, 
  Get,
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    console.log('Datos recibidos para registro:', createUserDto);
    try {
      const result = await this.authService.register(createUserDto);
      console.log('Usuario registrado exitosamente');
      return result;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Body() loginUserDto: LoginUserDto) {
    console.log('Usuario autenticado:', JSON.stringify({
      id: req.user.id,
      email: req.user.email,
      hasRole: !!req.user.role,
      roleName: req.user.role?.nombre
    }));
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user) {
    return this.authService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    // En una implementación real, aquí podrías invalidar el token
    // Por ahora, el cliente simplemente debe eliminar el token
    return { message: 'Sesión cerrada exitosamente' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  async validateToken(@CurrentUser() user) {
    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        role: user.role,
      },
    };
  }
}