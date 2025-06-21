import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { CreateElectionDto, UpdateElectionDto } from './dtos/create-election.dto';
import { UpdateElectionDto } from './dtos/update-election.dto';


@Controller('elections')
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) { }

  @Post()
  create(@Body() dto: CreateElectionDto) {
    return this.electionsService.createElection(dto);
  }

  @Get()
  findAll() {
    return this.electionsService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateElectionDto) {
    return this.electionsService.updateElection(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.electionsService.deleteElection(+id);
  }
}

