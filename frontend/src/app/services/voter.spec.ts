import { TestBed } from '@angular/core/testing';

import { Voter } from './voter';

describe('Voter', () => {
  let service: Voter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Voter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
