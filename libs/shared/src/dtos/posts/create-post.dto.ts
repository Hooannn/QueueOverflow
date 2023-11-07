import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
} from "class-validator";
import { PostType } from "../../entities";

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsEnum(PostType)
  type: PostType;

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
