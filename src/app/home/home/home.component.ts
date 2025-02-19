import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  public empresaNome: string = '';

  constructor(private router: Router, private messageService: MessageService) { }

  ngOnInit(): void {
    const empresaData = sessionStorage.getItem('empresa');

    if (empresaData) {
      try {
        const empresa = JSON.parse(empresaData); 
        this.empresaNome = empresa.name;
      } catch (error) {
        console.error('Erro ao recuperar os dados da empresa:', error);
      }
    }
  }

  abrirFilas(): void {
    this.router.navigate(['/company-queue-list']);
  }

  abrirRelatorios(): void {
    this.router.navigate(['/company-queue-reports']);
    /*this.messageService.add({
      severity: 'info',
      summary: 'Ops!',
      detail: 'Recurso indisponível no momento.',
    });*/
  }

  abrirEmpresa(): void {
    this.router.navigate(['/company-perfil-form']);
  }
}