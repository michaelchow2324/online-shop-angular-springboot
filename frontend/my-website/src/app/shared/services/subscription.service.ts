import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface Subscription {
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private http = inject(HttpClient);
}
