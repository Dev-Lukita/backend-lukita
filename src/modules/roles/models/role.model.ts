import { Table, Column, Model, DataType, HasMany, Default } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';

interface RoleAttributes {
  id?: number;
  nombre: string;
  descripcion?: string;
  permisos?: string;
  activo?: boolean;
}

@Table({
  tableName: 'roles',
  timestamps: false,
})
export class Role extends Model<RoleAttributes> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  declare nombre: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  declare descripcion: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare permisos: string;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare activo: boolean;

  @HasMany(() => User)
  users: User[];
}