import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Client } from '../../models/client.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private apiUrl = 'https://5.189.184.133:3000/api/fila';

  constructor(private http: HttpClient) {}

  findById(clientId: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${clientId}`);
  }
}
