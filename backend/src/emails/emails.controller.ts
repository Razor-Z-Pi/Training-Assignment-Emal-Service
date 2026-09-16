import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmailsService } from './emails.service';

@Controller('emails')
@UseGuards(AuthGuard('jwt'))
export class EmailsController {
  constructor(private emails: EmailsService) {}

  @Post('send')
  send(@Req() req: any, @Body() dto: { candidateId: string; template: string; subject: string; context: any }) {
    return this.emails.send(req.user.userId, dto.candidateId, dto.template, dto.subject, dto.context);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.emails.findAll(req.user.userId);
  }
}