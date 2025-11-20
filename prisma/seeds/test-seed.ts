/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
import { PrismaClient, ReportReason, Roles } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const REPORT_REASONS: ReportReason[] = [
  'INAPPROPRIATE_CONTENT',
  'OFFENSIVE_CONTENT',
  'FALSE_OR_MISLEADING_INFORMATION',
  'COPYRIGHT_VIOLATION',
  'PROHIBITED_ITEM_SALE_OR_DISCLOSURE',
  'INAPPROPRIATE_LANGUAGE',
  'OFF_TOPIC_OR_IRRELEVANT',
  'OTHER',
];

const REPORT_DESCRIPTIONS = [
  'Conteúdo ofensivo e inadequado para a plataforma',
  'Uso de linguagem inapropriada e desrespeitosa',
  'Informações falsas que podem enganar outros usuários',
  'Possível violação de direitos autorais',
  'Venda de item proibido pela plataforma',
  'Comentário fora do contexto e spam',
  'Conteúdo duplicado ou plagiado',
  null,
];

async function clearDatabase() {
  console.log('🧹 Limpando banco de dados...');

  await prisma.reportProductRating.deleteMany({});
  await prisma.reportProduct.deleteMany({});
  await prisma.reportUser.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.productRating.deleteMany({});
  await prisma.productLike.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.artisanFollower.deleteMany({});
  await prisma.artisanProfile.deleteMany({});
  await prisma.userProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Banco de dados limpo\n');
}

async function createUsers() {
  console.log('👥 Criando usuários...');

  const senha = await hash('123456', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'user1@test.com',
        password: senha,
        roles: [Roles.USER],
        name: 'João Silva',
        phone: '11987654321',
      },
    }),
    prisma.user.create({
      data: {
        email: 'user2@test.com',
        password: senha,
        roles: [Roles.USER],
        name: 'Maria Santos',
        phone: '11987654322',
      },
    }),
    prisma.user.create({
      data: {
        email: 'user3@test.com',
        password: senha,
        roles: [Roles.USER],
        name: 'Pedro Oliveira',
        phone: '11987654323',
      },
    }),
    prisma.user.create({
      data: {
        email: 'user4@test.com',
        password: senha,
        roles: [Roles.USER],
        name: 'Ana Costa',
        phone: '11987654324',
      },
    }),
    prisma.user.create({
      data: {
        email: 'user5@test.com',
        password: senha,
        roles: [Roles.USER],
        name: 'Carlos Ferreira',
        phone: '11987654325',
      },
    }),
  ]);

  console.log(`✅ ${users.length} usuários criados\n`);
  return users;
}

async function createArtisans() {
  console.log('🎨 Criando artesãos...');

  const senha = await hash('123456', 10);

  const artisanUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'artisan1@test.com',
        password: senha,
        roles: [Roles.ARTISAN],
        name: 'Artesão Silva',
        phone: '11987654326',
      },
    }),
    prisma.user.create({
      data: {
        email: 'artisan2@test.com',
        password: senha,
        roles: [Roles.ARTISAN],
        name: 'Artesã Maria',
        phone: '11987654327',
      },
    }),
    prisma.user.create({
      data: {
        email: 'artisan3@test.com',
        password: senha,
        roles: [Roles.ARTISAN],
        name: 'Artesão José',
        phone: '11987654328',
      },
    }),
  ]);

  const artisans = await Promise.all(
    artisanUsers.map((user, index) => prisma.artisanProfile.create({
      data: {
        userId: user.id,
        artisanUserName: `artisan${index + 1}`,
        comercialName: `Artesanato ${['Silva', 'Maria', 'José'][index]}`,
        rawMaterial: ['MADEIRA', 'CERAMICA'],
        technique: ['ENTALHE', 'PINTURA'],
        finalityClassification: ['DECORACAO', 'UTILITARIO'],
        sicab: `SICAB${100000 + index}`,
        sicabRegistrationDate: new Date('2024-01-01'),
        sicabValidUntil: new Date('2026-01-01'),
        bio: `Artesão especializado em técnicas ${['tradicionais', 'modernas', 'exclusivas'][index]}`,
      },
    })),
  );

  console.log(`✅ ${artisans.length} artesãos criados\n`);
  return { artisanUsers, artisans };
}

