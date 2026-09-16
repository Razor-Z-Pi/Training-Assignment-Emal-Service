import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  async login(email: string) {
    const userId = `user_${Buffer.from(email).toString('hex').slice(0, 12)}`;
    const token = await this.jwt.signAsync({ sub: userId, email });
    return { accessToken: token, userId, email };
  }
}