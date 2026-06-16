import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";

export interface InstagramPost {
  id: string;
  imageUrl: string;
  permalink: string;
  mediaType: string;
  timestamp: string;
}

@Injectable({ providedIn: "root" })
export class InstagramService {
  private http = inject(HttpClient);

  getFeed(): Observable<InstagramPost[]> {
    return this.http.get<InstagramPost[]>(
      `${environment.apiUrl}/instagram/feed`,
    );
  }
}
