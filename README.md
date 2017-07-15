# Dark Lumos Feature Flag (Angular)

## Integrating Dark Lumos
Integration of Dark Lumos into your Angular application is done in 2 setps.
#### Step 1) environment.ts
A section named `featureFlag` must be added to your `enviroment.ts` file.
   ```TypeScript
   featureFlag: {
    apiUri: http://darklumos.io/api/,
    tenantId: 'abc1234',
    applicationId: 'foobar'
  }
  ```
  
  Key | Description
  --- | ---
  apiUri | The uri of the Dark Lumos API
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