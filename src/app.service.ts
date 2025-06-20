import { Injectable, OnModuleInit } from '@nestjs/common';
import { RolesService } from './modules/roles/roles.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private rolesService: RolesService) {}

  async onModuleInit() {
    try {
      console.log('Inicializando roles...');
      await this.rolesService.seedRoles();
      console.log('Roles inicializados correctamente');
    } catch (error) {
      console.error('Error al inicializar roles:', error);
    }
  }
}