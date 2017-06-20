import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureFlagDirective } from './directive/feature-flag.directive';
import { FeatureFlagService } from './services/feature-flag.service';

export { FeatureFlagConfig } from './services/feature-flag-config';

@NgModule({
  imports: [CommonModule],
  exports: [
    FeatureFlagDirective,
  ],
  declarations: [FeatureFlagDirective],
  providers: [FeatureFlagService]
})
export class DarkLumosFeatureFlagsModule { }
