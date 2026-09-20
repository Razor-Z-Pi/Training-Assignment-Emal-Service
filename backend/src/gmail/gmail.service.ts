import { Injectable, BadGatewayException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { CryptoService } from '../common/crypto/crypto.service';
import { OAuthStateService } from '../common/state/oauth-state.service';
import { GmailConnection } from './gmail-connection.entity';

@Injectable()
export class GmailService {
  private connections = new Map<string, GmailConnection>();
  private oauth2Client: any;

  constructor(
    private config: ConfigService,
    private crypto: CryptoService,
    private stateService: OAuthStateService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      config.get('GOOGLE_CLIENT_ID'),
      config.get('GOOGLE_CLIENT_SECRET'),
      config.get('GOOGLE_CALLBACK_URL'),
    );
  }

  getStatus(userId: string) {
    const conn = this.connections.get(userId);
    if (!conn || conn.revoked) {
      return { connected: false, reason: conn?.revoked ? 'revoked' : null };
    }
    return {
      connected: true,
      email: conn.email,
      connectedAt: conn.expiresAt.toISOString(),
      scopes: conn.scopes,
    };
  }

  getAuthUrl(userId: string): string {
    const state = this.stateService.sign(userId);
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.send', 'email'],
      prompt: 'consent',
      state,
    });
  }

  async handleCallback(code: string, state: string) {
    const { userId } = this.stateService.verify(state);
    const { tokens } = await this.oauth2Client.getToken(code);

    this.oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    this.connections.set(userId, {
      userId,
      email: profile.email!,
      accessTokenEnc: this.crypto.encrypt(tokens.access_token!),
      refreshTokenEnc: this.crypto.encrypt(tokens.refresh_token!),
      expiresAt: new Date(tokens.expiry_date!),
      scopes: tokens.scope!.split(' '),
      revoked: false,
    });

    return { email: profile.email };
  }

  async disconnect(userId: string) {
    const conn = this.connections.get(userId);
    if (!conn) return;
    try {
      await this.oauth2Client.revokeToken(this.crypto.decrypt(conn.refreshTokenEnc));
    } catch {
    this.connections.delete(userId);
    } 
  }

  async sendEmail(userId: string, to: string, subject: string, body: string) {
    const conn = this.connections.get(userId);
    if (!conn || conn.revoked) {
      throw new BadGatewayException({ code: 'GMAIL_NOT_CONNECTED' });
    }

    this.oauth2Client.setCredentials({
      access_token: this.crypto.decrypt(conn.accessTokenEnc),
      refresh_token: this.crypto.decrypt(conn.refreshTokenEnc),
    });

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    const raw = Buffer.from(
      `From: ${conn.email}\r\nTo: ${to}\r\nSubject: ${subject}\r\n\r\n${body}`
    ).toString('base64url');

    try {
      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw },
      });
      return { providerMessageId: res.data.id! };
    } catch (e: any) {
      if (e.code === 401 || e.message?.includes('invalid_grant')) {
        conn.revoked = true;
        throw new BadGatewayException({ code: 'TOKEN_REVOKED', retryable: false });
      }
      if (e.code === 429) {
        throw new BadGatewayException({ code: 'QUOTA_EXCEEDED', retryable: true });
      }
      throw new BadGatewayException({ code: 'GMAIL_ERROR', message: e.message, retryable: true });
    }
  }
}