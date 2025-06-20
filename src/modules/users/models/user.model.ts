import { 
  Table, 
  Column, 
  Model, 
  DataType, 
  BelongsTo, 
  ForeignKey, 
  BeforeCreate,
  BeforeUpdate,
  Default,
  HasOne
} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { Role } from '../../roles/models/role.model';
import { Exclude } from 'class-transformer';

interface UserAttributes {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  codigo_estudiante?: string | null;
  role_id: number;
  activo?: boolean;
}

@Table({
  tableName: 'users',
  timestamps: false,
})
export class User extends Model<UserAttributes> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare nombre: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare apellido: string;

  @Column({
    type: DataType.STRING(150),
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Exclude()
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    unique: true,
  })
  declare codigo_estudiante: string | null;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare role_id: number;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare activo: boolean;

  @BelongsTo(() => Role)
  role: Role;

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    if (user.password && user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}