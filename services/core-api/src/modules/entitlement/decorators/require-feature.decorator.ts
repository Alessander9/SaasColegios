import { SetMetadata } from '@nestjs/common';
import { FeatureKey, UsageMetricKey } from '@cole/domain-types';

export const FEATURE_KEY = 'FEATURE_KEY';
export const RequireFeature = (feature: FeatureKey) => SetMetadata(FEATURE_KEY, feature);

export const USAGE_METRIC_KEY = 'USAGE_METRIC_KEY';
export const CheckQuota = (metric: UsageMetricKey) => SetMetadata(USAGE_METRIC_KEY, metric);
