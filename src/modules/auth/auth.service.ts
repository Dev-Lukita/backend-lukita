import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/models/user.model';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      return null;
    }
    return user;
  }

  async login(user: any) {
    // Si el usuario no tiene el rol cargado, lo recargamos
    if (!user.role || !user.role.nombre) {
      console.log('Rol no cargado en login, recargando usuario...');
      user = await this.usersService.findOne(user.id);
    }

    // Verificación adicional
    if (!user.role || !user.role.nombre) {
      throw new Error('No se pudo cargar el rol del usuario');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role.nombre,
      nombre: user.nombre,
      apellido: user.apellido,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        codigo_estudiante: user.codigo_estudiante,
        role: user.role.nombre,
        activo: user.activo,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    try {
      console.log('Iniciando registro con datos:', createUserDto);
      
      // Crear el usuario
      const user = await this.usersService.create(createUserDto);
      console.log('Usuario creado con ID:', user.id);
      
      // Si el rol no está cargado, recargar el usuario
      let userWithRole = user;
      if (!user.role) {
        console.log('Rol no cargado, recargando usuario...');
        userWithRole = await this.usersService.findOne(user.id);
      }
      
      console.log('Usuario con rol:', {
        id: userWithRole.id,
        email: userWithRole.email,
        role: userWithRole.role ? userWithRole.role.nombre : 'SIN ROL'
      });

      // Generar token y respuesta
      return this.login(userWithRole);
    } catch (error) {
      console.error('Error en register:', error);
      throw error;
    }
  }

  async getProfile(userId: number) {
    return this.usersService.findOne(userId);
  }


}