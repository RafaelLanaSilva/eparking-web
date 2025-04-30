import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaEstacionamentosComponent } from './consulta-estacionamentos.component';

describe('ConsultaEstacionamentosComponent', () => {
  let component: ConsultaEstacionamentosComponent;
  let fixture: ComponentFixture<ConsultaEstacionamentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaEstacionamentosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaEstacionamentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
