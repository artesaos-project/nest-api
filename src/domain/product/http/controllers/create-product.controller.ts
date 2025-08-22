import {
  BadRequestException, Body, Controller, NotFoundException, Post, UseGuards,
} from '@nestjs/common';
import { CreateProductUseCase } from '../../core/use-cases/create-product.use-case';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { UserRole } from '@/domain/identity/core/entities/user.entity';
import { CreateProductDto } from '../dtos/create-product.dto';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { UserNotFoundError } from '@/domain/identity/core/errors/user-not-found.error';
import { ProductCategoryNotFound } from '../../core/errors/product-category-not-found.error';

@Controller('products')
@UseGuards(RolesGuard)
export class CreateProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
  ) {}

  @Post()
  @Roles(UserRole.ARTISAN)
  async handle(
    @CurrentUser() artisan: UserPayload,
    @Body() body: CreateProductDto,
  ) {
    const result = await this.createProductUseCase.execute({ ...body, artisanId: artisan.sub });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        case ProductCategoryNotFound:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
    return result.value;
  }
}
