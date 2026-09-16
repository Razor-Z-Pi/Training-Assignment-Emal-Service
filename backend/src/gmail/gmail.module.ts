import { Module } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { GmailController } from './gmail.controller';
import { CryptoService } from '../common/crypto/crypto.service';
import { OAuthStateService } from '../common/state/oauth-state.service';

@Module({
  providers: [GmailService, CryptoService, OAuthStateService],
  controllers: [GmailController],
  exports: [GmailService],
})
export class GmailModule {}