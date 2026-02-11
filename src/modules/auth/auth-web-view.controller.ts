/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AuthWebViewController {
  // ROOT URL → login
  @Get()
  @Render('layouts/auth')
  root() {
    return {
      title: 'Login',
      body: 'auth/login',
    };
  }

  @Get('auth/login')
  @Render('layouts/auth')
  loginView() {
    return {
      title: 'Login',
      body: 'auth/login',
    };
  }

  @Get('auth/register')
  @Render('layouts/auth')
  registerView() {
    return {
      title: 'Register',
      body: 'auth/register',
    };
  }
}
