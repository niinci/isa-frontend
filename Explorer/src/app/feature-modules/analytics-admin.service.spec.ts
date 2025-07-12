import { TestBed } from '@angular/core/testing';

import { AnalyticsAdminService } from './analytics-admin.service';

describe('AnalyticsAdminService', () => {
  let service: AnalyticsAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalyticsAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
