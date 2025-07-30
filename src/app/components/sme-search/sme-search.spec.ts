import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmeSearch } from './sme-search';

describe('SmeSearch', () => {
  let component: SmeSearch;
  let fixture: ComponentFixture<SmeSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmeSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmeSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
