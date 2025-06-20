import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { RolesService } from '../../modules/roles/roles.service';
import { UsersService } from '../../modules/users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const rolesService = app.get(RolesService);
  const usersService = app.get(UsersService);

  try {
    // Crear roles iniciales
    console.log('Creando roles...');
    await rolesService.seedRoles();
    
    // Crear usuario administrador inicial (coordinador)
    console.log('Creando usuario administrador...');
    const adminExists = await usersService.findByEmail('admin@luka.com');
    
    if (!adminExists) {
      await usersService.create({
        nombre: 'Admin',
        apellido: 'Sistema',
        email: 'admin@luka.com',
        password: 'Admin123!',
        role: 'coordinador',
      });
      console.log('Usuario administrador creado exitosamente');
    }

    console.log('Seed completado exitosamente');
  } catch (error) {
    console.error('Error durante el seed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();