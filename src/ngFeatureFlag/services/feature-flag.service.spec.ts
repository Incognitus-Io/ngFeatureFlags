import { Http } from '@angular/http';
import { ReflectiveInjector } from '@angular/core';
import { TestBed, inject, async } from '@angular/core/testing';
import {
  HttpModule,
  Response,
  ResponseOptions,
  ResponseType,
  XHRBackend,
  RequestMethod
} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { FeatureFlagService } from './feature-flag.service';
import { FeatureFlagConfig } from './feature-flag-config';

class MockError extends Response implements Error {
  name: any;
  message: any;
}

describe('FeatureFlagService', () => {
  const apiUri = 'http://darklumos/api/';
  const clientId = 'someClient';
  const tenantId = 'someJoe';
  let service: FeatureFlagService;
  let backend: MockBackend;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        FeatureFlagService,
        { provide: XHRBackend, useClass: MockBackend },
        {
          provide: FeatureFlagConfig, useValue: <FeatureFlagConfig>{
            apiUri: apiUri,
            tenantId: tenantId,
            applicationId: clientId
          }
        }
      ]
    });
  });

  beforeEach(inject([FeatureFlagService, XHRBackend], (svc: FeatureFlagService, http: MockBackend) => {
    service = svc;
    backend = http;
  }));

  describe('cache', () => {
    const getService = () => {
      const currentService = <any>service;
      return new FeatureFlagService(currentService.config, currentService.http);
    }

    it('should initialize cache when getting feature if getting all features fails', () => {
      const featureName = 'foobar';
      const response = { 'name': featureName, 'isEnabled': false };
      let httpCallCount = 0;

      backend.connections.subscribe((connection: MockConnection) => {
        if (connection.request.url === `${apiUri}feature/`) {
          connection.mockError(new MockError(new ResponseOptions({
            type: ResponseType.Error,
            body: '',
            status: 404
          })));
        } else {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify(response),
            status: 200
          })));
        }
        httpCallCount++;
      });

      service = getService();
      service.isEnabled(featureName).subscribe(() => {
        service.isEnabled(featureName).subscribe(() => {
          expect(httpCallCount).toBe(2);
        });
      });
    });

    it('should return feature status from cache', () => {
      const featureName = 'foobar';
      const response = { 'name': featureName, 'isEnabled': false };
      let httpCallCount = 0;

      backend.connections.subscribe((connection: MockConnection) => {
        if (connection.request.url === `${apiUri}feature/`) {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify({ 'features': [response] }),
            status: 200
          })));
        } else {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify(response),
            status: 200
          })));
        }
        httpCallCount++;
      });

      service = getService();
      service.isEnabled(featureName).subscribe(() => {
        expect(httpCallCount).toBe(1);
      });
    });

    it('should save feature to cache if missing', () => {
      const featureName1 = 'foobar';
      const featureName2 = 'fizzbuzz';
      const response1 = { 'name': featureName1, 'isEnabled': false };
      const response2 = { 'name': featureName2, 'isEnabled': false };
      let httpCallCount = 0;

      backend.connections.subscribe((connection: MockConnection) => {
        if (connection.request.url === `${apiUri}feature/`) {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify({ 'features': [response1] }),
            status: 200
          })));
        } else {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify(response2),
            status: 200
          })));
        }
        httpCallCount++;
      });

      service = getService();
      service.isEnabled(featureName2).subscribe(() => {
        expect(httpCallCount).toBe(2);
      });
    });
  });

  describe('isEnabled', () => {
    it('should make a GET call with the proper url', () => {
      const expectedFeatureName = 'Foobar';

      backend.connections.subscribe((conn: MockConnection) => {
        expect(conn.request.url).toBe(apiUri + 'feature/' + expectedFeatureName);
        expect(conn.request.method).toBe(RequestMethod.Get);
      });

      service.isEnabled(expectedFeatureName).subscribe();
    });

    it('should make include x-tenant and x-client in headers', () => {
      backend.connections.subscribe((conn: MockConnection) => {
        const headers = conn.request.headers.toJSON();
        expect(headers['X-Tenant']).toContain(tenantId);
        expect(headers['X-Application']).toContain(clientId);
      });

      service.isEnabled('Foobar').subscribe();
    });

    it('should return false if feature is not found', () => {
      backend.connections.subscribe((connection: MockConnection) => {
        connection.mockError(new MockError(new ResponseOptions({
          type: ResponseType.Error,
          body: '',
          status: 404
        })));
      });

      service.isEnabled('foobar').subscribe((status: boolean) => {
        expect(status).toBeFalsy();
      });
    });

    it('should return false and log when service fails other than not found', () => {
      spyOn(console, 'error');

      const responseBody = 'Bad request';
      backend.connections.subscribe((connection: MockConnection) => {
        connection.mockError(new MockError(new ResponseOptions({
          type: ResponseType.Error,
          body: responseBody,
          status: 400
        })));
      });

      service.isEnabled('foobar').subscribe((status: boolean) => {
        expect(status).toBeFalsy();
        expect(console.error).toHaveBeenCalledWith('Failed to get feature flags: ' + responseBody);
      });
    });

    it('should return true when feature exists and is enabled', () => {
      const featureName = 'foobar';
      const response = { 'name': featureName, 'isEnabled': true };
      backend.connections.subscribe((connection: MockConnection) => {
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })));
      });

      service.isEnabled(featureName).subscribe((status: boolean) => {
        expect(status).toBeTruthy();
      });
    });

    it('should return false when feature exists and is disabled', () => {
      const featureName = 'foobar';
      const response = { 'name': featureName, 'isEnabled': false };
      backend.connections.subscribe((connection: MockConnection) => {
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })));
      });

      service.isEnabled(featureName).subscribe((status: boolean) => {
        expect(status).toBeFalsy();
      });
    });
  });

  describe('isDisabled', () => {
    it('should make a GET call with the proper url', () => {
      const expectedFeatureName = 'Foobar';

      backend.connections.subscribe((conn: MockConnection) => {
        expect(conn.request.url).toBe(apiUri + 'feature/' + expectedFeatureName);
        expect(conn.request.method).toBe(RequestMethod.Get);
      });

      service.isDisabled(expectedFeatureName).subscribe();
    });

    it('should make include x-tenant and x-client in headers', () => {
      backend.connections.subscribe((conn: MockConnection) => {
        const headers = conn.request.headers.toJSON();
        expect(headers['X-Tenant']).toContain(tenantId);
        expect(headers['X-Application']).toContain(clientId);
      });

      service.isDisabled('Foobar').subscribe();
    });

    it('should return false if feature is not found', () => {
      backend.connections.subscribe((connection: MockConnection) => {
        connection.mockError(new MockError(new ResponseOptions({
          type: ResponseType.Error,
          body: '',
          status: 404
        })));
      });

      service.isDisabled('foobar').subscribe((status: boolean) => {
        expect(status).toBeFalsy();
      });
    });

    it('should return false and log when service fails other than not found', () => {
      spyOn(console, 'error');

      const responseBody = 'Bad request';
      backend.connections.subscribe((connection: MockConnection) => {
        connection.mockError(new MockError(new ResponseOptions({
          type: ResponseType.Error,
          body: responseBody,
          status: 400
        })));
      });

      service.isDisabled('foobar').subscribe((status: boolean) => {
        expect(status).toBeFalsy();
        expect(console.error).toHaveBeenCalledWith('Failed to get feature flags: ' + responseBody);
      });
    });

    it('should return false when feature exists and is enabled', () => {
      const featureName = 'foobar';
      const response = { 'name': featureName, 'isEnabled': true };
      backend.connections.subscribe((connection: MockConnection) => {
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })));
      });

      service.isDisabled(featureName).subscribe((status: boolean) => {
        expect(status).toBeFalsy();
      });
    });

    it('should return true when feature exists and is disabled', () => {
      const featureName = 'foobar';
      const response = { 'name': featureName, 'isEnabled': false };
      backend.connections.subscribe((connection: MockConnection) => {
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })));
      });

      service.isDisabled(featureName).subscribe((status: boolean) => {
        expect(status).toBeTruthy();
      });
    });
  });
});
