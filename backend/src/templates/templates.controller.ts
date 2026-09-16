import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RenderService } from './render.service';
import { VARIABLES } from './variables.registry';
import { CandidatesService } from '../candidates/candidates.service';

@Controller('templates')
@UseGuards(AuthGuard('jwt'))
export class TemplatesController {
  constructor(
    private render: RenderService,
    private candidates: CandidatesService,
  ) {}

  @Get('variables')
  variables() { return { variables: VARIABLES }; }

  @Post('preview')
  preview(@Body() dto: { template: string; subject: string; candidateId: string; context: any }) {
    const candidate = this.candidates.findOne(dto.candidateId);
    return this.render.render(dto.template, dto.subject, candidate, dto.context);
  }
}