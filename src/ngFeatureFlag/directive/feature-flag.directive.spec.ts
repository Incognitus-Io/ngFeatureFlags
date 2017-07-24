import { Http, Response, ResponseOptions } from '@angular/http';
import {
    async,
    ComponentFixture,
    TestBed,
    tick,
    fakeAsync,
} from '@angular/core/testing';
import {
    Component,
    DebugElement,
    ViewChild,
    ChangeDetectionStrategy
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { IMock, Mock, It } from 'typemoq';
import { Observable } from 'rxjs/Rx';

import { FeatureFlagDirective } from './feature-flag.directive';
import { FeatureFlagService } from '../services/feature-flag.service';
import { FeatureFlagConfig } from '../services/feature-flag-config';

describe('FeatureFlagDirective', () => {
    const mockOptions = new FeatureFlagConfig();
    mockOptions.apiUri = 'foobar';

    const mockHttp = Mock.ofType(Http);
    const mockFeaturesResponse = new ResponseOptions();
    mockFeaturesResponse.body = JSON.stringify({'Features': []});
    mockHttp.setup(x => x.get(It.isAnyString(), It.isAny()))
        .returns(() => Observable.of(new Response(mockFeaturesResponse)));

    let mockService: IMock<FeatureFlagService>;
    let debugElement: DebugElement;
    let element: HTMLElement;

    beforeEach(async(() => {
        mockService = Mock.ofType2(FeatureFlagService, [
            mockOptions,
            mockHttp.object
        ]);

        TestBed.configureTestingModule({
            declarations: [SimpleToggleComponent, HiddenToggleComponent, FeatureFlagDirective],
            providers: [
                { provide: FeatureFlagService, useValue: mockService.object }
            ]
        })
            .compileComponents();
    }));

    describe('Simple feature flag', () => {
        let fixture: ComponentFixture<SimpleToggleComponent>;

        function buildComponent() {
            fixture = TestBed.createComponent(SimpleToggleComponent);
            fixture.detectChanges();
            debugElement = fixture.debugElement.query(By.css('#Foobar'));
            element = debugElement ? debugElement.nativeElement : undefined;
        }

        it('should show elemetn when feature is enabled', async(() => {
            mockService.setup(x => x.isEnabled(It.isAnyString())).returns(() => Observable.of(true));
            buildComponent();

            expect(element).toBeDefined();
        }));

        it('should hide elemetn when feature is disabled', async(() => {
            mockService.setup(x => x.isEnabled(It.isAnyString())).returns(() => Observable.of(false));
            buildComponent();

            expect(element).not.toBeDefined();
        }));
    });

    describe('Hidden feature flag', () => {
        let fixture: ComponentFixture<HiddenToggleComponent>;

        function buildComponent() {
            fixture = TestBed.createComponent(HiddenToggleComponent);
            fixture.detectChanges();
            debugElement = fixture.debugElement.query(By.css('#Foobar'));
            element = debugElement ? debugElement.nativeElement : undefined;
        }

        it('should hide elemetn when feature is enabled', () => {
            mockService.setup(x => x.isEnabled(It.isAnyString())).returns(() => Observable.of(true));
            buildComponent();

            expect(element).not.toBeDefined();
        });

        it('should show elemetn when feature is disabled', () => {
            mockService.setup(x => x.isEnabled(It.isAnyString())).returns(() => Observable.of(false));
            buildComponent();

            expect(element).toBeDefined();
        });
    });
});

/* tslint:disable */
@Component({
    selector: 'app',
    template: `
  <div id="Foobar" *ngFeatureFlag="'Foobar'">
  </div>
  `
})
class SimpleToggleComponent {

}

@Component({
    selector: 'app',
    template: `
  <div id="Foobar" *ngFeatureFlag="'Foobar'; Hidden: true">
  </div>
  `
})
class HiddenToggleComponent {

}
/* tslint:enable */
