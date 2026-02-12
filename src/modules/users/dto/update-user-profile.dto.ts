import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserGender } from 'src/modules/users/entity/user-gender.enum';

import { Transform } from 'class-transformer';

const EmptyToUndefined = () =>
  Transform(({ value }) => (value === '' ? undefined : value));

export class UpdateUserProfileDto {
  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  full_name?: string;

  @IsOptional()
  @EmptyToUndefined()
  @IsEnum(UserGender)
  gender?: UserGender;

  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  bio?: string;

  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  education?: string;

  @IsOptional()
  @EmptyToUndefined()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  address?: string;

  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  skills?: string;

  @IsOptional()
  photo?: any;
}
