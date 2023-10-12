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

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @IsOptional()
  meta_data?: any;

  @IsString()
  recipient_id: string;
}
