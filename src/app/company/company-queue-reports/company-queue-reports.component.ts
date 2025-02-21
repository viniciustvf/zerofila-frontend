import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { QueueService } from '../services/queue.service';

@Component({
  selector: 'app-company-queue-reports',
  standalone: true,
  imports: [
    FormsModule,
    CalendarModule,
    CardModule,
    CommonModule
  ],
  templateUrl: './company-queue-reports.component.html',
  styleUrl: './company-queue-reports.component.scss'
})
export class CompanyQueueReportsComponent implements OnInit {
  dadosRelatorio: any[] = [];
  startDate: Date = new Date();
  endDate: Date = new Date();
  relatorioGerado = false;
  tempoMedioEspera = '0h';
  totalClientesAtendidos = 0;
  clientesNaFila = 0;
  clientesDesistiram = 0;
  percentualDesistencia = '0%';
  percentualDesistentes = '0%'; // Nova variável para armazenar a porcentagem de desistentes

  constructor(private queueService: QueueService) {}

  ngOnInit(): void {
    this.definirDatasPadrao();
  }

  definirDatasPadrao(): void {
    const hoje = new Date();
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(hoje.getDate() - 7);
    this.startDate = seteDiasAtras;
    this.endDate = hoje;
  }

  obterRelatorio(): void {
    const empresaData = sessionStorage.getItem('empresa');
    if (!empresaData) {
      console.error('Empresa não encontrada no sessionStorage.');
      return;
    }

    try {
      const empresa = JSON.parse(empresaData);
      const empresaId = empresa.id;
      const startDateFormatted = this.formatarData(this.startDate);
      const endDateFormatted = this.formatarData(this.endDate);

      this.queueService.getCompanyClients(empresaId, startDateFormatted, endDateFormatted).subscribe(
        (dados) => {
          this.dadosRelatorio = dados;
          this.calcularEstatisticas();
          this.relatorioGerado = true;
        },
        (erro) => {
          console.error('Erro ao obter relatório:', erro);
        }
      );
    } catch (error) {
      console.error('Erro ao processar empresa do sessionStorage:', error);
    }
  }

  calcularEstatisticas(): void {
    const temposEspera: number[] = [];
    let atendidos = 0;
    let naFila = 0;
    let desistiram = 0;

    this.dadosRelatorio.forEach(cliente => {
      if (cliente.exitTime) {
        const tempoEspera = new Date(cliente.exitTime).getTime() - new Date(cliente.entryTime).getTime();
        if (tempoEspera > 0) {
          temposEspera.push(tempoEspera);
        }
        atendidos++;
      } else if (cliente.filaId === null && cliente.exitTime === null) {
        desistiram++;
      } else {
        naFila++;
      }
    });

    const mediaMs = temposEspera.length > 0 ? temposEspera.reduce((a, b) => a + b, 0) / temposEspera.length : 0;
    const mediaHoras = mediaMs > 0 ? (mediaMs / 3600000).toFixed(2) : '0';
    this.tempoMedioEspera = `${mediaHoras}h`;
    this.totalClientesAtendidos = atendidos;
    this.clientesNaFila = naFila;
    this.clientesDesistiram = desistiram;
    this.percentualDesistencia = atendidos > 0 ? `${((desistiram / atendidos) * 100).toFixed(2)}%` : '0%';
    this.percentualDesistentes = atendidos > 0 ? `${((desistiram / (atendidos + desistiram)) * 100).toFixed(2)}%` : '0%'; // Cálculo da porcentagem de desistentes
  }

  formatarData(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}-${mes}-${ano}`;
  }
}
