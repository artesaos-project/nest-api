import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envSchema } from './shared/env/env';
import { AuthModule } from './domain/_shared/auth/auth.module';
import { HttpModule as IdentityModule } from './domain/identity/http/http.module';
import { AttachmentsModule } from './domain/attachments/attachments.module';
import { HttpProductsModule } from './domain/products/http/http-products.module';
import { CatalogHttpModule } from './domain/catalog/http/catalog-http.module';
import { HttpReportsModule } from './domain/reports/http/http-reports.module';
import { JobsModule } from './shared/job/job.module';

@Module({
  imports: [ConfigModule.forRoot({
    validate: (env) => envSchema.parse(env),
    isGlobal: true,
  }),
  IdentityModule,
  HttpProductsModule,
  AuthModule,
  AttachmentsModule,
  CatalogHttpModule,
  HttpReportsModule,
  JobsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
