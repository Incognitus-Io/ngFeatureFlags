import { Http, Response, Headers } from '@angular/http';
import { Injectable, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { FeatureFlagConfig } from './feature-flag-config';
import { Feature } from './feature';

@Injectable()
export class FeatureFlagService {
    private get apiUri(): string {
        return this.config.apiUri || 'https://incognitus.io/api/';
    }

    private get headers(): Headers {
        const flagHeaders = new Headers();
        flagHeaders.append('X-Tenant', this.config.tenantId);
        flagHeaders.append('X-Application', this.config.applicationId);
        return flagHeaders;
    }

    public featureCache: Map<string, boolean> = undefined;

    constructor(private config: FeatureFlagConfig, private http: Http) {
    }

    public initialize(): Promise<void> {
        return this.GetAllFeatures()
            .toPromise()
            .then((features: Map<string, boolean>) => {
                this.featureCache = features;
            });
    }

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
        if (this.featureCache && this.featureCache.get(featureName) != null) {
            return Observable.of(this.featureCache.get(featureName));
        } else if (!this.featureCache) {
            this.featureCache = new Map<string, boolean>();
        }

        return this.http
            .get(this.apiUri + 'feature/' + featureName, {
                headers: this.headers
            })
            .map((res: Response) => {
                const feature = <Feature>res.json();
                this.featureCache.set(feature.name, feature.isEnabled);
                return feature.isEnabled;
            });
    }

    private GetAllFeatures(): Observable<Map<string, boolean>> {
        return this.http
            .get(this.apiUri + 'feature/', { headers: this.headers })
            .map((res: Response) => {
                const features = new Map<string, boolean>();
                const resFeatures = <Array<Feature>>res.json()['Features'] || <Array<Feature>>res.json()['features'] || []
                resFeatures.forEach((feature: Feature) => {
                        features.set(feature.name, feature.isEnabled);
                    });
                return features;
            })
            .catch(() => Observable.of(null));
    }
}