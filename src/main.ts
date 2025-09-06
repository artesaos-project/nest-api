import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { Env } from './shared/env/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(cookieParser());
  const configService = app.get<ConfigService<Env, true>>(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  const port = configService.get('PORT', { infer: true });

  await app.listen(port);
}
bootstrap();
