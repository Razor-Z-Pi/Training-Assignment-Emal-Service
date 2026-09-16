export class GmailConnection {
  userId!: string;
  email!: string;
  accessTokenEnc!: string;
  refreshTokenEnc!: string;
  expiresAt!: Date;
  scopes!: string[];
  revoked!: boolean;
}