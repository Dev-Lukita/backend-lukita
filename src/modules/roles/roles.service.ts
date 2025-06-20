import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './models/role.model';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role)
    private roleModel: typeof Role,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      return await this.roleModel.create(createRoleDto as any);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('El rol ya existe');
      }
      throw error;
    }
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.findAll({
      where: { activo: true },
    });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleModel.findByPk(id);
    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return role;
  }

  async findByName(nombre: string): Promise<Role> {
    const role = await this.roleModel.findOne({
      where: { nombre },
    });
    if (!role) {
      throw new NotFoundException(`Rol ${nombre} no encontrado`);
    }
    return role;
  }

  async seedRoles(): Promise<void> {
    const roles = [
      {
        nombre: 'estudiante',
        descripcion: 'Usuario estudiante del sistema',
        permisos: JSON.stringify(['view_balance', 'transfer_lukitas', 'view_promotions']),
      },
      {
        nombre: 'coordinador',
        descripcion: 'Coordinador de campañas',
        permisos: JSON.stringify(['manage_campaign', 'send_lukitas', 'view_reports']),
      },
    ];

    for (const role of roles) {
      await this.roleModel.findOrCreate({
        where: { nombre: role.nombre },
        defaults: role as any,
      });
    }
  }
}