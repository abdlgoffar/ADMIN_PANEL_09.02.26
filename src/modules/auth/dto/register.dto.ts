import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserGender } from 'src/modules/users/entity/user-gender.enum';
import { UserRole } from 'src/modules/users/entity/user-role.enum';

export class RegisterDto {
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  full_name: string;

  //Date of Birth (format: YYYY-MM-DD)
  @IsDateString()
  date_of_birth: string;

  @IsEnum(UserGender)
  gender: UserGender;
}
