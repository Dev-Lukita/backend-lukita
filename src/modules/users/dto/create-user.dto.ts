import { 
  IsEmail, 
  IsString, 
  MinLength, 
  MaxLength, 
  IsOptional,
  Matches,
  IsNotEmpty 
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
    },
  )
  password: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  codigo_estudiante?: string;

  @IsString()
  @IsNotEmpty()
  role: string; // Se enviará el nombre del rol, no el ID
}