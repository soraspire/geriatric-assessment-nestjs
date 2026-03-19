import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: 'https://danhgialaokhoa.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Body Parser config for nested objects
  const express = require('express');
  app.use(express.json());
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors) => {
      const errorMessages = {};
      errors.forEach((err) => {
        if (err.children && err.children.length > 0) {
          errorMessages[err.property] = errorMessages[err.property] || {};
          err.children.forEach((child) => {
            const childErrors = Object.values(child.constraints || {});
            if (childErrors.length > 0) {
              errorMessages[err.property][child.property] = childErrors[0];
            }
          });
        } else {
          const constraints = Object.values(err.constraints || {});
          if (constraints.length > 0) {
            errorMessages[err.property] = constraints[0];
          }
        }
      });
      return new BadRequestException({ errorMessages, isValidationError: true });
    },
  }));

  // Session & Passport
  app.use(
    session({
      secret: 'my-secret', // Use a real secret in production
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
