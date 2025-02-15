import { Injectable, Inject, PLATFORM_ID, inject, ApplicationRef } from '@angular/core';
import { first, Observable, of, shareReplay, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Client } from '../models/client.interface';

@Injectable({
  providedIn: 'root',
})
export class FilaSocketService {
  
  private socket!: Socket;

  constructor() {
    // Define a URL do WebSocket
    const WS_URL = 'wss://zerofila.shop/ws';  // Certifique-se que o caminho está correto

    this.socket = io(WS_URL, {
      autoConnect: false,  // Evita conexão automática, será feita manualmente
      reconnection: true,  // Habilita tentativas de reconexão
      reconnectionAttempts: 10,  // Número máximo de tentativas de reconexão
      reconnectionDelay: 5000,  // Tempo de espera entre tentativas (5s)
      transports: ['websocket'],  // Força o uso de WebSocket e evita polling
    });

    // Espera o Angular estar estável antes de conectar
    inject(ApplicationRef).isStable.pipe(first(isStable => isStable))
      .subscribe(() => {
        console.log('🔌 Tentando conectar ao WebSocket...');
        this.socket.connect();
      });

    // Evento de conexão bem-sucedida
    this.socket.on('connect', () => {
      console.log('✅ Conectado ao WebSocket!');
    });

    // Evento de erro na conexão
    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro na conexão WebSocket:', error);
    });

    // Evento de desconexão
    this.socket.on('disconnect', (reason) => {
      console.warn(`⚠️ WebSocket desconectado: ${reason}`);
    });

    // Loga qualquer evento recebido para debug
    this.socket.onAny((event, ...args) => {
      console.log(`📩 Evento recebido: ${event}`, args);
    });
  }

  joinQueue(clientData: { name: string; telefone?: string; filaId: string}): void {
    if (this.socket) {
      this.socket.emit('joinQueue', clientData);
      console.log(clientData)
    }
  }

  joinRoom(filaId: string): void {
    if (this.socket) {
      this.socket.emit('joinRoom', { filaId });
      console.log(`Entrando na sala da fila ${filaId}`);
    }
  }

  leaveQueue(data: { filaId: string; telefone: string }): void {
    this.socket.emit('leaveQueue', data);
  }

  viewQueue(filaId: { filaId: string}): Observable<void> {
    if (this.socket) {
      this.socket.emit('viewQueue', filaId);
    }
    return of(void 0);
  }

  callNextClient(filaId: string): void {
    if (this.socket) {
      this.socket.emit('callNextClient', filaId);
    }
  }

  listenForClientCalled(): Observable<Client> {
    return new Observable((observer) => {
      this.socket.on('clientCalled', (client: Client) => {
        observer.next(client);
      });
  
      return () => this.socket.off('clientCalled');
    });
  }

  listenForQueueUpdate(): Observable<Client[]> {
    return new Observable((observer) => {
      this.socket.on('queueUpdate', (sortedClients) => {
        observer.next(sortedClients);
      });
  
      return () => this.socket.off('queueUpdate');
    });
  }

  listenForQueueUrlUpdate(): Observable<{ url: string }> {
    return new Observable<{ url: string }>((observer) => {
      this.socket.on('queueUrlUpdated', (data: { url: string }) => {
        observer.next(data);
      });

      return () => this.socket.off('queueUrlUpdated');
    });
  }

  viewQrCode(): Observable<void> {
    if (this.socket) {
      this.socket.emit('queueUrlUpdated');
    }
    return of(void 0);
  }

  listenForErrors(): Observable<{ message: string }> {
    return new Observable<{ message: string }>((observer) => {
      const errorHandler = (errorData: { message: string }) => {
        console.error('Erro recebido do WebSocket:', errorData.message);
        observer.next(errorData);
        this.socket.off('error', errorHandler);
      };
  
      this.socket.on('error', errorHandler);
  
      return () => this.socket.off('error', errorHandler);
    });
  }
}