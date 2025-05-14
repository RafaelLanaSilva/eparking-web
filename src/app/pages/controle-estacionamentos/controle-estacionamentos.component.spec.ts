import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControleEstacionamentosComponent } from './controle-estacionamentos.component';

describe('ControleEstacionamentosComponent', () => {
  let component: ControleEstacionamentosComponent;
  let fixture: ComponentFixture<ControleEstacionamentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControleEstacionamentosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControleEstacionamentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
