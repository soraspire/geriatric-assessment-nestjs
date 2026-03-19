import { Controller, Get, Post, Render, Res, Request, UseGuards, UseFilters } from '@nestjs/common';
import { LocalAuthGuard, LoginGuard } from './local-auth.guard';

@Controller()
export class AuthController {
  @Get('login')
  @UseGuards(LoginGuard)
  @Render('auth/login')
  showLoginForm() {
    return { title: 'Đăng nhập' };
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req, @Res() res) {
    return res.redirect('/assessments/management');
  }

  @Get('logout')
  @Post('logout')
  logout(@Request() req, @Res() res) {
    req.logout((err) => {
      if (err) return res.send(err);
      res.redirect('/login');
    });
  }
}
