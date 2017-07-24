import { Http, Response, Headers } from '@angular/http';
import { Injectable, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { FeatureFlagConfig } from './feature-flag-config';
import { Feature } from './feature';

@Injectable()
export class FeatureFlagService {
    private get apiUri(): string {
        return this.config.apiUri;
    }

    private get headers(): Headers {
        const flagHeaders = new Headers();
        flagHeaders.append('X-Tenant', this.config.tenantId);
        flagHeaders.append('X-Application', this.config.applicationId);
        return flagHeaders;
    }

    constructor(private config: FeatureFlagConfig, private http: Http) {}

    public isEnabled(featureName: string): Observable<boolean | Boolean> {
        return this.GetFeatureStatus(featureName).catch((res: Response) => {
            if (res.status !== 404) {
                console.error('Failed to get feature flags: ' + res.text());
            }
            return Observable.of(false);
        });
    }

    public isDisabled(featureName: string): Observable<boolean> {
        return this.GetFeatureStatus(featureName)
            .map((status: boolean) => !status)
            .catch((res: Response) => {
                if (res.status !== 404) {
                    console.error('Failed to get feature flags: ' + res.text());
                }
                return Observable.of(false);
            });
    }

    private GetFeatureStatus(featureName: string): Observable<Boolean> {
        return this.http
            .get(this.apiUri + 'feature/' + featureName, {
                headers: this.headers
            })
            .map((res: Response) => {
                const feature = <Feature>res.json();
                return feature.isEnabled;
            });
    }

    private GetAllFeatures(): Observable<Map<string, boolean>> {
        return this.http
            .get(this.apiUri + 'feature', { headers: this.headers })
            .map((res: Response) => {
                const features = new Map<string, boolean>();
                <Feature[]>res
                    .json()['Features']
                    .forEach((feature: Feature) => {
                        features[feature.name] = feature.isEnabled;
                    });
                return features;
            });
    }
}
