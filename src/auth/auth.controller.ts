import { Controller, Get, Post, Res, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard, AuthenticatedGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(AuthenticatedGuard)
  getMe(@Request() req) {
    return req.user;
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    return req.user;
  }

  @Post('logout')
  logout(@Request() req, @Res() res) {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: 'Logout failed', error: err });
      res.json({ message: 'Logged out successfully' });
    });
  }
}
