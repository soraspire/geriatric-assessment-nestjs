import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs';
import * as session from 'express-session';
import * as passport from 'passport';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.set('view options', { layout: 'layouts/main' });

  // Body Parser config for nested objects
  const express = require('express');
  app.use(express.json());
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Handlebars Helpers
  hbs.registerHelper('eq', (a, b) => {
    if (Array.isArray(a)) return a.includes(b.toString());
    return a === b || a === b.toString();
  });
  hbs.registerHelper('gt', (a, b) => Number(a) > Number(b));
  hbs.registerHelper('lt', (a, b) => Number(a) < Number(b));
  hbs.registerHelper('gte', (a, b) => Number(a) >= Number(b));
  hbs.registerHelper('lte', (a, b) => Number(a) <= Number(b));
  hbs.registerHelper('calculateAge', (birthYear) => {
    return new Date().getFullYear() - Number(birthYear);
  });
  hbs.registerHelper('includes', (arr, val) => {
    if (!Array.isArray(arr)) return false;
    return arr.includes(val);
  });
  hbs.registerHelper('add', (a, b) => Number(a) + Number(b));
  hbs.registerHelper('subtract', (a, b) => Number(a) - Number(b));
  hbs.registerHelper('multiply', (a, b) => Number(a) * Number(b));
  hbs.registerHelper('range', (start, end) => {
    const range = [];
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  // Session & Passport
  app.use(
    session({
      secret: 'my-secret', // Use a real secret in production
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 3600000 },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Global flash data for templates
  app.use((req: any, res: any, next: any) => {
    res.locals.user = req.user;
    res.locals.errors = req.session.errors || null;
    res.locals.old = req.session.old || null;
    req.session.errors = null;
    req.session.old = null;
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
