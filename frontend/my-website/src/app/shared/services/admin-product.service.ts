import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import {
  CatalogImportResult,
  AdminProduct,
  AdminProductPage,
  UpsertProductBody,
} from "../interface/admin-product.interface";

@Injectable({
  providedIn: "root",
})
export class AdminProductService {
  private http = inject(HttpClient);

  list(options: {
    page?: number;
    size?: number;
    q?: string;
    active?: boolean | null;
  } = {}): Observable<AdminProductPage> {
    let params = new HttpParams()
      .set("page", String(options.page ?? 0))
      .set("size", String(options.size ?? 20));
    if (options.q?.trim()) {
      params = params.set("q", options.q.trim());
    }
    if (options.active === true || options.active === false) {
      params = params.set("active", String(options.active));
    }
    return this.http.get<AdminProductPage>(
      `${environment.apiUrl}/admin/products`,
      { params },
    );
  }

  get(id: number): Observable<AdminProduct> {
    return this.http.get<AdminProduct>(
      `${environment.apiUrl}/admin/products/${id}`,
    );
  }

  create(body: UpsertProductBody): Observable<AdminProduct> {
    return this.http.post<AdminProduct>(
      `${environment.apiUrl}/admin/products`,
      body,
    );
  }

  update(id: number, body: UpsertProductBody): Observable<AdminProduct> {
    return this.http.put<AdminProduct>(
      `${environment.apiUrl}/admin/products/${id}`,
      body,
    );
  }

  setActive(id: number, active: boolean): Observable<AdminProduct> {
    return this.http.patch<AdminProduct>(
      `${environment.apiUrl}/admin/products/${id}/status`,
      { active },
    );
  }

  uploadImage(id: number, file: File): Observable<AdminProduct> {
    const data = new FormData();
    data.append("file", file, file.name);
    return this.http.post<AdminProduct>(
      `${environment.apiUrl}/admin/products/${id}/images`,
      data,
    );
  }

  setPrimaryImage(id: number, imageId: number): Observable<AdminProduct> {
    return this.http.put<AdminProduct>(
      `${environment.apiUrl}/admin/products/${id}/images/${imageId}/primary`,
      {},
    );
  }

  deleteImage(id: number, imageId: number): Observable<AdminProduct> {
    return this.http.delete<AdminProduct>(
      `${environment.apiUrl}/admin/products/${id}/images/${imageId}`,
    );
  }

  exportCatalog(): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/admin/products/export`, {
      responseType: "blob",
    });
  }

  importCatalog(csv: File, images: File[]): Observable<CatalogImportResult> {
    const data = new FormData();
    data.append("csv", csv, csv.name);
    for (const image of images) {
      data.append("images", image, image.name);
    }
    return this.http.post<CatalogImportResult>(
      `${environment.apiUrl}/admin/products/import`,
      data,
    );
  }
}
