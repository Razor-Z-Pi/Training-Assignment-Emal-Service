import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { GmailModule } from './gmail/gmail.module';
import { CandidatesModule } from './candidates/candidates.module';
import { TemplatesModule } from './templates/templates.module';
import { EmailsModule } from './emails/emails.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    GmailModule,
    CandidatesModule,
    TemplatesModule,
    EmailsModule,
  ],
})
export class AppModule {}