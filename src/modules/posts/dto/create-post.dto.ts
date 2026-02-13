import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const EmptyToUndefined = () =>
  Transform(({ value }) => (value === '' ? undefined : value));

export class CreatePostDto {
  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  paragraph: string;
}
