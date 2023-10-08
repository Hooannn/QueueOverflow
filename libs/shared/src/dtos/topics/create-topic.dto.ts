import {
  IsString,
  IsEmail,
  Length,
  ArrayMinSize,
  IsOptional,
  IsBoolean,
} from "class-validator";

export class CreateTopicDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  publish?: boolean;

  @IsOptional()
  meta_data?: any;
}
