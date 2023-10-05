import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Post,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { isEmail } from 'class-validator';
import { Public } from './auth.guard';
import { UsersService } from 'src/users/users.service';
import { User } from '@queueoverflow/shared/entities';
import { Response } from '@queueoverflow/shared/utils';
import {
  CheckUserDto,
  SignInDto,
  SignUpDto,
  RefreshDto,
} from '@queueoverflow/shared/dtos';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @Get()
  async checkUser(@Query() checkUserDto: CheckUserDto) {
    const email = Buffer.from(checkUserDto.email, 'base64').toString('ascii');
    if (!isEmail(email)) {
      throw new HttpException('Invalid email address', HttpStatus.BAD_REQUEST);
    }
    const user = await this.usersService.checkUser({ email });
    if (!user) {
      throw new HttpException(
        'Unregistered email address',
        HttpStatus.FORBIDDEN,
      );
    }

    return new Response<
      Pick<User, 'first_name' | 'last_name' | 'id' | 'email'>
    >({ code: 200, success: true, data: user, message: 'Available user' });
  }

  @Public()
  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    const res = await this.authService.signIn(signInDto);
    return new Response<any>({
      code: 200,
      success: true,
      data: res,
      message: 'Signed in successfully',
    });
  }

  @Public()
  @Post('sign-in/renew-password')
  async signInWithRenewPassword(@Body() signInDto: SignInDto) {
    const res = await this.authService.signInWithRenewPassword(signInDto);
    return new Response<any>({
      code: 200,
      success: true,
      data: res,
      message: 'Signed in successfully',
    });
  }

  @Public()
  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    const res = await this.authService.signUp(signUpDto);
    return new Response<any>({
      code: 201,
      success: true,
      data: res,
      message: 'Signed up successfully',
    });
  }

  @Public()
  @Post('sign-up/password')
  async createPassword(@Body() checkUserDto: CheckUserDto) {
    await this.authService.createPassword(checkUserDto);
    return new Response<any>({
      code: 201,
      success: true,
      message: 'Password has been sent successfully',
    });
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshDto) {
    const res = await this.authService.refresh(refreshDto);
    return new Response<any>({
      code: 200,
      success: true,
      data: res,
      message: 'Refreshed successfully',
    });
  }
}
