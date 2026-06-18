import { HttpClient } from '@angular/common/http';
import { Injectable, TransferState, inject, makeStateKey } from '@angular/core';

import { map, Observable, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Params } from '../interface/core.interface';
import { IProduct, IProductModel } from '../interface/product.interface';


// TransferState key ??the server stores fetched products here so the
// browser rehydrates from state instead of making a second HTTP call.
const PRODUCTS_KEY = makeStateKey<IProduct[]>('products');


@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  public skeletonLoader: boolean = false;
  public skeletonCategoryProductLoader: boolean = false;
  public productFilter: boolean = false;
  public searchSkeleton: boolean = false;

  private transferState = inject(TransferState);

  getProducts(payload?: Params): Observable<IProductModel> {
    const locale = this.getLocale();
    // return this.http.get<IProductModel>(`${environment.URL}/product.json`, { params: payload });
     const transferred = this.transferState.get<IProduct[] | null>(PRODUCTS_KEY, null);
    if (transferred) {
      this.transferState.remove(PRODUCTS_KEY);
      const data = transferred as IProduct[];
      return of({ data, total: data.length } as IProductModel);
    }

    let url = `${environment.apiUrl}/categories`;
    let params: Params = payload ? { ...payload, locale } : { locale };

    if (params?.['sortBy']) {
      const sortByValue = String(params['sortBy']).trim();
      let sortField = 'id';
      let sortOrder: string | null = null;

      switch (sortByValue) {
        case 'asc':
          // sortField = params['field'] ? String(params['field']).trim() : 'id';
          sortField = 'id';
          sortOrder = 'asc';
          break;
        case 'desc':
          // sortField = params['field'] ? String(params['field']).trim() : 'id';
          sortField = 'id';
          sortOrder = 'desc';
          break;
        case 'a-z':
          sortField = 'name';
          sortOrder = 'asc';
          break;
        case 'z-a':
          sortField = 'name';
          sortOrder = 'desc';
          break;
        case 'low-high':
          sortField = 'price';
          sortOrder = 'asc';
          break;
        case 'high-low':
          sortField = 'price';
          sortOrder = 'desc';
          break;
        default:
          if (params['field']) {
            sortField = String(params['field']).trim();
            sortOrder = sortByValue;
          }
          break;
      }

      if (sortOrder) {
        params['sort'] = `${sortField}, ${sortOrder}`;
      }

      delete params['sortBy'];
      delete params['field'];
    }

    if (params?.['category']) {
      url = `${environment.apiUrl}/categories/${params['category']}/products`;
      const { category, ...rest } = params;
      params = rest;
    }

    return this.http
      .get<IProduct[] | { content?: IProduct[]; totalElements?: number; total?: number }>(url, { params })
      .pipe(
        // Seed TransferState during SSR so the browser payload includes data.
        // store the products in TransferState, so the browser can rehydrate from it instead of making another HTTP call later (cache + SSR).
        tap((result) => {
          const data = Array.isArray(result)
            ? result
            : result?.content ?? [];
          this.transferState.set(PRODUCTS_KEY, data ?? []);
        }),
        // map the response to IProductModel, so the frontend can consume it
        map((result) => {
          const data = Array.isArray(result)
            ? result
            : result?.content ?? [];
          const total = Array.isArray(result)
            ? data.length
            : result?.totalElements ?? result?.total ?? data.length;
          return { data, total } as IProductModel;
        }),
      );
  
  }

  private normalizeProduct(product: any): IProduct {
    const categories = Array.isArray(product.categories) ? product.categories : [];
    const attributes = Array.isArray(product.attributes) ? product.attributes : [];
    const variations = Array.isArray(product.variations) ? product.variations : [];
    const wholesales = Array.isArray(product.wholesales) ? product.wholesales : [];
    const relatedProducts = Array.isArray(product.related_products)
      ? product.related_products
      : Array.isArray(product.relatedProducts)
      ? product.relatedProducts
      : [];
    const crossSellProducts = Array.isArray(product.cross_sell_products)
      ? product.cross_sell_products
      : Array.isArray(product.crossSellProducts)
      ? product.crossSellProducts
      : [];

    return {
      ...product,
      highlightedName: product.highlightedName ?? product.name ?? '',
      categories_ids: Array.isArray(product.categories_ids)
        ? product.categories_ids
        : categories.map((category: any) => category?.id ?? category),
      brand: product.brand ?? ({} as any),
      brand_id: product.brand_id ?? product.brand?.id ?? null,
      product_thumbnail: product.product_thumbnail ?? product.thumbnail ?? null,
      product_galleries: product.product_galleries ?? product.images ?? [],
      sale_price: product.sale_price ?? product.salePrice ?? null,
      related_products: relatedProducts,
      cross_sell_products: crossSellProducts,
      categories,
      attributes,
      variations,
      wholesales,
      tags: Array.isArray(product.tags) ? product.tags : [],
      reviews: Array.isArray(product.reviews) ? product.reviews : [],
      review_ratings: Array.isArray(product.review_ratings) ? product.review_ratings : [],
      category: product.category ?? null,
      tag: product.tag ?? null,
      tax: product.tax ?? ({} as any),
      product_meta_image: product.product_meta_image ?? null,
      product_meta_image_id: product.product_meta_image_id ?? null,
      size_chart_image: product.size_chart_image ?? null,
      size_chart_image_id: product.size_chart_image_id ?? 0,
      preview_audio_file: product.preview_audio_file ?? null,
      preview_audio_file_id: product.preview_audio_file_id ?? null,
      preview_video_file: product.preview_video_file ?? null,
      preview_video_file_id: product.preview_video_file_id ?? null,
      store: product.store ?? null,
      store_id: product.store_id ?? null,
      short_description: product.short_description ?? '',
      type: product.type ?? '',
      product_type: product.product_type ?? '',
      sku: product.sku ?? '',
      stock_status: product.stock_status ?? '',
      stock: product.stock ?? 0,
      quantity: product.quantity ?? 0,
      safe_checkout: product.safe_checkout ?? false,
      secure_checkout: product.secure_checkout ?? false,
      social_share: product.social_share ?? false,
      encourage_order: product.encourage_order ?? false,
      encourage_view: product.encourage_view ?? false,
      is_featured: product.is_featured ?? false,
      is_trending: product.is_trending ?? false,
      is_return: product.is_return ?? false,
      is_external: product.is_external ?? false,
      external_url: product.external_url ?? '',
      external_button_text: product.external_button_text ?? '',
      orders_count: product.orders_count ?? 0,
      order_amount: product.order_amount ?? 0,
      rating_count: product.rating_count ?? 0,
      reviews_count: product.reviews_count ?? 0,
      description: product.description ?? '',
      name: product.name ?? '',
      slug: product.slug ?? '',
      id: product.id ?? 0,
      status: product.status ?? false,
      meta_title: product.meta_title ?? '',
      meta_description: product.meta_description ?? '',
    } as any as IProduct;
  }

  getProductBySlug(slug: string): Observable<IProduct> {
    return this.http
      .get<any>(`${environment.apiUrl}/products/${slug}/details`, {
        params: { locale: this.getLocale() },
      })
      .pipe(map(product => this.normalizeProduct(product)));
  }

  private getLocale(): string {
    try {
      const raw = localStorage.getItem('language');
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.code || 'en';
    } catch {
      return 'en';
    }
  }

  getProductBySearchList(payload?: Params): Observable<IProductModel> {
    return this.http.get<IProductModel>(`${environment.URL}/product.json`, { params: payload });
  }
}
