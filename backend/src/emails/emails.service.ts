import { Injectable, BadRequestException, BadGatewayException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { GmailService } from '../gmail/gmail.service';
import { CandidatesService } from '../candidates/candidates.service';
import { RenderService } from '../templates/render.service';
import { EmailMessage, SendStatus } from './email-message.entity';

@Injectable()
export class EmailsService {
  private messages = new Map<string, EmailMessage>();

  constructor(
    private gmail: GmailService,
    private candidates: CandidatesService,
    private render: RenderService,
  ) {}

  async send(userId: string, candidateId: string, template: string, subject: string, context: any) {
    const candidate = this.candidates.findOne(candidateId);

    if (!candidate.email) {
      throw new BadRequestException({ code: 'CANDIDATE_NO_EMAIL' });
    }

    const preview = this.render.render(template, subject, candidate, context);
    if (!preview.ready) {
      throw new BadRequestException({ code: 'TEMPLATE_NOT_READY', missing: preview.missing });
    }

    const id = randomUUID();
    const msg: EmailMessage = {
      id, userId, candidateId,
      toEmail: candidate.email,
      fromEmail: '',
      subject: preview.rendered.subject,
      body: preview.rendered.body,
      templateSnapshot: { template, subject, context, candidate },
      status: 'pending',
      createdAt: new Date(),
    };
    this.messages.set(id, msg);

    try {
      const res = await this.gmail.sendEmail(
        userId, candidate.email, preview.rendered.subject, preview.rendered.body
      );
      const conn = (this.gmail as any).getStatus(userId);
      msg.fromEmail = conn.email;
      msg.status = 'sent';
      msg.providerMessageId = res.providerMessageId;
      msg.sentAt = new Date();
      return msg;
    } catch (e: any) {
      const err = e.response ?? e;
      msg.status = 'failed';
      msg.errorCode = err.code;
      msg.errorMessage = err.message;
      throw new BadGatewayException({
        id, status: 'failed',
        errorCode: err.code,
        errorMessage: err.message,
        retryable: err.retryable ?? true,
      });
    }
  }

  findAll(userId: string) {
    return [...this.messages.values()].filter(m => m.userId === userId);
  }
}