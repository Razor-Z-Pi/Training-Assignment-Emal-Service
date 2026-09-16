import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { GmailModule } from '../gmail/gmail.module';
import { CandidatesModule } from '../candidates/candidates.module';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [GmailModule, CandidatesModule, TemplatesModule],
  providers: [EmailsService],
  controllers: [EmailsController],
})
export class EmailsModule {}