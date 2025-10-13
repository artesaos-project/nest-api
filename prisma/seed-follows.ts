/* eslint-disable no-console */
import { PrismaClient, Roles } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed Follows: starting...');

  // Imports dinâmicos conforme o padrão do projeto
  const { PrismaService } = await import('../src/shared/prisma/prisma.service');
  const { ArtisanFollowersRepository } = await import('../src/domain/repositories/artisan-followers.repository');
  const { ToggleArtisanFollowUseCase } = await import('../src/domain/identity/core/use-cases/toggle-artisan-follow.usecase');

  // Instâncias
  const prismaService = new PrismaService();
  await prismaService.onModuleInit();

  const followersRepo = new ArtisanFollowersRepository(prismaService);
  const toggleFollowUC = new ToggleArtisanFollowUseCase(followersRepo, prismaService);

  console.log('🧹 Limpando tabelas antes da seed...');

  await prisma.productLike.deleteMany();
  await prisma.product.deleteMany();
  await prisma.artisanFollower.deleteMany();
  await prisma.artisanProfile.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  const senha = await hash('123456', 10);

  // Criação dos usuários base
  const [user, admin, artisan1, artisan2] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'user@test.com',
        password: senha,
        roles: [Roles.USER],
        name: 'User Client',
        phone: '12996575861',
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: senha,
        roles: [Roles.ADMIN],
        name: 'Admin User',
        phone: '12996575862',
      },
    }),
    prisma.user.create({
      data: {
        email: 'artisan1@test.com',
        password: senha,
        roles: [Roles.ARTISAN],
        name: 'Artisan One',
        phone: '12996575863',
      },
    }),
    prisma.user.create({
      data: {
        email: 'artisan2@test.com',
        password: senha,
        roles: [Roles.ARTISAN],
        name: 'Artisan Two',
        phone: '12996575864',
      },
    }),
  ]);

  // Criação dos perfis (UserProfile)
  await Promise.all([
    prisma.userProfile.create({ data: { userId: user.id, phone: '+5511987650001' } }),
    prisma.userProfile.create({ data: { userId: admin.id, phone: '+5511987650002' } }),
    prisma.userProfile.create({ data: { userId: artisan1.id, phone: '+5511987650003' } }),
    prisma.userProfile.create({ data: { userId: artisan2.id, phone: '+5511987650004' } }),
  ]);

  // Criação dos perfis de artesão
  const [artisanProfile1, artisanProfile2] = await Promise.all([
    prisma.artisanProfile.create({
      data: {
        userId: artisan1.id,
        artisanUserName: 'artesanum1',
        rawMaterial: ['madeira', 'metal'],
        technique: ['escultura', 'soldagem'],
        finalityClassification: ['decorativo', 'utilitario'],
        sicab: 'SICAB001',
        sicabRegistrationDate: new Date('2023-01-01'),
        sicabValidUntil: new Date('2025-01-01'),
        bio: 'Artesão especializado em madeira e metal',
      },
    }),
    prisma.artisanProfile.create({
      data: {
        userId: artisan2.id,
        artisanUserName: 'artesanum2',
        rawMaterial: ['cerâmica', 'argila'],
        technique: ['tornear'],
        finalityClassification: ['decorativo', 'utensílio'],
        sicab: 'SICAB002',
        sicabRegistrationDate: new Date('2023-02-01'),
        sicabValidUntil: new Date('2025-02-01'),
        bio: 'Artesã especialista em cerâmica e argila',
      },
    }),
  ]);

  // Testando o caso de uso ToggleArtisanFollowUseCase
  console.log('\n🔹 Testando follow/unfollow...');

  const result1 = await toggleFollowUC.execute(user.id, artisanProfile1.userId);
  console.log('User seguiu artisan1:', result1);

  const result2 = await toggleFollowUC.execute(admin.id, artisanProfile1.userId);
  console.log('Admin seguiu artisan1:', result2);

  const result3 = await toggleFollowUC.execute(user.id, artisanProfile2.userId);
  console.log('User seguiu artisan2:', result3);

  const result4 = await toggleFollowUC.execute(user.id, artisanProfile2.userId);
  console.log('User deixou de seguir artisan2:', result4);

  const artisan1Followers = await prisma.artisanFollower.count({
    where: { followingId: artisanProfile1.userId },
  });
  const artisan2Followers = await prisma.artisanFollower.count({
    where: { followingId: artisanProfile2.userId },
  });

  console.log('\n📊 Resultado final:');
  console.table({
    artisan1_followers: artisan1Followers,
    artisan2_followers: artisan2Followers,
  });

  console.log('✅ Seed Follows concluída com sucesso.');

  await prismaService.onModuleDestroy();
}

main()
  .catch((e) => {
    console.error('❌ Seed Follows error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
