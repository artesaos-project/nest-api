const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const attachments = await prisma.attachment.findMany({ take: 10, orderBy: { createdAt: 'desc' } });
  console.log('Attachments:', attachments);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
