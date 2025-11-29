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
import { ToggleArtisanFollowController } from './controllers/toggle-artisan-follow.controller';
import { GetArtisanFollowStatusController } from './controllers/get-artisan-follow-status.controller';
import { ListUserFollowingController } from './controllers/list-artisan-following.controller';
import { ListArtisanFollowersController } from './controllers/list-artisan-followers.controller';
import { ToggleArtisanFollowUseCase } from '../core/use-cases/toggle-artisan-follow.usecase';
import { ListArtisanFollowersUseCase } from '../core/use-cases/list-artisan-followers.use-case';
import { ListArtisanFollowingUseCase } from '../core/use-cases/list-artisan-following.use-case';
import { GetArtisanFollowStatusUseCase } from '../core/use-cases/get-artisan-follow-status.use-case';
import { GetArtisanProfileByUsernameController } from './controllers/get-artisan-profile-by-username.controller';
import { GetArtisanProfileByUsernameUseCase } from '../core/use-cases/get-artisan-profile-by-username.use-case';
import { UpdatePersonalProfileDataController } from './controllers/update-personal-profile-data.controller';
import { UpdatePersonalProfileDataUseCase } from '../core/use-cases/update-personal-profile-data.use-case';
import { UpdateArtisanProfileUseCase } from '../core/use-cases/update-artisan-profile.use-case';
import { GetMyProfileController } from './controllers/get-my-profile.controller';
import { GetMyProfileUseCase } from '../core/use-cases/get-my-profile.use-case';
import { DeleteAccountController } from './controllers/delete-account.controller';
import { DeleteAccountUseCase } from '../core/use-cases/delete-account.use-case';
import { UpdateOwnPasswordController } from './controllers/update-own-password.controller';
import { UpdateOwnPasswordUseCase } from '../core/use-cases/update-own-password.use-case';
import { ChangeUserPasswordByAdminUseCase } from '../core/use-cases/change-user-password-by-admin.use-case';
import { ChangeUserPasswordByAdminController } from './controllers/chenge-user-password-by-admin.controller';
import { ListAdminUsersUseCase } from '../core/use-cases/list-admin-users.use-case';
import { ListAdminUsersController } from './controllers/list-admin-users.controller';
import { LogoutUseCase } from '../core/use-cases/logout.use-case';
import { UpdateProvisionalPasswordController } from './controllers/update-provisional-password.controller';
import { UpdateProvisionalPasswordUseCase } from '../core/use-cases/update-provisional-password.use-case';

@Module({
  imports: [RepositoriesModule, AttachmentsModule],
  controllers: [
    AuthenticateController,
    CompleteArtisanApplicationController,
    CreateUserController,
    DeleteAccountController,
    GetAllArtisanApplicationsController,
    GetArtisanApplicationDetailsController,
    GetArtisanProfileByUsernameController,
    GetMyProfileController,
    InitiateArtisanApplicationController,
    ModerateArtisanApplicationController,
    SearchUsersController,
    ListUserFollowingController,
    ListArtisanFollowersController,
    ToggleArtisanFollowController,
    GetArtisanFollowStatusController,
    UpdateOwnPasswordController,
    UpdatePersonalProfileDataController,
    ChangeUserPasswordByAdminController,
    UpdateProvisionalPasswordController,
    ListAdminUsersController,
  ],
  providers: [
    AuthenticateUseCase,
    LogoutUseCase,
    CompleteArtisanApplicationUseCase,
    CreateUserUseCase,
    DeleteAccountUseCase,
    GetAllArtisanApplicationsUseCase,
    GetArtisanProfileByUsernameUseCase,
    GetArtisanApplicationDetailsUseCase,
    GetMyProfileUseCase,
    InitiateArtisanApplicationUseCase,
    ModerateArtisanApplicationUseCase,
    SearchUsersUseCase,
    AuthenticateUseCase,
    GetArtisanApplicationDetailsUseCase,
    ModerateArtisanApplicationUseCase,
    ToggleArtisanFollowUseCase,
    ListArtisanFollowersUseCase,
    ListArtisanFollowingUseCase,
    GetArtisanFollowStatusUseCase,
    UpdateArtisanProfileUseCase,
    UpdateOwnPasswordUseCase,
    UpdatePersonalProfileDataUseCase,
    ChangeUserPasswordByAdminUseCase,
    ListAdminUsersUseCase,
    UpdateProvisionalPasswordUseCase,
  ],
})
export class HttpModule {}
