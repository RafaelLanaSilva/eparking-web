import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-controle-estacionamentos',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './controle-estacionamentos.component.html',
  styleUrl: './controle-estacionamentos.component.css'
})
export class ControleEstacionamentosComponent {

  mensagemSucesso: string = '';
  mensagemErro: string = '';
  estacionamentos: any = null;
  vagas: any[] = [];
  veiculos: any = null;
  veiculoIdCadastrado: string | null = null;
  placaBusca: string = '';
  veiculoEmEdicao: any = null;

  constructor(
    private httpClient: HttpClient,
    private activatedRoute: ActivatedRoute
  ) {}

  form = new FormGroup({
    modelo: new FormControl('', [Validators.required]),
    placa: new FormControl('', [Validators.required]),
    cor: new FormControl('', [Validators.required]),
    tipoVeiculo: new FormControl('', [Validators.required])
  });

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.mensagemSucesso = '';
    this.mensagemErro = '';

    const dados = {
      modelo: this.form.value.modelo,
      placa: this.form.value.placa,
      cor: this.form.value.cor,
      tipoVeiculo: Number(this.form.value.tipoVeiculo)
    };

    this.httpClient.post(`${environment.apiEparking}/veiculo`, dados)
      .subscribe({
        next: (response: any) => {
          this.mensagemSucesso = 'Veículo cadastrado com sucesso!';
          this.form.reset();
          this.veiculoIdCadastrado = response.id;          

          const idEstacionamento = this.activatedRoute.snapshot.paramMap.get('id')!;
          this.httpClient.get<any[]>(`${environment.apiEparking}/vaga/estacionamento/${idEstacionamento}`)
            .subscribe({
              next: (vagas) => {
                const vagaDisponivel = vagas.find(vaga => !vaga.ocupado);
                if (vagaDisponivel) {
                  const movimentacao = {
                    estacionamentoId: idEstacionamento,
                    vagaId: vagaDisponivel.id,
                    veiculoId: this.veiculoIdCadastrado,
                    horaEntrada: new Date().toISOString(),
                    horaSaida: null
                  };

                  this.httpClient.post(`${environment.apiEparking}/movimentacao`, movimentacao)
                    .subscribe({
                      next: () => {
                        // PUT para atualizar a vaga como ocupada
                        const vagaAtualizada = {
                          ...vagaDisponivel,
                          ocupado: true
                        };

                        this.httpClient.put(`${environment.apiEparking}/vaga/${vagaDisponivel.id}`, vagaAtualizada)
                          .subscribe({
                            next: () => {
                              this.mensagemSucesso += ' O veículo ocupou uma vaga com sucesso!';
                              this.loadVagas(idEstacionamento);
                            },
                            error: () => {
                              this.mensagemErro = 'Erro ao atualizar status da vaga!';
                            }
                          });
                      },
                      error: () => {
                        this.mensagemErro = 'Erro ao registrar a ocupação da vaga!';
                      }
                    });
                } else {
                  this.mensagemErro = 'Não há vagas disponíveis no estacionamento.';
                }
              },
              error: () => {
                this.mensagemErro = 'Erro ao buscar vagas.';
              }
            });
        },
        error: () => {
          this.mensagemErro = 'Erro ao cadastrar veículo!';
        }
      });
  }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.loadEstacionamentos(id);
      this.loadVagas(id);
    }
  }

  loadEstacionamentos(id: string) {
    this.httpClient.get(`${environment.apiEparking}/estacionamento/${id}`)
      .subscribe({
        next: (data) => {
          this.estacionamentos = data;
        },
        error: (e) => {
          console.log(e.error);
        }
      });
  }

  loadVagas(id: string) {
    this.httpClient.get(`${environment.apiEparking}/vaga/estacionamento/${id}`)
      .subscribe({
        next: (data) => {
          this.vagas = (data as any[]).sort((a, b) => a.numero - b.numero);
        },
        error: (e) => {
          console.log(e.error);
        }
      });
  }

  loadVeiculosPorPlaca(placa: string) {
    this.httpClient.get(`${environment.apiEparking}/veiculo/placa/${placa}`)
      .subscribe({
        next: (data) => {
          this.veiculos = [data];
        },
        error: (e) => {
          console.log(e.error);
        }
      });
  }

  ocuparVaga(vagaId: string) {
    if (!this.veiculoIdCadastrado) {
      this.mensagemErro = 'Cadastre o veículo antes de ocupar uma vaga.';
      return;
    }

    const idEstacionamento = this.activatedRoute.snapshot.paramMap.get('id');

    const movimentacao = {
      estacionamentoId: idEstacionamento,
      vagaId: vagaId,
      veiculoId: this.veiculoIdCadastrado,
      horaEntrada: new Date().toISOString(),
      horaSaida: null
    };

    this.httpClient.post(`${environment.apiEparking}/movimentacao`, movimentacao)
      .subscribe({
        next: () => {
          this.httpClient.put(`${environment.apiEparking}/vaga/${vagaId}`, {
            ocupado: true
          }).subscribe({
            next: () => {
              this.mensagemSucesso = 'Vaga ocupada com sucesso!';
              this.loadVagas(idEstacionamento!);
            },
            error: () => {
              this.mensagemErro = 'Erro ao atualizar status da vaga!';
            }
          });
        },
        error: () => {
          this.mensagemErro = 'Erro ao ocupar vaga!';
        }
      });
  }

  buscarPorPlaca() {
    if (!this.placaBusca || this.placaBusca.trim().length < 3) {
      this.mensagemErro = 'Digite uma placa válida para buscar.';
      return;
    }

    this.loadVeiculosPorPlaca(this.placaBusca.trim());
  }

  desocuparVeiculo(veiculo : any){
    const idEstacionamento = this.activatedRoute.snapshot.paramMap.get('id');

    if(veiculo.horaEntrada && !veiculo.horaSaida){
      const horaSaida = new Date().toISOString();

      const tempoEstacionado = new Date(horaSaida).getTime() - new Date(veiculo.horaEntrada).getTime();
      const tarifa = this.calcularTarifa(tempoEstacionado);

      const movimentacao = {
        estacionamentoId: idEstacionamento,
        vagaId: veiculo.vagaId,
        veiculoId: veiculo.id,
        horaEntrada: veiculo.horaEntrada,
        horaSaida: horaSaida,
        tarifa: tarifa
      };

      this.httpClient.put(`${environment.apiEparking}/movimentacao/${veiculo.id}`, movimentacao)
      .subscribe({
        next: () => {
          this.mensagemSucesso = 'Veículo desocupado com sucesso!';
          this.loadVagas(idEstacionamento!);
          this.loadVeiculosPorPlaca(veiculo.placa);
        },
        error: () => {
          this.mensagemErro = 'Erro ao desocupar veículo!';
        }
      });
    } else {
      this.mensagemErro = 'Veículo já está desocupado ou não possui hora de entrada registrada.';
    }
  }

  calcularTarifa(tempoEstacionado: number): number {
    const horas = Math.floor(tempoEstacionado / (1000 * 60 * 60));
    const minutos = Math.floor((tempoEstacionado % (1000 * 60 * 60)) / (1000 * 60));
    const tarifaPorHora = 5; // Ajuste o valor conforme a lógica do seu sistema
    return horas * tarifaPorHora + (minutos > 0 ? tarifaPorHora : 0); // Lógica simples para tarifa
  }

  editarVeiculo(veiculo: any) {
    this.veiculoEmEdicao= veiculo;
    this.form.patchValue({
      modelo: veiculo.modelo,
      placa: veiculo.placa,
      cor: veiculo.cor,
      tipoVeiculo: veiculo.tipoVeiculo
    });
  }

  editarFormulario() {
    if (this.form.invalid) return;

    const dados = {
      modelo: this.form.value.modelo,
      placa: this.form.value.placa,
      cor: this.form.value.cor,
      tipoVeiculo: Number(this.form.value.tipoVeiculo)
    };

    this.httpClient.put(`${environment.apiEparking}/veiculo/${this.veiculoEmEdicao.id}`, dados)
      .subscribe({
        next: () => {
          this.mensagemSucesso = 'Veículo atualizado com sucesso!';
          this.loadVeiculosPorPlaca(this.veiculoEmEdicao.placa);
          this.veiculoEmEdicao = null; 
        },
        error: () => {
          this.mensagemErro = 'Erro ao editar veículo!';
        }
      });
  }

  
}
