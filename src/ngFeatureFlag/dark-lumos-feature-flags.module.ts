import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';

import { FeatureFlagDirective } from './directive/feature-flag.directive';
import { FeatureFlagService } from './services/feature-flag.service';

export { FeatureFlagConfig } from './services/feature-flag-config';

export function app_init_factory(svc: FeatureFlagService) {
  return () => svc.initialize();
}

@NgModule({
  imports: [
    CommonModule,
    HttpModule
  ],
  exports: [
    FeatureFlagDirective,
  ],
  declarations: [FeatureFlagDirective],
  providers: [
    FeatureFlagService,
    {
      provide: APP_INITIALIZER, deps: [FeatureFlagService],
      multi: true, useFactory: app_init_factory
    }
  ]
})
export class DarkLumosFeatureFlagsModule { }
