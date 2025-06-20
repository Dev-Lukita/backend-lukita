import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MaxLength(50)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  descripcion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  permisos?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}