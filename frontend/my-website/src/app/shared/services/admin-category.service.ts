import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import {
  AdminCategory,
  AdminCategoryPage,
  UpsertCategoryBody,
} from "../interface/admin-category.interface";

@Injectable({
  providedIn: "root",
})
export class AdminCategoryService {
  private http = inject(HttpClient);

  list(options: {
    page?: number;
    size?: number;
    q?: string;
    active?: boolean | null;
  } = {}): Observable<AdminCategoryPage> {
    let params = new HttpParams()
      .set("page", String(options.page ?? 0))
      .set("size", String(options.size ?? 20));
    if (options.q?.trim()) {
      params = params.set("q", options.q.trim());
    }
    if (options.active === true || options.active === false) {
      params = params.set("active", String(options.active));
    }
    return this.http.get<AdminCategoryPage>(
      `${environment.apiUrl}/admin/categories`,
      { params },
    );
  }

  get(id: number): Observable<AdminCategory> {
    return this.http.get<AdminCategory>(
      `${environment.apiUrl}/admin/categories/${id}`,
    );
  }

  create(body: UpsertCategoryBody): Observable<AdminCategory> {
    return this.http.post<AdminCategory>(
      `${environment.apiUrl}/admin/categories`,
      body,
    );
  }

  update(id: number, body: UpsertCategoryBody): Observable<AdminCategory> {
    return this.http.put<AdminCategory>(
      `${environment.apiUrl}/admin/categories/${id}`,
      body,
    );
  }

  setActive(id: number, active: boolean): Observable<AdminCategory> {
    return this.http.patch<AdminCategory>(
      `${environment.apiUrl}/admin/categories/${id}/status`,
      { active },
    );
  }

  uploadImage(id: number, file: File): Observable<AdminCategory> {
    const data = new FormData();
    data.append("file", file, file.name);
    return this.http.post<AdminCategory>(
      `${environment.apiUrl}/admin/categories/${id}/image`,
      data,
    );
  }

  deleteImage(id: number): Observable<AdminCategory> {
    return this.http.delete<AdminCategory>(
      `${environment.apiUrl}/admin/categories/${id}/image`,
    );
  }
}
