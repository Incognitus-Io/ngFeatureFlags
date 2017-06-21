import { Directive, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { FeatureFlagService } from '../services/feature-flag.service';

@Directive({
  selector: '[ngFeatureFlag]'
})
export class FeatureFlagDirective {

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private darkLumos: FeatureFlagService
  ) { }

  @Input() ngFeatureFlagHidden: boolean = false;
  @Input() ngFeatureFlagDefaultTo: boolean = false;

  @Input() set ngFeatureFlag(featureFlag: string) {
    if (featureFlag === undefined) {
      console.error('Feature flag name required!');
      return;
    }

    this.darkLumos.isEnabled(featureFlag)
      .subscribe(status => {
        if ((status && !this.ngFeatureFlagHidden) ||
          (!status && this.ngFeatureFlagHidden)) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
          this.viewContainer.clear();
        }
      });
  }
}
