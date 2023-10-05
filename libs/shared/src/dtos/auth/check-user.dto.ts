import { IsString } from 'class-validator'

export class CheckUserDto {
  @IsString()
  readonly email: string
}
