import { Module } from '@nestjs/common';
import { SchoolCoreController } from './school-core.controller';
import { SchoolCoreService } from './school-core.service';

@Module({
  controllers: [SchoolCoreController],
  providers: [SchoolCoreService],
  exports: [SchoolCoreService],
})
export class SchoolCoreModule {}
