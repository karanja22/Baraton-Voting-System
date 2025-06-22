import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Get,
  Delete,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CreateDelegateDto } from './dto/create-delegate.dto';
import { UpdateCandidateDto } from './dto/update-candidtate.dto';
import { UpdateDelegateDto } from './dto/update-delegate.dto';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) { }

  // === CREATE ===
  @Post('delegate')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  submitDelegate(@Body() dto: CreateDelegateDto) {
    return this.applicationService.submitDelegateApplication(dto);
  }

  @Post('candidate')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  submitCandidate(@Body() dto: CreateCandidateDto) {
    return this.applicationService.submitCandidateApplication(dto);
  }

  // === READ ===
  @Get('delegate')
  getAllDelegates() {
    return this.applicationService.getAllDelegates();
  }

  @Get('candidate')
  getAllCandidates() {
    return this.applicationService.getAllCandidates();
  }

  @Get('delegate/:id')
  getDelegate(@Param('id', ParseIntPipe) id: number) {
    return this.applicationService.getDelegateById(id);
  }

  @Get('candidate/:id')
  getCandidate(@Param('id', ParseIntPipe) id: number) {
    return this.applicationService.getCandidateById(id);
  }

  // === UPDATE ===
  @Patch('delegate/:id')
  updateDelegate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDelegateDto,
  ) {
    return this.applicationService.updateDelegate(id, dto);
  }

  @Patch('candidate/:id')
  updateCandidate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCandidateDto,
  ) {
    return this.applicationService.updateCandidate(id, dto);
  }

  @Patch('review/delegate/:id')
  reviewDelegate(@Param('id', ParseIntPipe) id: number) {
    return this.applicationService.reviewDelegate(id);
  }

  @Patch('review/candidate/:id')
  reviewCandidate(@Param('id', ParseIntPipe) id: number) {
    return this.applicationService.reviewCandidate(id);
  }

  // === DELETE ===
  @Delete('delegate/:id')
  deleteDelegate(@Param('id', ParseIntPipe) id: number) {
    return this.applicationService.deleteDelegate(id);
  }

  @Delete('candidate/:id')
  deleteCandidate(@Param('id', ParseIntPipe) id: number) {
    return this.applicationService.deleteCandidate(id);
  }
}
