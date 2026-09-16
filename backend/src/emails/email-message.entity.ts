export type SendStatus = 'pending' | 'sent' | 'failed';

export class EmailMessage {
  id!: string;
  userId!: string;
  candidateId!: string;
  toEmail!: string;
  fromEmail!: string;
  subject!: string;
  body!: string;
  templateSnapshot!: any;
  status!: SendStatus;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt!: Date;
  sentAt?: Date;
}