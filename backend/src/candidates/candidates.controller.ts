import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CandidatesService } from './candidates.service';

@Controller('candidates')
@UseGuards(AuthGuard('jwt'))
export class CandidatesController {
  constructor(private readonly candidates: CandidatesService) {}

  @Get()
  findAll() {
    return this.candidates.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.candidates.findOne(id);
  }
}