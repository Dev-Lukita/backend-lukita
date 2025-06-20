import { 
  Injectable, 
  ConflictException, 
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../roles/models/role.model';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @Inject(forwardRef(() => RolesService))
    private rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el email ya existe
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar si el código de estudiante ya existe (si se proporciona)
    if (createUserDto.codigo_estudiante) {
      const existingCode = await this.userModel.findOne({
        where: { codigo_estudiante: createUserDto.codigo_estudiante },
      });
      if (existingCode) {
        throw new ConflictException('El código de estudiante ya está registrado');
      }
    }

    // Obtener el rol
    let role;
    try {
      role = await this.rolesService.findByName(createUserDto.role);
    } catch (error) {
      throw new BadRequestException(`Rol '${createUserDto.role}' no encontrado`);
    }

    // Validar que si es estudiante, debe tener código de estudiante
    if (role.nombre === 'estudiante' && !createUserDto.codigo_estudiante) {
      throw new BadRequestException('Los estudiantes deben proporcionar un código de estudiante');
    }

    try {
      const user = await this.userModel.create({
        nombre: createUserDto.nombre,
        apellido: createUserDto.apellido,
        email: createUserDto.email,
        password: createUserDto.password,
        codigo_estudiante: createUserDto.codigo_estudiante,
        role_id: role.id,
        activo: true,
      });

      // Forzar la recarga del usuario con todas sus relaciones
      await user.reload({
        include: [
          {
            model: Role,
            attributes: ['id', 'nombre', 'descripcion', 'permisos'],
          },
        ],
      });

      return user;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('El usuario ya existe');
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll({
      where: { activo: true },
      include: [
        {
          model: Role,
          attributes: ['id', 'nombre', 'descripcion'],
        },
      ],
      attributes: { exclude: ['password'] },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id, {
      include: [
        {
          model: Role,
          attributes: ['id', 'nombre', 'descripcion', 'permisos'],
        },
      ],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { email },
      include: [
        {
          model: Role,
          attributes: ['id', 'nombre', 'descripcion', 'permisos'],
        },
      ],
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { email },
      include: [
        {
          model: Role,
          attributes: ['id', 'nombre', 'descripcion', 'permisos'],
        },
      ],
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmailWithPassword(email);
    
    if (!user || !user.activo) {
      return null;
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return null;
    }

    // Asegurarse de que el rol esté cargado
    if (!user.role) {
      await user.reload({
        include: [
          {
            model: Role,
            attributes: ['id', 'nombre', 'descripcion', 'permisos'],
          },
        ],
      });
    }

    return user;
  }

  async update(id: number, updateUserDto: Partial<CreateUserDto>): Promise<User> {
    const user = await this.findOne(id);
    
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    await user.update(updateUserDto);
    return this.findOne(id);
  }

  async deactivate(id: number): Promise<void> {
    const user = await this.findOne(id);
    await user.update({ activo: false });
  }
}