import { BadRequestException, Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { DelegateSelectionService } from './delegate-selection.service';
import { AppointManualDto } from './dtos/appoint-manual.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guards';

@Controller('delegate-selection')
export class DelegateSelectionController {
  constructor(private readonly delegateSelectionService: DelegateSelectionService) { }

  @Post('appoint-manual')
  @UseGuards(JwtAuthGuard, RolesGuard)
  appointManual(@Body() dto: AppointManualDto) {
    if (!dto.departmentId) {
      throw new BadRequestException('departmentId is required');
    }

    return this.delegateSelectionService.appointManually(dto.departmentId, dto.selectedIds);
  }

  @Post('appoint-auto/:departmentId')
  autoAppoint(@Param('departmentId') deptId: number) {
    return this.delegateSelectionService.autoAppoint(+deptId);
  }

  @Get('nominees/:departmentId')
  getNominees(@Param('departmentId') deptId: number) {
    return this.delegateSelectionService.getTopNominees(+deptId);
  }

}
