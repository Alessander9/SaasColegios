import { Module, Global } from '@nestjs/common';
import { EntitlementService } from './entitlement.service';
import { FeatureGuard } from './feature.guard';

@Global()
@Module({
  providers: [EntitlementService, FeatureGuard],
  exports: [EntitlementService, FeatureGuard],
})
export class EntitlementModule {}
