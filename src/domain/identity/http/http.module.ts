import { Module } from '@nestjs/common';
import { CreateAccountController } from './controllers/create-account.controller';
import { CreateAccountUseCase } from '../core/use-cases/create-account.use-case';
import { IdentityPersistenceModule } from '../persistence/identity-persistence.module';
import { CryptographyModule } from '@/shared/cryptography/cryptography.module';
import { AuthenticateController } from './controllers/authenticate.controller';
import { AuthenticateUseCase } from '../core/use-cases/authenticate.use-case';
import { AddModeratorRoleController } from './controllers/update-user-to-moderator.controller';
import { AddModeratorRoleUseCase } from '../core/use-cases/add-moderator-role.use-case';
import { DeactivateUserController } from './controllers/deactivate-user.controller';
import { DeactivateUserUseCase } from '../core/use-cases/deactivate-user.use-case';
import { GetAllUsersUseCase } from '../core/use-cases/gel-all-users.use-case';
import { GetAllUsersController } from './controllers/get-all-users.controller';
import { UpdatePersonalProfileDataUseCase } from '../core/use-cases/update-personal-profile-data.use-case';
import { UpdatePersonalProfileDataController } from './controllers/update-personal-profile-data.controller';
import { CreateArtisanApplicationController } from './controllers/create-artisan-application.controller';
import { CreateArtisanApplicationUseCase } from '../core/use-cases/create-artisan-application.use-case';

@Module({
  imports: [IdentityPersistenceModule, CryptographyModule],
  controllers: [
    AddModeratorRoleController,
    AuthenticateController,
    CreateAccountController,
    DeactivateUserController,
    GetAllUsersController,
    UpdatePersonalProfileDataController,

    // ArtisanModule,
    CreateArtisanApplicationController,
  ],
  providers: [
    AddModeratorRoleUseCase,
    AuthenticateUseCase,
    CreateAccountUseCase,
    DeactivateUserUseCase,
    GetAllUsersUseCase,
    UpdatePersonalProfileDataUseCase,

    // ArtisanModule,
    CreateArtisanApplicationUseCase,
  ],
})
export class HttpModule {}
