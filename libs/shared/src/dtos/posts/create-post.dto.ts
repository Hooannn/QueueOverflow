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
  @IsNumber()
  upvotes?: number;

  @IsOptional()
  @IsNumber()
  downvotes?: number;

  @IsBoolean()
  publish: boolean;

  @IsArray()
  @IsOptional()
  topics?: { id: string }[];

  @IsOptional()
  meta_data?: any;
}