async function createProducts(artisans: { userId: string; comercialName: string }[]) {
  console.log('📦 Criando produtos...');

  const productData = [
    { title: 'Vaso de Cerâmica Artesanal', description: 'Lindo vaso feito à mão', price: 5000 },
    { title: 'Cesta de Palha Trançada', description: 'Cesta tradicional', price: 3500 },
    { title: 'Tapete de Tear Manual', description: 'Tapete colorido feito em tear', price: 15000 },
    { title: 'Bolsa de Couro', description: 'Bolsa artesanal em couro legítimo', price: 25000 },
    { title: 'Luminária de Madeira', description: 'Luminária rústica', price: 8000 },
    { title: 'Jogo de Xícaras Pintadas', description: 'Conjunto com 6 xícaras', price: 12000 },
    { title: 'Escultura em Pedra Sabão', description: 'Escultura decorativa', price: 18000 },
    { title: 'Toalha Bordada', description: 'Toalha de mesa com bordados', price: 6500 },
  ];

  const products: { id: string; title: string; artisanId: string }[] = [];
  for (let i = 0; i < productData.length; i += 1) {
    const artisan = artisans[i % artisans.length];
    const data = productData[i];

    const product = await prisma.product.create({
      data: {
        artisanId: artisan.userId,
        title: data.title,
        description: data.description,
        priceInCents: BigInt(data.price),
        stock: Math.floor(Math.random() * 20) + 5,
        slug: data.title.toLowerCase().replace(/\s+/g, '-'),
        isActive: true,
        categoryIds: [],
      },
    });

    products.push(product);
  }

  console.log(`✅ ${products.length} produtos criados\n`);
  return products;
}

async function createProductRatings(
  users: { id: string }[],
  products: { id: string }[],
) {
  console.log('⭐ Criando avaliações de produtos...');

  const comments = [
    'Produto excelente, muito bem feito!',
    'Adorei a qualidade, superou minhas expectativas',
    'Bonito mas achei caro',
    'Entrega rápida e produto conforme descrito',
    'Trabalho artesanal incrível',
    'Produto mediano, esperava mais',
    'Muito bom, vou comprar novamente',
    'Qualidade surpreendente!',
  ];

  const ratings: { id: string; userId: string; productId: string }[] = [];
  for (let i = 0; i < Math.min(10, products.length * 2); i += 1) {
    const user = users[i % users.length];
    const product = products[i % products.length];

    // Evitar avaliação duplicada do mesmo usuário no mesmo produto
    const exists = await prisma.productRating.findUnique({
      where: {
        productId_userId: {
          productId: product.id,
          userId: user.id,
        },
      },
    });

    if (!exists) {
      const rating = await prisma.productRating.create({
        data: {
          productId: product.id,
          userId: user.id,
          rating: Math.floor(Math.random() * 3) + 3,
          comment: comments[i % comments.length],
        },
      });

      ratings.push(rating);
    }
  }

  console.log(`✅ ${ratings.length} avaliações criadas\n`);
  return ratings;
}

