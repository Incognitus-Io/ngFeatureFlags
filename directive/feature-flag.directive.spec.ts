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
import { By } from "@angular/platform-browser";
import { IMock, Mock, It } from 'typemoq';
import { Observable } from "rxjs/Rx";

import { FeatureFlagDirective } from './feature-flag.directive';
import { FeatureFlagService } from '../services/feature-flag.service';
import { FeatureFlagConfig } from '../services/feature-flag-config';

describe('FeatureFlagDirective', () => {
    var mockService: IMock<FeatureFlagService>;
    var debugElement: DebugElement;
    var element: HTMLElement;

    beforeEach(async(() => {
        mockService = Mock.ofType(FeatureFlagService);

        TestBed.configureTestingModule({
            declarations: [SimpleToggleComponent, HiddenToggleComponent, FeatureFlagDirective],
            providers: [
                { provide: FeatureFlagService, useValue: mockService.object }
            ]
        })
            .compileComponents();
    }));

    describe('Simple feature flag', () => {
        var fixture: ComponentFixture<SimpleToggleComponent>;

        function buildComponent() {
            fixture = TestBed.createComponent(SimpleToggleComponent);
            fixture.detectChanges();
            debugElement = fixture.debugElement.query(By.css('#Foobar'))
            element = debugElement ? debugElement.nativeElement : undefined;
        }

        it('should show elemetn when feature is enabled', () => {
            mockService.setup(x => x.isEnabled(It.isAnyString())).returns(() => Observable.of(true));
            buildComponent();

            expect(element).toBeDefined();
        });

        it('should hide elemetn when feature is disabled', () => {
            mockService.setup(x => x.isEnabled(It.isAnyString())).returns(() => Observable.of(false));
            buildComponent();

            expect(element).not.toBeDefined();
        });
    });

    describe('Hidden feature flag', () => {
        var fixture: ComponentFixture<HiddenToggleComponent>;

        function buildComponent() {
            fixture = TestBed.createComponent(HiddenToggleComponent);
            fixture.detectChanges();
            debugElement = fixture.debugElement.query(By.css('#Foobar'))
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