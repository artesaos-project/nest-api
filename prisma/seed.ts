/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import {
  PrismaClient, Role, ApplicationType, RequestStatus,
} from '@prisma/client';
import { faker } from '@faker-js/faker';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed: starting...');
  // Criar categorias de produto
  const categories = await prisma.productCategory.createMany({
    data: [
      { id: BigInt(1), name: 'Artesanato', type: 'manual' },
      { id: BigInt(2), name: 'Decoração', type: 'decor' },
      { id: BigInt(3), name: 'Utilidades', type: 'utility' },
    ],
    skipDuplicates: true,
  });
  console.log('Seed: product categories createMany result:', categories);

  // Criar ao menos um usuário para cada role
  const roles = [Role.USER, Role.ARTISAN, Role.MODERATOR, Role.ADMIN];
  const users: Awaited<ReturnType<typeof prisma.user.create>>[] = [];
  for (const role of roles) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: [role],
      },
    });
    users.push(user);
  }
  // Adiciona mais usuários aleatórios
  for (let i = 0; i < 2; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: await hash('senhaPadrao123', 10),
        role: [faker.helpers.arrayElement(roles)],
      },
    });
    users.push(user);
  }

  // Criar perfis de usuário
  for (const user of users) {
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        name: faker.person.fullName(),
        socialName: faker.person.fullName(),
        cpf: faker.string.numeric('###########'),
        birthDate: faker.date.birthdate(),
        street: faker.location.street(),
        postalCode: faker.location.zipCode(),
        city: faker.location.city(),
        number: faker.string.numeric('####'),
        phone: faker.phone.number(),
        avatar: faker.image.avatar(),
      },
    });
  }

  // Criar perfis de artesão para alguns usuários
  const artisanUsers = users.slice(0, 3);
  const artisans: Awaited<ReturnType<typeof prisma.artisanProfile.create>>[] = [];
  for (const user of artisanUsers) {
    const artisan = await prisma.artisanProfile.create({
      data: {
        userId: user.id,
        userName: faker.internet.username(),
        rawMaterial: faker.commerce.productMaterial(),
        technique: faker.commerce.productAdjective(),
        finalityClassification: faker.commerce.department(),
        sicab: faker.string.alphanumeric(8),
        sicabRegistrationDate: faker.date.past(),
        sicabValidUntil: faker.date.future(),
        isDisabled: faker.datatype.boolean(),
      },
    });
    artisans.push(artisan);
  }

  // Criar aplicações de artesão
  for (const user of artisanUsers) {
    await prisma.artisanApplication.create({
      data: {
        userId: user.id,
        type: faker.helpers.arrayElement([ApplicationType.BE_ARTISAN, ApplicationType.DISABLE_PROFILE]),
        rawMaterial: faker.commerce.productMaterial(),
        technique: faker.commerce.productAdjective(),
        finalityClassification: faker.commerce.department(),
        sicab: faker.string.alphanumeric(8),
        sicabRegistrationDate: faker.date.past(),
        sicabValidUntil: faker.date.future(),
        status: faker.helpers.arrayElement([RequestStatus.PENDING, RequestStatus.APPROVED, RequestStatus.REJECTED]),
        reviewerId: users[4].id,
        rejectionReason: faker.lorem.sentence(),
      },
    });
  }

  // Criar produtos para cada artesão
  for (const artisan of artisans) {
    for (let i = 0; i < 2; i++) {
      const product = await prisma.product.create({
        data: {
          artisanId: artisan.userId,
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          priceInCents: BigInt(faker.number.int({ min: 1000, max: 10000 })),

          categoryId: faker.helpers.arrayElement([BigInt(1), BigInt(2), BigInt(3)]),
          stock: faker.number.int({ min: 1, max: 50 }),
          coverageImage: faker.image.urlPicsumPhotos(),
          isDisabled: faker.datatype.boolean(),
        },
      });
      // Criar attachments para produto
      await prisma.attachment.create({
        data: {
          productId: product.id,
          fileType: 'image/png',
          fileSize: BigInt(faker.number.int({ min: 10000, max: 500000 })),
        },
      });
      // Criar ratings e likes
      for (const user of users) {
        await prisma.productRating.create({
          data: {
            productId: product.id,
            userId: user.id,
            rating: faker.number.int({ min: 1, max: 5 }),
            comment: faker.lorem.sentence(),
          },
        });
        await prisma.productLike.create({
          data: {
            productId: product.id,
            userId: user.id,
            isLiked: faker.datatype.boolean(),
            likedAt: faker.date.recent(),
            likeDeletedAt: faker.datatype.boolean() ? faker.date.recent() : null,
          },
        });
      }
    }
  }

  // Criar attachments para usuários e artesãos
  for (const user of users) {
    await prisma.attachment.create({
      data: {
        userId: user.id,
        fileType: 'image/jpeg',
        fileSize: BigInt(faker.number.int({ min: 10000, max: 500000 })),
      },
    });
  }

  console.log('Seed: created attachments for users');

  for (const artisan of artisans) {
    await prisma.attachment.create({
      data: {
        artisanId: artisan.id,
        fileType: 'image/jpeg',
        fileSize: BigInt(faker.number.int({ min: 10000, max: 500000 })),
      },
    });
  }

  console.log('Seed: created attachments for artisans');

  // Upload das imagens de seed (prisma/seeds/images) e criação de attachments
  try {
    const imagesDir = path.join(__dirname, 'seeds', 'images');
    if (!fs.existsSync(imagesDir)) {
      console.warn('Seed: diretório de imagens não encontrado em', imagesDir);
    } else {
      const imageFiles = fs.readdirSync(imagesDir).filter((f) => /\.(jpe?g|png)$/i.test(f));
      const bucketName = process.env.STORAGE_BUCKET_NAME || process.env.S3_BUCKET_NAME || 'your-default-bucket-name';

      const s3 = new S3Client({
        endpoint: process.env.STORAGE_URL,
        region: 'auto',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || '',
        },
      });

      for (const file of imageFiles) {
        const filePath = path.join(imagesDir, file);
        const body = fs.readFileSync(filePath);
        const ext = path.extname(file).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
        const id = randomUUID(); // será usado como key/attachment id
        const key = `${id}${ext}`;

        // Enviar para o bucket
        await s3.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: body,
          ContentType: mime,
        }));

        // Criar registro no banco usando o id gerado (igual ao Key sem extensão)
        const attachmentData: any = {
          id,
          fileType: mime,
          fileSize: BigInt(body.byteLength),
        };

        // Se houver artesãos criados, associe a primeira imagem ao primeiro artisan (ajuda no teste)
        if (artisans.length > 0) {
          attachmentData.artisanId = artisans[0].id;
        }

        await prisma.attachment.create({
          data: attachmentData,
        });
        console.log('Seed: created attachment record for uploaded file', key);
      }
    }
  } catch (err) {
    // não falha o seed se o MinIO não estiver disponível — apenas log
    // eslint-disable-next-line no-console
    console.warn('Seed: could not upload images to storage:', err?.message ?? err);
  }
  console.log('Seed: finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
