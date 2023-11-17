import {
  IsString,
  IsEmail,
  Length,
  ArrayMinSize,
  IsOptional,
  IsArray,
} from "class-validator";
import { Role } from "../../entities/user.entity";

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
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  urls?: any[];

  @IsOptional()
  meta_data?: any;
}
