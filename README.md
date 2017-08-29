# Incognitus Feature Flag (Angular 2+)
[![wercker status](https://app.wercker.com/status/2bcec7ce0e0efa362c58b9e22753016e/s/master "wercker status")](https://app.wercker.com/project/byKey/2bcec7ce0e0efa362c58b9e22753016e)
[![codecov](https://codecov.io/gh/Incognitus-Io/ngFeatureFlags/branch/master/graph/badge.svg)](https://codecov.io/gh/Incognitus-Io/ngFeatureFlags)

## Integrating Incognitus
Integration of Incognitus into your Angular application is done in 2 setps.
#### Step 1) environment.ts
A section named `featureFlag` must be added to your `enviroment.ts` file.
   ```TypeScript
   featureFlag: {
    tenantId: 'abc1234',
    applicationId: 'foobar'
  }
  ```
  
  Key | Description
  --- | ---
  tenantId | Your tenant id
  applicationId | The id of the application

#### Step 2) app.modules.ts
  Import the `DarkLumosFeatureFlagsModule` and provide the `FeatureFlagConfig`
  ```TypeScript
  imports: [
      ...
      DarkLumosFeatureFlagModule
  ],
  providers: [
      ...
      { provide: FeatureFlagConfig, useValue: <FeaturFlagConfig>environment.featureFlag }
  ]
  ```

## Using in the template
Feature flags can be used to section off a chuck of template.  To do this just add the `*ngFeatureFlag` attribute, with the value of your feature flag name in single quotes, to the element you would like to feature flag.  You can also set the feature flag to hide an element when the feature flag is on by adding `; Hidden: true` to the attribute's value.

Below are a few examples.
```html
<div *ngFeatureFlag="'Fizzbuzz'">
  <span>Fizzbuzz shown when enabled</span>
</div>
<div *ngFeatureFlag="'Foobar'; Hidden: true">
  <span>Foobar hidden if enabled</span>
</div>
```

## Caching
Currently all known feature flags are cached when the app initializes.  New features that are not found
in the cache are retrieved on-demand.  The cache stays in place until the app is reloaded.

### Future Caching Stories
* Save verified cache to local storage
* Provide hard cache refresh (wipe cache if fails)
* Provide soft cache refresh (keep cache if fails)
* Customizable cache refresh times
* Option to disable cache