async function createReports(
  users: { id: string; name: string }[],
  artisans: { userId: string; comercialName: string }[],
  products: { id: string; title: string; artisanId: string }[],
  ratings: { id: string; userId: string }[],
) {
  console.log('🚨 Criando denúncias...\n');

  let reportCount = 0;

  // 1. Criar denúncias de usuários (artesãos)
  console.log('👤 Criando denúncias de usuários...');
  for (let i = 0; i < Math.min(artisans.length, 3); i += 1) {
    const reporter = users[i % users.length];
    const reported = artisans[i];

    if (reporter.id === reported.userId) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const reason = REPORT_REASONS[Math.floor(Math.random() * REPORT_REASONS.length)];
    const description = REPORT_DESCRIPTIONS[Math.floor(Math.random() * REPORT_DESCRIPTIONS.length)];
    const isSolved = Math.random() > 0.7;

    try {
      await prisma.report.create({
        data: {
          reporterId: reporter.id,
          reason,
          description,
          isSolved,
          ReportUser: {
            create: {
              reportedUserId: reported.userId,
              reporterId: reporter.id,
            },
          },
        },
      });
      reportCount += 1;
      console.log(`  ✓ Denúncia ${reportCount}: ${reporter.name} denunciou ${reported.comercialName}`);
    } catch {
      console.log('  ⚠️  Denúncia duplicada ignorada');
    }
  }

  // 2. Criar denúncias de produtos
  console.log('\n📦 Criando denúncias de produtos...');
  for (let i = 0; i < Math.min(products.length, 5); i += 1) {
    const reporter = users[(i + 2) % users.length];
    const product = products[i];

    if (reporter.id === product.artisanId) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const reason = REPORT_REASONS[Math.floor(Math.random() * REPORT_REASONS.length)];
    const description = REPORT_DESCRIPTIONS[Math.floor(Math.random() * REPORT_DESCRIPTIONS.length)];
    const isSolved = Math.random() > 0.6;

    try {
      await prisma.report.create({
        data: {
          reporterId: reporter.id,
          reason,
          description,
          isSolved,
          product: {
            create: {
              productId: product.id,
              reporterId: reporter.id,
            },
          },
        },
      });
      reportCount += 1;
      console.log(`  ✓ Denúncia ${reportCount}: ${reporter.name} denunciou produto "${product.title}"`);
    } catch {
      console.log('  ⚠️  Denúncia duplicada ignorada');
    }
  }

  // 3. Criar denúncias de avaliações
  console.log('\n⭐ Criando denúncias de avaliações...');
  for (let i = 0; i < Math.min(ratings.length, 4); i += 1) {
    const reporter = users[(i + 1) % users.length];
    const rating = ratings[i];

    if (reporter.id === rating.userId) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const reason = REPORT_REASONS[Math.floor(Math.random() * REPORT_REASONS.length)];
    const description = REPORT_DESCRIPTIONS[Math.floor(Math.random() * REPORT_DESCRIPTIONS.length)];
    const isSolved = Math.random() > 0.5;

    try {
      await prisma.report.create({
        data: {
          reporterId: reporter.id,
          reason,
          description,
          isSolved,
          productRating: {
            create: {
              productRatingId: rating.id,
              reporterId: reporter.id,
            },
          },
        },
      });
      reportCount += 1;
      console.log(`  ✓ Denúncia ${reportCount}: ${reporter.name} denunciou avaliação`);
    } catch {
      console.log('  ⚠️  Denúncia duplicada ignorada');
    }
  }

  return reportCount;
}

async function showStats() {
  console.log('\n📊 Estatísticas Finais:\n');

  const userCount = await prisma.user.count();
  const artisanCount = await prisma.artisanProfile.count();
  const productCount = await prisma.product.count();
  const ratingCount = await prisma.productRating.count();
  const reportCount = await prisma.report.count();

  console.log('Dados criados:');
  console.log(`  - Usuários: ${userCount}`);
  console.log(`  - Artesãos: ${artisanCount}`);
  console.log(`  - Produtos: ${productCount}`);
  console.log(`  - Avaliações: ${ratingCount}`);
  console.log(`  - Denúncias: ${reportCount}`);

  const reportStats = await prisma.report.groupBy({
    by: ['isSolved'],
    _count: true,
  });

  console.log('\nDenúncias por status:');
  reportStats.forEach((stat) => {
    console.log(`  - ${stat.isSolved ? 'Resolvidas' : 'Pendentes'}: ${stat._count}`);
  });

  const reportsByType = {
    users: await prisma.reportUser.count(),
    products: await prisma.reportProduct.count(),
    ratings: await prisma.reportProductRating.count(),
  };

  console.log('\nDenúncias por tipo:');
  console.log(`  - Usuários: ${reportsByType.users}`);
  console.log(`  - Produtos: ${reportsByType.products}`);
  console.log(`  - Avaliações: ${reportsByType.ratings}`);
}

async function main() {
  try {
    console.log('🌱 Seed de Denúncias - Iniciando...\n');

    await clearDatabase();

    const users = await createUsers();
    const { artisans } = await createArtisans();
    const products = await createProducts(artisans);
    const ratings = await createProductRatings(users, products);

    const reportCount = await createReports(users, artisans, products, ratings);

    console.log(`\n✅ Seed concluído! Total de ${reportCount} denúncias criadas.`);

    await showStats();
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
