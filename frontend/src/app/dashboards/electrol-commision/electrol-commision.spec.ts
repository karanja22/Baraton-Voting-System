import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectrolCommision } from './electrol-commision';

describe('ElectrolCommision', () => {
  let component: ElectrolCommision;
  let fixture: ComponentFixture<ElectrolCommision>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElectrolCommision]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElectrolCommision);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
