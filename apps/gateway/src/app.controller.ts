import { Controller, ForbiddenException, Get } from '@nestjs/common';
import { Public } from './auth/auth.guard';
import config from './configs';
import { AuthService } from './auth/auth.service';
import { Role } from '@queueoverflow/shared/entities';
@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get()
  getRoot(): string {
    return 'ok';
  }

  @Public()
  @Get('admin/credentials')
  async getAdminCredentials() {
    if (config.NODE_ENV === 'production') {
      throw new ForbiddenException();
    }
    return await this.authService.getCredentials(-999, [Role.Admin, Role.User]);
  }
}
