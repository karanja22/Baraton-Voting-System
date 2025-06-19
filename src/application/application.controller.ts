import { Body, Controller, Param, ParseIntPipe, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CreateDelegateDto } from './dto/create-delegate.dto';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) { }
  @Post('delegate')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async submitDelegate(@Body() dto: CreateDelegateDto) {
    return this.applicationService.submitDelegateApplication(dto);
  }

  @Post('candidate')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async submitCandidate(@Body() dto: CreateCandidateDto) {
    return this.applicationService.submitCandidateApplication(dto);
  }

  @Patch('review/delegate/:id')
  async reviewDelegate(@Param('id', ParseIntPipe) id: number) {
    return this.applicationService.reviewDelegate(id);
  }

  @Patch('review/candidate/:id')
  async reviewCandidate(@Param('id', ParseIntPipe) id: number) {
    return this.applicationService.reviewCandidate(id);
  }
}
