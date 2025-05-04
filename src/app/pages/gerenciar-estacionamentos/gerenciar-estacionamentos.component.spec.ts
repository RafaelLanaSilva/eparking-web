import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerenciarEstacionamentosComponent } from './gerenciar-estacionamentos.component';

describe('GerenciarEstacionamentosComponent', () => {
  let component: GerenciarEstacionamentosComponent;
  let fixture: ComponentFixture<GerenciarEstacionamentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciarEstacionamentosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GerenciarEstacionamentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
