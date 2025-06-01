import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap, map, catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';


@Component({
  selector: 'app-controle-estacionamentos',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './controle-estacionamentos.component.html',
  styleUrl: './controle-estacionamentos.component.css'
})
export class ControleEstacionamentosComponent {

  mensagemSucesso: string = '';
  mensagemErro: string = '';
  estacionamentos: any = null;
  vagas: any[] = [];
  tarifas: any[] = [];
  veiculos: any = null;
  veiculoIdCadastrado: string | null = null;
  placaBusca: string = '';
  idVeiculoEditando: string | null = null;
  placaBuscada = '';
  veiculoEncontrado: any = null;
  valorCobrado: number | null = null;

  constructor(
    private httpClient: HttpClient,
    private activatedRoute: ActivatedRoute
  ) { }

  form = new FormGroup({
    modelo: new FormControl('', [Validators.required]),
    placa: new FormControl('', [Validators.required]),
    cor: new FormControl('', [Validators.required]),
    tipoVeiculo: new FormControl('', [Validators.required])
  });

  get f() {
    return this.form.controls;
  }

  editarVeiculo(veiculo: any) {
    // Popular o formulário com os dados do veículo recebido
    this.form.patchValue({
      modelo: veiculo.modelo,
      placa: veiculo.placa,
      cor: veiculo.cor,
      tipoVeiculo: veiculo.tipoVeiculo
    });

    // Guardar o id do veículo para usar no PUT depois
    this.idVeiculoEditando = veiculo.id;
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.mensagemSucesso = '';
    this.mensagemErro = '';

    const tipoVeiculo = Number(this.form.value.tipoVeiculo); 

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
                          
                const vagaDisponivel = vagas.find(vaga => !vaga.ocupado && vaga.tipoVaga === tipoVeiculo);

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
                  this.mensagemErro = 'Não há vagas disponíveis para este tipo de veículo.';
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
      this.loadTarifas(id);
    }
  }

  loadEstacionamentos(id: string) {
    this.httpClient.get(`${environment.apiEparking}/estacionamento/${id}`)
      .subscribe({
        next: (data) => {
          this.estacionamentos = data;
        },
      });
  }

  loadVagas(id: string) {
  this.httpClient.get<any[]>(`${environment.apiEparking}/vaga/estacionamento/${id}`)
    .pipe(
      switchMap(vagas => {
        // Para cada vaga, montar um Observable que pega movimentação e veículo
        const vagasComVeiculo$ = vagas.map(vaga => {
          return this.httpClient.get<any[]>(`${environment.apiEparking}/movimentacao/vaga/${vaga.id}`).pipe(
            switchMap(movs => {
              const movimentacaoAberta = movs.find(m => !m.horaSaida);
              if (movimentacaoAberta) {
                return this.httpClient.get<any>(`${environment.apiEparking}/veiculo/${movimentacaoAberta.veiculoId}`).pipe(
                  map(veiculo => {
                    vaga.veiculo = veiculo; // adiciona o veículo na vaga
                    return vaga;
                  }),
                  catchError(() => {
                    vaga.veiculo = null;
                    return of(vaga);
                  })
                );
              } else {
                vaga.veiculo = null;
                return of(vaga);
              }
            }),
            catchError(() => {
              vaga.veiculo = null;
              return of(vaga);
            })
          );
        });

        // forkJoin espera todos os observables e retorna array com vagas atualizadas
        return forkJoin(vagasComVeiculo$);
      })
    )
    .subscribe({
      next: (vagasComVeiculo) => {
        this.vagas = vagasComVeiculo.sort((a, b) => a.numero - b.numero);
      },
      error: (error) => {
        console.error('Erro ao carregar vagas e veículos', error);
      }
    });
}

  loadTarifas(id: string) {
    this.httpClient.get(`${environment.apiEparking}/tarifa/estacionamento/${id}`)
      .subscribe({
        next: (data) => {
          this.tarifas = data as any[];
        },
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

  desocuparVeiculo(veiculo: any) {
  const idEstacionamento = this.activatedRoute.snapshot.paramMap.get('id');

  this.mensagemErro = '';
  this.mensagemSucesso = '';

  this.httpClient.get<any[]>(`${environment.apiEparking}/movimentacao/veiculo/${veiculo.id}`)
    .subscribe({
      next: (movimentacoes) => {
        const movimentacaoAberta = movimentacoes.find(m => !m.horaSaida);

        if (!movimentacaoAberta) {
          this.mensagemErro = 'Não há movimentação aberta para este veículo.';
          return;
        }

        const horaSaida = new Date().toISOString();

        const movimentacaoAtualizada = {
          estacionamentoId: movimentacaoAberta.estacionamentoId,
          vagaId: movimentacaoAberta.vagaId,
          veiculoId: movimentacaoAberta.veiculoId,
          horaEntrada: movimentacaoAberta.horaEntrada,
          horaSaida: horaSaida
        };

        this.httpClient.put(`${environment.apiEparking}/movimentacao/${movimentacaoAberta.id}`, movimentacaoAtualizada)
          .subscribe({
            next: (res: any) => {
              const valorCobrado = res.valorCobrado;
              this.valorCobrado = valorCobrado;
              this.mensagemSucesso = "Veículo desocupado com sucesso!";

              // Buscar a vaga completa para atualizar corretamente
              this.httpClient.get<any>(`${environment.apiEparking}/vaga/${movimentacaoAberta.vagaId}`)
                .subscribe({
                  next: (vagaCompleta) => {
                    // Montar o objeto exatamente conforme o esperado pelo backend
                    const vagaAtualizada = {
                      id: vagaCompleta.id,
                      numero: vagaCompleta.numero,
                      tipoVaga: vagaCompleta.tipoVaga,
                      ocupado: false,
                      estacionamentoId: vagaCompleta.estacionamentoId
                    };

                    this.httpClient.put(`${environment.apiEparking}/vaga/${vagaAtualizada.id}`, vagaAtualizada)
                      .subscribe({
                        next: () => {
                          // Atualiza localmente o status da vaga
                          const index = this.vagas.findIndex(v => v.id === vagaAtualizada.id);
                          if (index !== -1) {
                            this.vagas[index].ocupado = false;
                            this.vagas[index].veiculo = null;
                            this.vagas = [...this.vagas];
                          }

                          this.loadVagas(idEstacionamento!);
                          this.loadVeiculosPorPlaca(veiculo.placa);
                          this.veiculoEncontrado = null;
                          this.placaBuscada = '';
                          this.mensagemSucesso += ' Vaga liberada com sucesso!';
                        },
                        error: () => {
                          this.mensagemErro = 'Erro ao atualizar status da vaga!';
                        }
                      });
                  },
                  error: () => {
                    this.mensagemErro = 'Erro ao buscar dados da vaga.';
                  }
                });
            },
            error: () => {
              this.mensagemErro = 'Erro ao registrar a saída do veículo!';
            }
          });
      },
      error: () => {
        this.mensagemErro = 'Erro ao buscar movimentações do veículo!';
      }
    });
}


  loadVeiculosComMovimentacao() {
  const idEstacionamento = this.activatedRoute.snapshot.paramMap.get('id');

  this.httpClient.get<any[]>(`${environment.apiEparking}/veiculo`)
    .subscribe({
      next: (veiculos) => {
        // Para cada veículo, buscar movimentação com vaga
        const requisicoes = veiculos.map(veiculo =>
          this.httpClient.get<any[]>(`${environment.apiEparking}/movimentacao/veiculo/${veiculo.id}`).pipe(
            map(movs => {
              const movimentacaoAberta = movs.find(m => !m.horaSaida);
              return {
                ...veiculo,
                numeroVaga: movimentacaoAberta?.vaga?.numero ?? null
              };
            })
          )
        );

        forkJoin(requisicoes).subscribe((veiculosComVaga) => {
          this.veiculos = veiculosComVaga;
        });
      }
    });
  }


}
