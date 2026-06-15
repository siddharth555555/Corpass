import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Find the .env file in the monorepo root or backend subdirectory
const envPaths = [
  path.join(process.cwd(), 'apps/backend/.env'),
  path.join(process.cwd(), '.env'),
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3001, '0.0.0.0');
}
bootstrap();
