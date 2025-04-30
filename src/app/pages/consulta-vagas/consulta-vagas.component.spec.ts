import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaVagasComponent } from './consulta-vagas.component';

describe('ConsultaVagasComponent', () => {
  let component: ConsultaVagasComponent;
  let fixture: ComponentFixture<ConsultaVagasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaVagasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaVagasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
