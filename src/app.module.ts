import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envSchema } from './shared/env/env';
import { TestModule } from './domain/test/test.module';
import { AuthModule } from './domain/_shared/auth/auth.module';
import { HttpModule as IdentityModule } from './domain/identity/http/http.module';
import { HttpModule as AttachmentModule } from './domain/_shared/attachments/http/http.module';
import { HttpModule as ProductHttpModule } from './domain/product/http/http.module';

@Module({
  imports: [ConfigModule.forRoot({
    validate: (env) => envSchema.parse(env),
    isGlobal: true,
  }),
  IdentityModule,
  AuthModule,
  AttachmentModule,
  ProductHttpModule,
  TestModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
