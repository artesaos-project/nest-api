import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { loggerConfig } from './shared/logger/logger-config';
import { EnvService } from './shared/env/env.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: loggerConfig,
    });

    app.use(cookieParser());

    const envService = app.get(EnvService);
    const frontendUrl = envService.get('FRONTEND_URL') || '*';

    app.enableCors({
      origin: frontendUrl,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    const port = envService.get('PORT');

    process.on('SIGTERM', async () => {
      logger.log('SIGTERM received, shutting down gracefully');
      await app.close();
      process.exit(0);
    });

    app.useGlobalPipes(new ValidationPipe());

    await app.listen(port);
    logger.log(`🚀 Application running on port ${port}`);
  } catch (error) {
    logger.error('❌ Failed to start application:', error.message);

    if (error.code === 'P1001') {
      logger.error('🔴 Database connection failed. Please check:');
      logger.error('   - PostgreSQL is running');
      logger.error('   - Connection string is correct');
      logger.error('   - Database credentials are valid');
    } else if (error.code === 'P2021') {
      logger.error('🔴 Database table missing. Please run:');
      logger.error('   npx prisma migrate dev');
      logger.error('   npx prisma generate');
    }

    process.exit(1);
  }
}

bootstrap();
