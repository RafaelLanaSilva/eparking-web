import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroEstacionmentosComponent } from './cadastro-estacionmentos.component';

describe('CadastroEstacionmentosComponent', () => {
  let component: CadastroEstacionmentosComponent;
  let fixture: ComponentFixture<CadastroEstacionmentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroEstacionmentosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroEstacionmentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
