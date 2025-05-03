import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cadastro-estacionmentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './cadastro-estacionmentos.component.html',
  styleUrl: './cadastro-estacionmentos.component.css'
})

export class CadastroEstacionmentosComponent {

  mensagemSucesso: string = '';
  mensagemErro: string = '';

  estados = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' }
  ];


  constructor(private httpClient: HttpClient) { }

  form = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(5)]),
    logradouro: new FormControl('', [Validators.required, Validators.minLength(10)]),
    numero: new FormControl('', [Validators.required, Validators.minLength(1)]),
    complemento: new FormControl('', [Validators.minLength(10)]),
    uf: new FormControl('', [Validators.required]),
    cep: new FormControl('', [Validators.required, Validators.minLength(8)]),
    quantidadeVagasCarro: new FormControl('', [Validators.required, Validators.min(0)]),
    quantidadeVagasMotocicleta: new FormControl('', [Validators.required, Validators.min(0)]),
    quantidadeVagasPreferencial: new FormControl('', [Validators.required, Validators.min(0)]),
    valorHora: new FormControl('', [Validators.required, Validators.min(0)]),
    valorFracao: new FormControl('', [Validators.required, Validators.min(0)]),
    toleranciaMinutos: new FormControl('', [Validators.required, Validators.min(0)]),
  });

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    console.log('Enviando formulário...');
    if (this.form.invalid) return;

    this.mensagemSucesso = '';
    this.mensagemErro = '';

    const tiposVeiculos = [1, 2, 3]; // 1: Carro, 2: Motocicleta, 3: Preferencial

    const enderecoCompleto = `${this.form.value.logradouro}, ${this.form.value.numero}, ${this.form.value.complemento}, ${this.form.value.uf}, ${this.form.value.cep}`;

    const dados = {
      nome: this.form.value.nome,
      endereco: enderecoCompleto,
      quantidadeVagasCarro: this.form.value.quantidadeVagasCarro,
      quantidadeVagasMotocicleta: this.form.value.quantidadeVagasMotocicleta,
      quantidadeVagasPreferencial: this.form.value.quantidadeVagasPreferencial
    };

    this.httpClient.post(environment.apiEparking + "/estacionamento", dados)
      .subscribe({
        next: (data: any) => {
          const estacionamentoId = data.id;

          tiposVeiculos.forEach(tipo => {
            this.httpClient.post(`${environment.apiEparking}/tarifa`, {
              estacionamentoId,
              tipoVeiculo: tipo,
              valorHora: this.form.value.valorHora,
              valorFracao: this.form.value.valorFracao,
              toleranciaMinutos: this.form.value.toleranciaMinutos
            })
              .subscribe({
                next: () => {
                  this.mensagemSucesso = 'Estacionamento e tarifas cadastrados com sucesso!';
                },
                error: () => {
                  this.mensagemErro = 'Erro ao cadastrar uma ou mais tarifas.';
                }
              });
          });

          this.form.reset();
        }
      });
  }
}


