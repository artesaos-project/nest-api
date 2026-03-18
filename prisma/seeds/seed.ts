/* eslint-disable no-nested-ternary */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { PrismaClient } from '@prisma/client';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Validar variáveis de ambiente necessárias
const requiredEnvVars = [
  'STORAGE_URL',
  'STORAGE_ACCESS_KEY_ID',
  'STORAGE_SECRET_ACCESS_KEY',
  'STORAGE_BUCKET_NAME',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Variável de ambiente ${envVar} não está definida`);
    process.exit(1);
  }
}

const s3Client = new S3Client({
  endpoint: process.env.STORAGE_URL,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Necessário para MinIO
  // Desabilitar verificação SSL se estiver usando HTTP (desenvolvimento)
  ...(process.env.STORAGE_URL?.startsWith('http://') && {
    tls: false,
  }),
});

const BUCKET_NAME = process.env.STORAGE_BUCKET_NAME;

export async function uploadToMinio(localPath: string, key: string) {
  try {
    console.log(`⬆️  Uploading: ${key}`);

    const Body = await readFile(localPath);
    const ext = extname(localPath).toLowerCase();
    const ContentType = ext === '.png'
      ? 'image/png'
      : ext === '.webp'
        ? 'image/webp'
        : ext === '.svg'
          ? 'image/svg+xml'
          : ext === '.jpg' || ext === '.jpeg'
            ? 'image/jpeg'
            : 'application/octet-stream';

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body,
      ContentType,
      // Remover ACL se o MinIO não suportar
      // ACL: 'public-read',
    });

    await s3Client.send(command);

    console.log(`✅ Uploaded: ${key}`);
    return key;
  } catch (error) {
    console.error(`❌ Failed to upload ${key}:`, error.message);
    throw error;
  }
}
const prisma = new PrismaClient();

const CATEGORIES = [
  'TEXTIL',
  'COURO',
  'MADEIRA',
  'PEDRA',
  'CERAMICA',
  'METAL',
  'VIDRO',
  'PAPEL',
  'PINTURA',
  'MOSAICO',
  'RECICLAGEM',
  'BOTANICA',
  'TAXIDERMIA',
  'PLASTICOS',
  'TRADICAO',
] as const;
type CategoryKey = (typeof CATEGORIES)[number];

const CATEGORY_EXHIBIT: Record<CategoryKey, string> = {
  TEXTIL: 'Têxtil',
  COURO: 'Couro',
  MADEIRA: 'Madeira',
  PEDRA: 'Pedra',
  CERAMICA: 'Cerâmica',
  METAL: 'Metal',
  VIDRO: 'Vidro',
  PAPEL: 'Papel',
  PINTURA: 'Pintura',
  MOSAICO: 'Mosaico',
  RECICLAGEM: 'Reciclagem',
  BOTANICA: 'Botânica',
  TAXIDERMIA: 'Taxidermia',
  PLASTICOS: 'Plásticos',
  TRADICAO: 'Tradição',
};

const CATEGORY_LOCAL_PATH: Record<CategoryKey, string> = {
  TEXTIL: 'prisma/seeds/images/textil.jpg',
  COURO: 'prisma/seeds/images/couro.jpg',
  MADEIRA: 'prisma/seeds/images/madeira.jpg',
  PEDRA: 'prisma/seeds/images/pedra.jpg',
  CERAMICA: 'prisma/seeds/images/ceramica.jpg',
  METAL: 'prisma/seeds/images/metal.jpg',
  VIDRO: 'prisma/seeds/images/vidro.jpg',
  PAPEL: 'prisma/seeds/images/papel.jpg',
  PINTURA: 'prisma/seeds/images/pintura.jpg',
  MOSAICO: 'prisma/seeds/images/mosaico.jpg',
  RECICLAGEM: 'prisma/seeds/images/reciclagem.jpg',
  BOTANICA: 'prisma/seeds/images/botanica.jpg',
  TAXIDERMIA: 'prisma/seeds/images/taxidermia.jpg',
  PLASTICOS: 'prisma/seeds/images/plastico.jpg',
  TRADICAO: 'prisma/seeds/images/tradicao.jpg',
};

type RawItem = {
  filter: string;
  exhibit: string;
  origin: string;
  category: CategoryKey;
};

const RAW_MATERIALS: RawItem[] = [
  // 01.01 Animal (natural)
  {
    filter: 'CARCACA',
    exhibit: 'Carcaça',
    origin: 'natural/animal',
    category: 'TAXIDERMIA',
  },
  {
    filter: 'CASCA_ANIMAL',
    exhibit: 'Casca (animal)',
    origin: 'natural/animal',
    category: 'TAXIDERMIA',
  },
  {
    filter: 'CASCO',
    exhibit: 'Casco',
    origin: 'natural/animal',
    category: 'TAXIDERMIA',
  },
  {
    filter: 'CERA_ANIMAL',
    exhibit: 'Cera (animal)',
    origin: 'natural/animal',
    category: 'TAXIDERMIA',
  },
  {
    filter: 'CONCHA',
    exhibit: 'Concha',
    origin: 'natural/animal',
    category: 'TAXIDERMIA',
  },
  {
    filter: 'COURO_E_PELE',
    exhibit: 'Couro e Pele',
    origin: 'natural/animal',
    category: 'COURO',
  },
  {
    filter: 'CRINA_E_PELO',
    exhibit: 'Crina e Pelo',
    origin: 'natural/animal',
    category: 'TAXIDERMIA',
  },
  {
    filter: 'DENTE_CHIFRE_E_OSSO',
    exhibit: 'Dente, Chifre e Osso',
    origin: 'natural/animal',
    category: 'TAXIDERMIA',
  },
  {
    filter: 'ESCAMA',
    exhibit: 'Escama',
    origin: 'natural/animal',
    category: 'TAXIDERMIA',
  },
  {
    filter: 'PENA_E_PLUMA',
    exhibit: 'Pena e Pluma',
    origin: 'natural/animal',
    category: 'TAXIDERMIA',
  },

  // 01.02 Vegetal (natural)
  {
    filter: 'CASCA_CAULE_E_RAIZ',
    exhibit: 'Casca, Caule e Raiz',
    origin: 'natural/vegetal',
    category: 'BOTANICA',
  },
  {
    filter: 'CERA_MASSA_E_RESINA_VEG',
    exhibit: 'Cera, Massa e Resina (vegetal)',
    origin: 'natural/vegetal',
    category: 'BOTANICA',
  },
  {
    filter: 'FIO_E_FIBRA_VEG',
    exhibit: 'Fio e Fibra (vegetal)',
    origin: 'natural/vegetal',
    category: 'TEXTIL',
  },
  {
    filter: 'FLOR_FOLHA_E_FRUTO',
    exhibit: 'Flor, Folha e Fruto',
    origin: 'natural/vegetal',
    category: 'BOTANICA',
  },
  {
    filter: 'LATEX_BALATA',
    exhibit: 'Látex, Balata',
    origin: 'natural/vegetal',
    category: 'PLASTICOS',
  },
  {
    filter: 'MADEIRA_NATURAL',
    exhibit: 'Madeira (natural)',
    origin: 'natural/vegetal',
    category: 'MADEIRA',
  },
  {
    filter: 'SEMENTE',
    exhibit: 'Semente',
    origin: 'natural/vegetal',
    category: 'BOTANICA',
  },

  // 01.03 Mineral (natural)
  {
    filter: 'AREIA',
    exhibit: 'Areia',
    origin: 'natural/mineral',
    category: 'VIDRO',
  },
  {
    filter: 'ARGILA',
    exhibit: 'Argila',
    origin: 'natural/mineral',
    category: 'CERAMICA',
  },
  {
    filter: 'PEDRA',
    exhibit: 'Pedra',
    origin: 'natural/mineral',
    category: 'PEDRA',
  },

  // 02.01 Animal (manufaturada)
  {
    filter: 'COURO_E_PELE_BENEFICIADO',
    exhibit: 'Couro e Pele (beneficiado)',
    origin: 'manufactured/animal',
    category: 'COURO',
  },
  {
    filter: 'FIO_DE_LA',
    exhibit: 'Fio de Lã',
    origin: 'manufactured/animal',
    category: 'TEXTIL',
  },
  {
    filter: 'SEDA',
    exhibit: 'Seda',
    origin: 'manufactured/animal',
    category: 'TEXTIL',
  },

  // 02.02 Vegetal (manufaturada)
  {
    filter: 'BORRACHA',
    exhibit: 'Borracha',
    origin: 'manufactured/vegetal',
    category: 'PLASTICOS',
  },
  {
    filter: 'FIO_E_TECIDO_VEG',
    exhibit: 'Fio e Tecido (vegetal)',
    origin: 'manufactured/vegetal',
    category: 'TEXTIL',
  },
  {
    filter: 'MASSA_VEGETAL',
    exhibit: 'Massa (vegetal)',
    origin: 'manufactured/vegetal',
    category: 'PLASTICOS',
  },
  {
    filter: 'MDF_AGLOMERADO_COMPENSADO',
    exhibit: 'MDF, Aglomerado e Compensado',
    origin: 'manufactured/vegetal',
    category: 'MADEIRA',
  },
  {
    filter: 'PAPEL_INDUSTRIAL',
    exhibit: 'Papel (industrial)',
    origin: 'manufactured/vegetal',
    category: 'PAPEL',
  },

  // 02.03 Mineral (manufaturada)
  {
    filter: 'CERAMICA_BENEFICIADA',
    exhibit: 'Cerâmica (beneficiada)',
    origin: 'manufactured/mineral',
    category: 'CERAMICA',
  },
  {
    filter: 'METAL',
    exhibit: 'Metal',
    origin: 'manufactured/mineral',
    category: 'METAL',
  },
  {
    filter: 'VIDRO',
    exhibit: 'Vidro',
    origin: 'manufactured/mineral',
    category: 'VIDRO',
  },

  // 03 Sintética
  {
    filter: 'FIO_E_TECIDO_SINTETICO',
    exhibit: 'Fio e Tecido (sintético)',
    origin: 'synthetic',
    category: 'TEXTIL',
  },
  {
    filter: 'COURO_SINTETICO',
    exhibit: 'Couro Sintético',
    origin: 'synthetic',
    category: 'PLASTICOS',
  },
  {
    filter: 'MATERIAIS_SINTETICOS',
    exhibit: 'Materiais Sintéticos',
    origin: 'synthetic',
    category: 'PLASTICOS',
  },
];

type TechItem = { filter: string; exhibit: string; category: CategoryKey };

const TECHNIQUES: TechItem[] = [
  {
    filter: 'AMARRADINHO_PUXADINHO_ESMIRRA',
    exhibit: 'Amarradinho/ Puxadinho/ Esmirra',
    category: 'TEXTIL',
  },
  { filter: 'BOLEADO', exhibit: 'Boleado', category: 'PLASTICOS' },

  // Bordado
  { filter: 'BORDADO', exhibit: 'Bordado', category: 'TEXTIL' },
  { filter: 'APLICACAO', exhibit: 'Aplicação', category: 'TEXTIL' },
  { filter: 'ARPILHARIA', exhibit: 'Arpilharia', category: 'TEXTIL' },
  { filter: 'BOA_NOITE', exhibit: 'Boa Noite', category: 'TEXTIL' },
  { filter: 'BOUVAIRE', exhibit: 'Bouvaire', category: 'TEXTIL' },
  { filter: 'CAMINHO_SEM_FIM', exhibit: 'Caminho sem Fim', category: 'TEXTIL' },
  { filter: 'CASA_DE_ABELHA', exhibit: 'Casa de Abelha', category: 'TEXTIL' },
  {
    filter: 'CORRENTE_OU_CADEIA',
    exhibit: 'Corrente ou Cadeia',
    category: 'TEXTIL',
  },
  {
    filter: 'CRIVO_OU_CONTADO',
    exhibit: 'Crivo ou Contado',
    category: 'TEXTIL',
  },
  { filter: 'FILE', exhibit: 'Filé', category: 'TEXTIL' },
  { filter: 'LABIRINTO', exhibit: 'Labirinto', category: 'TEXTIL' },
  { filter: 'OITINHO', exhibit: 'Oitinho', category: 'TEXTIL' },
  { filter: 'PONTO_ABERTO', exhibit: 'Ponto Aberto', category: 'TEXTIL' },
  { filter: 'PONTO_CHEIO', exhibit: 'Ponto Cheio', category: 'TEXTIL' },
  { filter: 'PONTO_CRUZ', exhibit: 'Ponto Cruz', category: 'TEXTIL' },
  { filter: 'PONTO_MATIZ', exhibit: 'Ponto Matiz', category: 'TEXTIL' },
  { filter: 'PONTO_RETO', exhibit: 'Ponto Reto', category: 'TEXTIL' },
  {
    filter: 'PONTO_RUSSO_RUSTICO',
    exhibit: 'Ponto Russo/ Rústico',
    category: 'TEXTIL',
  },
  { filter: 'PONTO_SOMBRA', exhibit: 'Ponto Sombra', category: 'TEXTIL' },
  {
    filter: 'REDENDE_RENDEDEPE_RENDA_DE_DEDO_HARDANGER',
    exhibit: 'Redendê, Rendedêpe, Renda de Dedo ou Hardanger',
    category: 'TEXTIL',
  },
  { filter: 'RICHELIEU', exhibit: 'Richelieu', category: 'TEXTIL' },
  { filter: 'ROCOCO', exhibit: 'Rococó', category: 'TEXTIL' },
  { filter: 'VAGONITE', exhibit: 'Vagonite', category: 'TEXTIL' },
  { filter: 'XADREZ_BORDADO', exhibit: 'Xadrez (bordado)', category: 'TEXTIL' },

  { filter: 'CALADO_VAZADO', exhibit: 'Calado/ Vazado', category: 'PLASTICOS' },
  { filter: 'CARPINTARIA', exhibit: 'Carpintaria', category: 'MADEIRA' },
  { filter: 'CARTONAGEM', exhibit: 'Cartonagem', category: 'PAPEL' },

  // Cerâmica
  { filter: 'CERAMICA', exhibit: 'Cerâmica', category: 'CERAMICA' },
  { filter: 'FAIANCA', exhibit: 'Faiança', category: 'CERAMICA' },
  { filter: 'GRES', exhibit: 'Grés', category: 'CERAMICA' },
  { filter: 'PORCELANA', exhibit: 'Porcelana', category: 'CERAMICA' },
  { filter: 'RAKU', exhibit: 'Raku', category: 'CERAMICA' },
  { filter: 'TERRACOTA', exhibit: 'Terracota', category: 'CERAMICA' },
  {
    filter: 'TRADICIONAL_OLARIA',
    exhibit: 'Tradicional (olaria)',
    category: 'CERAMICA',
  },
  {
    filter: 'VIDRADOS_OU_ESMALTE_CERAMICO',
    exhibit: 'Vidrados ou Esmalte Cerâmico',
    category: 'CERAMICA',
  },

  {
    filter: 'CINZELACAO_OU_REPUXO',
    exhibit: 'Cinzelação ou Repuxo',
    category: 'METAL',
  },
  {
    filter: 'COMPOSICAO_DE_IMAGEM_EM_AREIA',
    exhibit: 'Composição de Imagem em Areia',
    category: 'MOSAICO',
  },

  // Costura e têxteis
  { filter: 'COSTURA', exhibit: 'Costura', category: 'TEXTIL' },
  { filter: 'COSTURA_FUXICO', exhibit: 'Costura - Fuxico', category: 'TEXTIL' },
  {
    filter: 'COSTURA_PATCHWORK',
    exhibit: 'Costura - Patchwork',
    category: 'TEXTIL',
  },
  {
    filter: 'COSTURA_RETALHO',
    exhibit: 'Costura - Retalho',
    category: 'TEXTIL',
  },
  { filter: 'CROCHE', exhibit: 'Crochê', category: 'TEXTIL' },
  {
    filter: 'CURTIMENTO_CURTUME_ARTESANAL',
    exhibit: 'Curtimento ou Curtume Artesanal',
    category: 'COURO',
  },

  { filter: 'CUTELARIA', exhibit: 'Cutelaria', category: 'METAL' },
  { filter: 'DESIDRATACAO', exhibit: 'Desidratação', category: 'BOTANICA' },
  {
    filter: 'DOBRADURA_ORIGAMI',
    exhibit: 'Dobradura ou Origami',
    category: 'PAPEL',
  },

  // Entalhes e afins
  {
    filter: 'ENTALHE_ENTALHAMENTO',
    exhibit: 'Entalhe/ Entalhamento',
    category: 'MADEIRA',
  },
  {
    filter: 'ENTALHE_EM_CHIFRE_E_OSSO',
    exhibit: 'Entalhe em Chifre e Osso',
    category: 'TAXIDERMIA',
  },
  {
    filter: 'ENTALHE_EM_COURO',
    exhibit: 'Entalhe em Couro',
    category: 'COURO',
  },
  {
    filter: 'ENTALHE_EM_MADEIRA',
    exhibit: 'Entalhe em Madeira',
    category: 'MADEIRA',
  },
  {
    filter: 'ENTALHE_EM_PEDRA',
    exhibit: 'Entalhe em Pedra',
    category: 'PEDRA',
  },
  { filter: 'ESCULPIR', exhibit: 'Esculpir', category: 'PEDRA' },
  { filter: 'ESMERILHAMENTO', exhibit: 'Esmerilhamento', category: 'METAL' },

  { filter: 'ESQUELETIZACAO', exhibit: 'Esqueletização', category: 'BOTANICA' },
  { filter: 'FELTRAGEM', exhibit: 'Feltragem', category: 'TEXTIL' },
  { filter: 'FERRARIA', exhibit: 'Ferraria', category: 'METAL' },
  { filter: 'FIACAO', exhibit: 'Fiação', category: 'TEXTIL' },

  {
    filter: 'FILIGRANA_EM_METAL',
    exhibit: 'Filigrana em Metal',
    category: 'METAL',
  },
  {
    filter: 'FILIGRANA_EM_PAPEL_QUILLING',
    exhibit: 'Filigrana em Papel ou Quilling',
    category: 'PAPEL',
  },
  {
    filter: 'FOLHEACAO_DOURACAO',
    exhibit: 'Folheação/ Douração',
    category: 'PINTURA',
  },
  { filter: 'FUNDICAO', exhibit: 'Fundição', category: 'METAL' },
  {
    filter: 'FUNILARIA_LATOARIA',
    exhibit: 'Funilaria/ Latoaria',
    category: 'METAL',
  },
  {
    filter: 'FUSAO_FUSING_VITROFUSAO',
    exhibit: 'Fusão (Fusing e Vitrofusão)',
    category: 'VIDRO',
  },

  // Gravuras
  { filter: 'GRAVACAO', exhibit: 'Gravação', category: 'PINTURA' },
  {
    filter: 'GRAVACAO_EM_LINOLEO',
    exhibit: 'Gravação em Linóleo',
    category: 'PINTURA',
  },
  {
    filter: 'GRAVACAO_EM_METAL',
    exhibit: 'Gravação em Metal',
    category: 'PINTURA',
  },
  {
    filter: 'GRAVACAO_EM_VIDRO',
    exhibit: 'Gravação em Vidro',
    category: 'VIDRO',
  },
  { filter: 'LITOGRAFIA', exhibit: 'Litografia', category: 'PINTURA' },
  { filter: 'PIROGRAFIA', exhibit: 'Pirografia', category: 'PINTURA' },
  { filter: 'XILOGRAFIA', exhibit: 'Xilografia', category: 'PINTURA' },

  { filter: 'LAPIDACAO', exhibit: 'Lapidação', category: 'PEDRA' },
  { filter: 'LATONAGEM', exhibit: 'Latonagem', category: 'METAL' },
  { filter: 'LUTERIA', exhibit: 'Luteria', category: 'TRADICAO' },
  { filter: 'MAMUCABA', exhibit: 'Mamucaba', category: 'TEXTIL' },
  { filter: 'MARCENARIA', exhibit: 'Marcenaria', category: 'MADEIRA' },
  { filter: 'MARCHETARIA', exhibit: 'Marchetaria', category: 'MADEIRA' },
  { filter: 'MODELAGEM', exhibit: 'Modelagem', category: 'PLASTICOS' },
  {
    filter: 'MODELAGEM_A_FOGO',
    exhibit: 'Modelagem a Fogo',
    category: 'VIDRO',
  },

  { filter: 'MOLDAGEM', exhibit: 'Moldagem', category: 'PLASTICOS' },
  { filter: 'MONTAGEM', exhibit: 'Montagem', category: 'MOSAICO' },
  { filter: 'MOSAICO', exhibit: 'Mosaico', category: 'MOSAICO' },
  { filter: 'OURIVESARIA', exhibit: 'Ourivesaria', category: 'METAL' },
  { filter: 'PAPEL_ARTESANAL', exhibit: 'Papel Artesanal', category: 'PAPEL' },
  { filter: 'PAPEL_MACHE', exhibit: 'Papel Machê', category: 'PAPEL' },
  { filter: 'PAPIETAGEM', exhibit: 'Papietagem', category: 'PAPEL' },

  // Pintura + subitens
  { filter: 'PINTURA', exhibit: 'Pintura', category: 'PINTURA' },
  { filter: 'BATIQUE', exhibit: 'Batique', category: 'PINTURA' },
  { filter: 'BAUERNMALEREI', exhibit: 'Bauernmalerei', category: 'PINTURA' },
  { filter: 'ENGOBE', exhibit: 'Engobe', category: 'CERAMICA' },
  { filter: 'ESMALTE', exhibit: 'Esmalte', category: 'CERAMICA' },
  { filter: 'ESTAMPARIA', exhibit: 'Estamparia', category: 'PINTURA' },
  { filter: 'PESSANKA', exhibit: 'Pêssanka', category: 'PINTURA' },
  { filter: 'SERIGRAFIA', exhibit: 'Serigrafia', category: 'PINTURA' },
  {
    filter: 'PINTURA_A_MAO_LIVRE',
    exhibit: 'Pintura à Mão Livre',
    category: 'PINTURA',
  },
  {
    filter: 'PINTURA_EM_AZULEJO',
    exhibit: 'Pintura em Azulejo',
    category: 'PINTURA',
  },
  {
    filter: 'PINTURA_DE_TERRA',
    exhibit: 'Pintura de Terra',
    category: 'PINTURA',
  },
  { filter: 'PINTURA_VITRAL', exhibit: 'Pintura Vitral', category: 'VIDRO' },

  { filter: 'RECICLAGEM', exhibit: 'Reciclagem', category: 'RECICLAGEM' },

  // Rendas + subitens
  { filter: 'RENDA', exhibit: 'Renda', category: 'TEXTIL' },
  { filter: 'ABROLHO', exhibit: 'Abrolho', category: 'TEXTIL' },
  { filter: 'BILRO', exhibit: 'Bilro', category: 'TEXTIL' },
  { filter: 'FRIVOLITE', exhibit: 'Frivolité', category: 'TEXTIL' },
  { filter: 'GRAMPADA', exhibit: 'Grampada', category: 'TEXTIL' },
  {
    filter: 'GUIPURE_OU_GRIPIER',
    exhibit: 'Guipure ou Gripier',
    category: 'TEXTIL',
  },
  { filter: 'IRLANDESA', exhibit: 'Irlandesa', category: 'TEXTIL' },
  { filter: 'MACRAME', exhibit: 'Macramê', category: 'TEXTIL' },
  {
    filter: 'RENASCENCA_OU_RENDA_INGLESA',
    exhibit: 'Renascença ou Renda Inglesa',
    category: 'TEXTIL',
  },
  {
    filter: 'TENERIFE_NHANDUTI_RENDA_DO_SOL',
    exhibit: 'Tenerife/ Nhanduti/ Renda do Sol',
    category: 'TEXTIL',
  },
  {
    filter: 'TURCA_OU_SINGELEZA',
    exhibit: 'Turca ou Singeleza',
    category: 'TEXTIL',
  },

  { filter: 'SAPATARIA', exhibit: 'Sapataria', category: 'COURO' },
  { filter: 'SELARIA', exhibit: 'Selaria', category: 'COURO' },
  { filter: 'SERRALHERIA', exhibit: 'Serralheria', category: 'METAL' },
  { filter: 'TAPECARIA', exhibit: 'Tapeçaria', category: 'TEXTIL' },
  { filter: 'TAXIDERMIA', exhibit: 'Taxidermia', category: 'TAXIDERMIA' },
  { filter: 'TECELAGEM', exhibit: 'Tecelagem', category: 'TEXTIL' },
  { filter: 'TECUME', exhibit: 'Teçume', category: 'TEXTIL' },
  { filter: 'TORCAO_EM_METAL', exhibit: 'Torção em Metal', category: 'METAL' },
  { filter: 'TORNEAMENTO', exhibit: 'Torneamento', category: 'MADEIRA' },
  { filter: 'TRANCADO', exhibit: 'Trançado', category: 'TEXTIL' },
  { filter: 'TRICO', exhibit: 'Tricô', category: 'TEXTIL' },
  { filter: 'VITRAL', exhibit: 'Vitral', category: 'VIDRO' },

  // Complementares
  { filter: 'REUTILIZACAO', exhibit: 'Reutilização', category: 'RECICLAGEM' },
  { filter: 'TINGIMENTO', exhibit: 'Tingimento', category: 'PINTURA' },
  { filter: 'PRENSAGEM', exhibit: 'Prensagem', category: 'PLASTICOS' },
];

async function main() {
  console.log('Seed: início');

  await prisma.rawMaterial.createMany({
    data: RAW_MATERIALS.map((m) => ({
      nameFilter: m.filter,
      nameExhibit: m.exhibit,
      description: m.origin,
      isActive: true,
    })),
    skipDuplicates: true,
  });

  await prisma.technique.createMany({
    data: TECHNIQUES.map((t) => ({
      nameFilter: t.filter,
      nameExhibit: t.exhibit,
      isActive: true,
    })),
    skipDuplicates: true,
  });

  const rawMaterials = await prisma.rawMaterial.findMany();
  const techniques = await prisma.technique.findMany();

  const rawMatIdByFilter: Map<string, bigint> = new Map(
    rawMaterials.map(
      (r: { nameFilter: string; id: bigint }) => [r.nameFilter, r.id] as [string, bigint],
    ),
  );
  const techIdByFilter: Map<string, bigint> = new Map(
    techniques.map(
      (t: { nameFilter: string; id: bigint }) => [t.nameFilter, t.id] as [string, bigint],
    ),
  );

  const idFor = (f: string) => {
    const id = rawMatIdByFilter.get(f);
    if (!id) throw new Error(`RawMaterial not found for filter: ${f}`);
    return id;
  };

  const rawIdsByCategory = new Map<CategoryKey, bigint[]>(
    CATEGORIES.map((c) => [c, []]),
  );
  const techIdsByCategory = new Map<CategoryKey, bigint[]>(
    CATEGORIES.map((c) => [c, []]),
  );

  const EXTRA_RAW_BY_CATEGORY: Partial<Record<CategoryKey, string[]>> = {
    MOSAICO: ['PEDRA', 'VIDRO', 'ARGILA', 'CERAMICA_BENEFICIADA', 'CONCHA'],
    PAPEL: ['PAPEL_INDUSTRIAL'],
    RECICLAGEM: [
      'MADEIRA_NATURAL',
      'MDF_AGLOMERADO_COMPENSADO',
      'VIDRO',
      'BORRACHA',
      'PAPEL_INDUSTRIAL',
      'ARGILA',
      'CERAMICA_BENEFICIADA',
      'METAL',
      'MATERIAIS_SINTETICOS',
      'COURO_SINTETICO',
      'FIO_E_TECIDO_SINTETICO',
    ],
  };

  for (const m of RAW_MATERIALS) {
    const id = rawMatIdByFilter.get(m.filter);
    if (id) rawIdsByCategory.get(m.category)!.push(id);
  }

  for (const t of TECHNIQUES) {
    const id = techIdByFilter.get(t.filter);
    if (id) techIdsByCategory.get(t.category)!.push(id);
  }

  const CATEGORY_OBJECT_KEY = {} as Record<CategoryKey, string>;

  for (const cat of CATEGORIES) {
    const local = CATEGORY_LOCAL_PATH[cat];
    const key = `categories/${basename(local)}`;
    CATEGORY_OBJECT_KEY[cat] = await uploadToMinio(local, key);
  }

  for (const cat of CATEGORIES) {
    const baseRaw = rawIdsByCategory.get(cat)!;
    const extras = (EXTRA_RAW_BY_CATEGORY[cat] ?? []).map(idFor);
    const mergedRaw = Array.from(new Set([...baseRaw, ...extras]));

    await prisma.productCategory.upsert({
      where: { nameFilter: cat },
      create: {
        nameFilter: cat,
        nameExhibit: CATEGORY_EXHIBIT[cat],
        rawMaterialIds: mergedRaw,
        techniqueIds: techIdsByCategory.get(cat)!,
        isActive: true,
        imagePath: CATEGORY_OBJECT_KEY[cat],
      },
      update: {
        rawMaterialIds: mergedRaw,
        techniqueIds: techIdsByCategory.get(cat)!,
        isActive: true,
        imagePath: CATEGORY_OBJECT_KEY[cat],
      },
    });
  }

  const cats = await prisma.productCategory.findMany({
    select: { nameFilter: true, rawMaterialIds: true, techniqueIds: true },
  });
  for (const c of cats) {
    console.log(
      c.nameFilter,
      'raw:',
      c.rawMaterialIds.length,
      'tech:',
      c.techniqueIds.length,
    );
  }

  // log individual
  const mosaico = await prisma.productCategory.findUnique({
    where: { nameFilter: 'MOSAICO' },
  });
  console.log('MOSAICO raw IDs:', (mosaico?.rawMaterialIds ?? []).map(String));
}

main()
  .catch((e) => {
    console.error('Seed: erro', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
