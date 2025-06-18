import { Module } from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { ElectionsController } from './elections.controller';

@Module({
  controllers: [ElectionsController],
  providers: [ElectionsService],
})
export class ElectionsModule {}
