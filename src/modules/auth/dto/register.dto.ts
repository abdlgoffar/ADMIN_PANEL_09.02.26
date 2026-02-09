import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from 'src/modules/users/user-role.enum';

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
  role: UserRole;
}
