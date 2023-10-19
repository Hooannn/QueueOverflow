import {
  IsString,
  IsEmail,
  Length,
  IsBoolean,
  ArrayMinSize,
  IsOptional,
  IsNumber,
  IsArray,
} from "class-validator";

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  publish?: boolean;

  @IsArray()
  @IsOptional()
  topics?: { id: string }[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  meta_data?: any;
}
