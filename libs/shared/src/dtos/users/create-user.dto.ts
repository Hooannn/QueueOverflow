import {
  IsString,
  IsEmail,
  Length,
  ArrayMinSize,
  IsOptional,
} from "class-validator";
import { Role } from "../../entities";

export class CreateUserDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @Length(6, 6)
  @IsString()
  password: string;

  @IsOptional()
  @ArrayMinSize(1)
  roles?: Role[];

  @IsOptional()
  meta_data?: any;
}
