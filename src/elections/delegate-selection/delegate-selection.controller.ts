import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DelegateSelectionService } from './delegate-selection.service';
import { AppointManualDto } from './dtos/appoint-manual.dto';

@Controller('delegate-selection')
export class DelegateSelectionController {
  constructor(private readonly delegateSelectionService: DelegateSelectionService) { }
  @Post('appoint-manual')
  appointManual(@Body() dto: AppointManualDto) {
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
