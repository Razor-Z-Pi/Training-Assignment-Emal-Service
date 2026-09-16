import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class OAuthStateService {
  private readonly secret: string;

  constructor(config: ConfigService) {
    this.secret = config.get('OAUTH_STATE_SECRET')!;
  }

  sign(userId: string, ttlSec = 300): string {
    const payload = `${userId}.${Date.now() + ttlSec * 1000}`;
    const sig = createHmac('sha256', this.secret).update(payload).digest('base64url');
    return `${Buffer.from(payload).toString('base64url')}.${sig}`;
  }

  verify(state: string): { userId: string } {
    const [p, sig] = state.split('.');
    const payload = Buffer.from(p, 'base64url').toString();
    const expected = createHmac('sha256', this.secret).update(payload).digest('base64url');
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      throw new UnauthorizedException('bad state');
    }
    const [userId, exp] = payload.split('.');
    if (Date.now() > Number(exp)) throw new UnauthorizedException('state expired');
    return { userId };
  }
}