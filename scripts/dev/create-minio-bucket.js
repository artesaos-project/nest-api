const { S3Client, CreateBucketCommand } = require('@aws-sdk/client-s3');

async function main() {
  const client = new S3Client({
    endpoint: 'http://localhost:9000',
    region: 'auto',
    forcePathStyle: true,
    credentials: {
      accessKeyId: 'minioadmin',
      secretAccessKey: 'minioadmin',
    },
  });

  const bucket = 'seed-bucket';

  try {
    await client.send(new CreateBucketCommand({ Bucket: bucket }));
    console.log('Bucket criado:', bucket);
  } catch (err) {
    if (err.name && err.name.includes('BucketAlreadyOwnedByYou')) {
      console.log('Bucket já existe:', bucket);
    } else {
      console.error('Erro criando bucket:', err);
      process.exit(1);
    }
  }
}

main();
