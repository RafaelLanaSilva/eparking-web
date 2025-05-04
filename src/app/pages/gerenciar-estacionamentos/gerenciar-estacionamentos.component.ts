import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-gerenciar-estacionamentos',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './gerenciar-estacionamentos.component.html',
  styleUrl: './gerenciar-estacionamentos.component.css'
})
export class GerenciarEstacionamentosComponent {

  mensagemSucesso: string = '';
  mensagemErro: string = '';
  estacionamento: any = null;
  tarifa: any = null;

  constructor(
    private httpClient: HttpClient, 
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
    this.loadEstacionamento(id)
    this.loadTarifa(id);
    }
  }

  loadEstacionamento(id: string) {
    this.httpClient.get(`${environment.apiEparking}/estacionamento/${id}`)
    .subscribe({
      next: (data: any) => {
        console.log(data);
        this.estacionamento = data;
      },
      error: () => {
        this.mensagemErro = 'Erro ao carregar o estacionamento.';
      }
    });
  }

  loadTarifa(id: string) {
    this.httpClient.get(`${environment.apiEparking}/tarifa/estacionamento/${id}`)
    .subscribe({
      next: (data: any) => {
        console.log(data);
        this.tarifa = (data as any[])[0];
      },
      error: () => {
        this.mensagemErro = 'Erro ao carregar a tarifa.';
      }
    });
  }

  openEditarEstacionamento(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  openEditarTarifa(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  updateEstacionamento() {
    this.httpClient.put(`${environment.apiEparking}/estacionamento/${this.estacionamento.id}`, this.estacionamento).subscribe(() => {
      console.log('Estacionamento atualizado com sucesso');
    });
  }

  // Atualizar tarifa
  updateTarifa() {
    this.httpClient.put(`${environment.apiEparking}/tarifa/${this.tarifa.id}`, this.tarifa).subscribe(() => {
      console.log('Tarifa atualizada com sucesso');
    });
  }

}
