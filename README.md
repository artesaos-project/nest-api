# 🛠️ Configuração do Ambiente de Desenvolvimento

## 📌 Requisitos

Antes de iniciar o desenvolvimento, certifique-se de ter os seguintes requisitos instalados:

- **Node.js** (versão 18.x ou superior) - [[Download](https://nodejs.org/)]
- **npm** (gerenciador de pacotes do Node.js) - Instalado junto com o Node.js
- **Docker** e **Docker Compose** - [[Instalação](https://www.docker.com/get-started)]
- **PostgreSQL** (se não for usar o Docker) - [[Download](https://www.postgresql.org/download/)]
- **Git** - [[Instalação](https://git-scm.com/downloads)]
- **Nest.js** - [[Instalação](https://docs.nestjs.com/)]

## 📂 Fork e Clonagem do Repositório

Para contribuir com o projeto, siga as etapas abaixo:

1. Faça um **fork** do repositório original para sua conta no GitHub.

   Ao criar o seu fork, recomendo que seja adicionado '-fork' ao final do nome do repositório, porém isso é totalmente opcional.
2. Clone o seu fork localmente:

```sh
# Substitua "seu-usuario" pelo seu nome de usuário no GitHub
git clone https://github.com/seu-usuario/nest-api-fork.git

# Acessar o diretório do projeto
cd nest-api-fork
```

3. Adicione o repositório original como um remoto chamado `upstream` para manter seu fork atualizado:

```sh
git remote add upstream https://github.com/artesaos-project/nest-api.git
```

4. Sempre que for iniciar uma nova feature ou correção, sincronize seu fork com o repositório original:

```sh
git fetch upstream
git checkout main
git merge upstream/main
```

## 📆 Instalação de Dependências

```sh
npm install
```

## 🔧 Configuração do Ambiente

1. Copie o arquivo de exemplo `.env.example` para `.env`:

   ```sh
   cp .env.example .env
   ```

2. Configure as variáveis de ambiente no arquivo `.env`, ajustando conforme necessário.

## 🐳 Subindo o Banco de Dados com Docker

Se estiver utilizando Docker, execute:

```sh
cp docker-compose.example.yml docker-compose.yml

docker-compose up -d
```

Caso esteja utilizando o PostgreSQL localmente, configure as credenciais no `.env` e crie o banco de dados manualmente.

## 🚀 Executando o Projeto

### Ambiente de Desenvolvimento

```sh
npm run start:dev
```

### Ambiente de Produção (Simulado)

```sh
npm run build
npm run start
```

## 🏗️ Migrações do Banco de Dados

Caso haja alterações no banco de dados, execute:

```sh
npx prisma migrate dev
```

Para gerar as migrações para produção:

```sh
npx prisma migrate deploy
```

## 🌱 Populando o Banco de Dados (Seed)

Para popular o banco de dados com dados de exemplo, execute o comando abaixo no terminal da raiz do projeto:

```sh
npx tsx prisma/seed.ts
```

O script de seed utiliza o [faker.js](https://fakerjs.dev/) para gerar dados realistas e também realiza upload de imagens para o storage (caso o diretório `prisma/seeds/images` exista).

Caso prefira, adicione um script ao seu arquivo `package.json` para facilitar a execução:

```json
"scripts": {
    "seed": "tsx prisma/seed.ts",
    // ... outros scripts
}
```

E então execute:

```sh
npm run seed
```

> **Observação:** Certifique-se de que todas as variáveis de ambiente necessárias (como `STORAGE_BUCKET_NAME`, `STORAGE_URL`, `STORAGE_ACCESS_KEY_ID` e `STORAGE_SECRET_ACCESS_KEY`) estejam configuradas corretamente no seu arquivo `.env`.

## 📌 Considerações Finais

Caso tenha problemas com permissões, tente rodar os comandos com `sudo` (Linux/macOS) ou execute o terminal como administrador (Windows).

Se encontrar algum erro ou precisar de ajuda, consulte a documentação oficial ou entre em contato pelo Slack.

---

✅ **Agora o ambiente está pronto para o desenvolvimento!** 🚀

---

## 🔐 Gerando chaves RS256 para autenticação JWT

Para usar autenticação JWT com o algoritmo RS256, é necessário gerar um par de chaves criptográficas. Siga os passos abaixo:

### 1. Gerar a chave privada

```bash
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
```

### 2. Gerar a chave pública a partir da chave privada

```bash
openssl rsa -in private.pem -pubout -out public.pem
```

### 3. Converter as chaves para Base64

```bash
base64 private.pem > private_base64.txt
base64 public.pem > public_base64.txt
```

### 4. Adicionar ao `.env`

Copie o conteúdo da chave  da versão em Base64 e adicione às variáveis correspondentes no arquivo `.env`:

```env
PRIVATE_KEY="[PRIVATE_BASE64]"
PUBLIC_KEY="[PUBLIC_BASE64]"
```

> ⚠️ **Atenção**: Nunca versionar os arquivos `.pem` nem expor suas chaves públicas ou privadas em repositórios públicos. Adicione esses arquivos ao `.gitignore`.