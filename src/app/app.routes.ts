import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { CadastroEstacionmentosComponent } from './pages/cadastro-estacionmentos/cadastro-estacionmentos.component';
import { ConsultaEstacionamentosComponent } from './pages/consulta-estacionamentos/consulta-estacionamentos.component';
import { ConsultaVagasComponent } from './pages/consulta-vagas/consulta-vagas.component';

export const routes: Routes = [
    {
        path: 'pages/cadastro-estacionamentos',
        component: CadastroEstacionmentosComponent
    },
    {
        path: 'pages/consulta-estacionamentos',
        component: ConsultaEstacionamentosComponent
    },
    {
        path: 'pages/consulta-vagas',
        component: ConsultaVagasComponent
    }
];
