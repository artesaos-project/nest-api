import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
  getLivre(): string {
    return 'Acesso autorizado a todos!';
  }

  getAdmin(): string {
    return 'Você é um administrador!';
  }

  getArtisan(): string {
    return 'Você é um artesãos!';
  }

  getMisto(): string {
    return 'Você é um usuario ou Artesão!';
  }
}
