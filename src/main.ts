import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { DarkLumosFeatureFlagsModule } from './ngFeatureFlag/dark-lumos-feature-flags.module';

enableProdMode();
platformBrowserDynamic().bootstrapModule(DarkLumosFeatureFlagsModule);
