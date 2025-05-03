import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-consulta-estacionamentos',
  imports: [
    CommonModule,
  ],
  templateUrl: './consulta-estacionamentos.component.html',
  styleUrl: './consulta-estacionamentos.component.css'
})
export class ConsultaEstacionamentosComponent {

  estacionamentos: any[] = [];

  constructor(private httpCliente: HttpClient) {}

  ngOnInit() {
    this.loadEstacionamentos();
  }

  loadEstacionamentos() {
    this.httpCliente.get(environment.apiEparking + "/estacionamento")
    .subscribe({
      next: (data) => {
        this.estacionamentos = data as any[];
      },
      error: (e) => {
        console.log(e.error);
      }
    });
  }


}
