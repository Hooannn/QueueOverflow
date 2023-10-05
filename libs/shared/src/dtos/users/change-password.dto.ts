import { IsString, Length } from 'class-validator'

export class ChangePasswordDto {
  @Length(6, 6)
  @IsString()
  current_password: string

  @Length(6, 6)
  @IsString()
  new_password: string
}
