import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Voter } from './voter';

describe('Voter', () => {
  let component: Voter;
  let fixture: ComponentFixture<Voter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Voter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Voter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
