import { Module } from '@nestjs/common';
import { RenderService } from './render.service';
import { TemplatesController } from './templates.controller';
import { CandidatesModule } from '../candidates/candidates.module';

@Module({
  imports: [CandidatesModule],
  providers: [RenderService],
  controllers: [TemplatesController],
  exports: [RenderService],
})
export class TemplatesModule {}