import { Controller, Get, Post, Delete, Query, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GmailService } from './gmail.service';

@Controller('gmail')
export class GmailController {
  constructor(private gmail: GmailService) {}

  @Get('status')
  @UseGuards(AuthGuard('jwt'))
  status(@Req() req: any) {
    return this.gmail.getStatus(req.user.userId);
  }

  @Post('connect')
  @UseGuards(AuthGuard('jwt'))
  connect(@Req() req: any) {
    return { authUrl: this.gmail.getAuthUrl(req.user.userId) };
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') state: string, @Res() res: any) {
    try {
      await this.gmail.handleCallback(code, state);
      return res.redirect(`${process.env.FRONTEND_URL}/settings?gmail=connected`);
    } catch {
      return res.redirect(`${process.env.FRONTEND_URL}/settings?gmail=error`);
    }
  }

  @Delete('connection')
  @UseGuards(AuthGuard('jwt'))
  async disconnect(@Req() req: any) {
    await this.gmail.disconnect(req.user.userId);
  }
}