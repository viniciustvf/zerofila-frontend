import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Fila } from '../../models/fila.interface';
import { Client } from '../../models/client.interface';
import { StorageService } from '../../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  private apiUrl = 'https://zerofila.shop/api/fila';
  private empresaUrl = 'https://zerofila.shop/api/empresa';

  constructor(private http: HttpClient, private storageService: StorageService) {}

  /**
 * Obtém a lista de clientes de uma empresa dentro de um intervalo de datas.
 * @param empresaId ID da empresa
 * @param startDate Data de início no formato YYYY-MM-DD
 * @param endDate Data de fim no formato YYYY-MM-DD
 * @returns Observable com a lista de clientes
 */
getCompanyClients(empresaId: number, startDate: string, endDate: string): Observable<Client[]> {
  return this.http.get<Client[]>(
    `https://zerofila.shop/api/client/empresa/${empresaId}/clientes/${startDate}/${endDate}`,
    { headers: this.getHeaders() }
  );
}


  /**
   * Obtém os headers com o token JWT
   */
  private getHeaders(): HttpHeaders {
    const token = this.storageService.getItem('accessToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Cria uma nova fila.
   * @param fila Objeto contendo os dados da fila
   * @returns Observable com a resposta do backend
   */
  criaFila(fila: Fila): Observable<Fila> {
    return this.http.post<Fila>(this.apiUrl, fila, { headers: this.getHeaders() });
  }

  /**
 * Atualiza uma fila existente.
 * @param filaId ID da fila a ser atualizada
 * @param filaData Dados a serem atualizados
 * @returns Observable com a resposta do backend
 */
  updateFila(filaId: number, filaData: Partial<Fila>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${filaId}`, filaData, { headers: this.getHeaders() });
  }

  /**
 * Atualiza os dados da empresa.
 * @param empresaId ID da empresa
 * @param empresaData Dados a serem atualizados
 * @returns Observable com a resposta do backend
 */
  updateEmpresa(empresaId: number, empresaData: any): Observable<any> {
    const empresaUpdate = { ...empresaData };
    delete empresaUpdate.password;
    delete empresaUpdate.id;

    console.log(empresaUpdate, 'EMPRESA A SER ATUALIZADA')
    return this.http.put<any>(`${this.empresaUrl}/${empresaId}`, empresaUpdate, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Busca todas as filas.
   * @returns Observable com a lista de filas
   */
  buscaTodasFilas(): Observable<Fila[]> {
    const empresaData = sessionStorage.getItem('empresa');
  
    if (!empresaData) {
      console.error('Empresa não encontrada no sessionStorage.');
      return new Observable<Fila[]>((observer) => {
        observer.error('Empresa não encontrada.');
        observer.complete();
      });
    }
  
    try {
      const empresa = JSON.parse(empresaData);
      const empresaId = empresa.id;
  
      const params = new HttpParams().set('empresaId', empresaId);
  
      return this.http.get<Fila[]>(this.apiUrl, {
        headers: this.getHeaders(),
        params
      });
    } catch (error) {
      console.error('Erro ao parsear empresa do sessionStorage:', error);
      return new Observable<Fila[]>((observer) => {
        observer.error('Erro ao recuperar empresa.');
        observer.complete();
      });
    }
  }

  /**
   * Busca uma fila pelo ID.
   * @param filaId ID da fila a ser buscada
   * @returns Observable com os dados da fila encontrada
   */
  findById(filaId: string): Observable<Fila> {
    return this.http.get<Fila>(`${this.apiUrl}/findByIdWithRelations/${filaId}`, { headers: this.getHeaders() });
  }

  /**
   * Busca uma empresa pelo ID.
   * @param empresaId ID da empresa a ser buscada
   * @returns Observable com os dados da empresa encontrada
   */
  findEmpresaById(empresaId: number): Observable<any> {
    return this.http.get<any>(`${this.empresaUrl}/${empresaId}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Valida o hash de uma fila.
   * @param hash Hash a ser validado
   * @returns Observable com a resposta de validação do backend
   */
  validateHash(hash: string): Observable<{ isValid: boolean; message: string }> {
    const body = { hash };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<{ isValid: boolean; message: string }>(
      `${this.apiUrl}/validate-hash`,
      body,
      { headers } 
    );
  }

  /**
   * Verifica se um cliente já está na fila pelo número de telefone.
   * @param telefone Número de telefone do cliente
   * @param filaId ID da fila (deve ser um número)
   * @returns Observable indicando se o cliente já está na fila e os seus dados, se aplicável
   */
  checkClientInQueue(telefone: string, filaId: string | number): Observable<{ exists: boolean; client?: Client }> {
    const parsedFilaId = Number(filaId); // 🛠️ Converte para número
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (isNaN(parsedFilaId) || parsedFilaId <= 0) {
      console.error('❌ Erro no frontend: Fila ID inválido!', { telefone, filaId, parsedFilaId });
      return throwError(() => new Error('Fila ID inválido.'));
    }

    const params = new HttpParams()
      .set('telefone', telefone)
      .set('filaId', parsedFilaId.toString());

    return this.http.get<{ exists: boolean; client?: Client }>(
      `${this.apiUrl}/check-client`,
      { headers: headers, params }
    );
  }

  /**
   * Gera e atualiza o hash das filas no servidor.
   * @returns Observable com a resposta do backend
   */
  generateAndUpdateHash(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/generate-hash`,
      {}, // Corpo vazio, pois o endpoint não requer dados no body
      { headers: this.getHeaders() }
    );
  }

  /**
   * Verifica a fila e notifica os clientes.
   * @returns Observable com a resposta do backend
   */
  checkQueueAndNotify(): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(
      `${this.apiUrl}/check-queue`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtém o tempo estimado por atendimento da fila.
   * @param queueId ID da fila
   * @returns Observable com o tempo estimado de espera
   */
  getEstimatedWaitTime(queueId: string): Observable<{ estimatedTime: number }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<{ estimatedTime: number }>(
      `${this.apiUrl}/${queueId}/estimated-time`,
      { headers: headers }
    );
  }
}