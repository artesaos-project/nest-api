import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './domain/identity/user/user.module';
import { envSchema } from './shared/env/env';
import { TestModule }  from './domain/test/test.module';
import { RolesGuard } from './shared/roles/roles.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [ConfigModule.forRoot({
    validate: (env) => envSchema.parse(env),
    isGlobal: true,
  }), 
  UserModule,
  TestModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,  
    },
      AppService,
  ]
})
export class AppModule {}
