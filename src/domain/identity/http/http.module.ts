import { Module } from '@nestjs/common';
import { AuthenticateUseCase } from '../core/use-cases/authenticate.use-case';
import { GetArtisanApplicationDetailsUseCase } from '../core/use-cases/get-artisan-application-details.use-case';
import { ModerateArtisanApplicationUseCase } from '../core/use-cases/moderate-artisan-application.use-case';
import { SearchUsersUseCase } from '../core/use-cases/search-users.use-case';
import { InitiateArtisanApplicationUseCase } from '../core/use-cases/initiate-artisan-application.use-case';
import { GetAllArtisanApplicationsUseCase } from '../core/use-cases/get-all-artisan-applications.use-case';
import { CreateUserUseCase } from '../core/use-cases/create-user.use-case';
import { CompleteArtisanApplicationUseCase } from '../core/use-cases/complete-artisan-application.use-case';
import { RepositoriesModule } from '@/domain/repositories/repositories.module';
import { AttachmentsModule } from '@/domain/attachments/attachments.module';
import { AuthenticateController } from './controllers/authenticate.controller';
import { CompleteArtisanApplicationController } from './controllers/complete-artisan-application.controller';
import { CreateUserController } from './controllers/create-user.controller';
import { GetAllArtisanApplicationsController } from './controllers/get-all-artisan-applications.controller';
import { GetArtisanApplicationDetailsController } from './controllers/get-artisan-application-details.controller';
import { InitiateArtisanApplicationController } from './controllers/initiate-artisan-application.controller';
import { ModerateArtisanApplicationController } from './controllers/moderate-artisan-application.controller';
import { SearchUsersController } from './controllers/search-users.controller';
import { ToggleArtisanFollowController } from './controllers/artisan-followers.controller';
import { GetArtisanFollowStatusController } from './controllers/get-artisan-follow-status.controller';
import { ListUserFollowingController } from './controllers/list-artisan-following.controller';
import { ListArtisanFollowersController } from './controllers/list-artisan-followers.controller';
import { ToggleArtisanFollowUseCase } from '../core/use-cases/toggle-artisan-follow.usecase';

@Module({
  imports: [RepositoriesModule, AttachmentsModule],
  controllers: [
    AuthenticateController,
    CompleteArtisanApplicationController,
    CreateUserController,
    GetAllArtisanApplicationsController,
    GetArtisanApplicationDetailsController,
    InitiateArtisanApplicationController,
    ModerateArtisanApplicationController,
    SearchUsersController,
    ListUserFollowingController,
    ListArtisanFollowersController,
    ToggleArtisanFollowController,
    GetArtisanFollowStatusController,
  ],
  providers: [
    AuthenticateUseCase,
    CompleteArtisanApplicationUseCase,
    CreateUserUseCase,
    GetAllArtisanApplicationsUseCase,
    GetArtisanApplicationDetailsUseCase,
    InitiateArtisanApplicationUseCase,
    ModerateArtisanApplicationUseCase,
    SearchUsersUseCase,
    AuthenticateUseCase,
    GetArtisanApplicationDetailsUseCase,
    ModerateArtisanApplicationUseCase,
    ToggleArtisanFollowUseCase,
  ],
})
export class HttpModule {}
