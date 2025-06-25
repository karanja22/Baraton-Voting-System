import { Controller, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Patch('review/candidate/:id')
  reviewCandidate(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.reviewCandidate(id);
  }

  @Patch('review/delegate/:id')
  reviewDelegate(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.reviewDelegate(id);
  }
}
