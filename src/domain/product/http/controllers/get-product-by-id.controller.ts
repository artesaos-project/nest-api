import {
  BadRequestException, Controller, Get, NotFoundException, Param, UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { UserRole } from '@/domain/identity/core/entities/user.entity';
import { GetProductByIdUseCase } from '../../core/use-cases/get-product-by-id.use-case';
import { ProductIdParamDto } from '../dtos/product-id-param.dto';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';

@Controller('products/:id')
@UseGuards(RolesGuard)
export class GetProductByIdController {
  constructor(
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
  ) {}

  @Get()
  @Roles(UserRole.ARTISAN)
  async handle(
    @Param() param: ProductIdParamDto,
  ) {
    const result = await this.getProductByIdUseCase.execute({ ...param });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ProductNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
