import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { tap } from 'rxjs';

import { IProduct, IProductModel } from '../../interface/product.interface';
import { ProductService } from '../../services/product.service';
import { ThemeOptionService } from '../../services/theme-option.service';
import {
  GetCategoryProductsAction,
  GetMenuProductsAction,
  GetMoreProductAction,
  GetNewArrivalsAction,
  GetProductByIdsAction,
  GetProductBySearchAction,
  GetProductBySearchListAction,
  GetProductBySlugAction,
  GetProductsAction,
  GetRelatedProductsAction,
  GetStoreProductsAction,
} from '../action/product.action';

export class ProductStateModel {
  product = {
    data: [] as IProduct[],
    total: 0,
  };
  selectedProduct: IProduct | null;
  categoryProducts: IProduct[] | [];
  relatedProducts: IProduct[] | [];
  storeProducts: IProduct[] | [];
  dealProducts: IProduct[] | [];
  menuProducts: IProduct[] | [];
  productBySearch: IProduct[] | [];
  productBySearchList: IProduct[] | [];
  productByIds: IProduct[] | [];
  moreProduct: IProduct[] | [];
}

@State<ProductStateModel>({
  name: 'product',
  defaults: {
    product: {
      data: [],
      total: 0,
    },
    selectedProduct: null,
    categoryProducts: [],
    relatedProducts: [],
    storeProducts: [],
    dealProducts: [],
    menuProducts: [],
    productBySearch: [],
    productBySearchList: [],
    productByIds: [],
    moreProduct: [],
  },
})
@Injectable()
export class ProductState {
  private store = inject(Store);
  private router = inject(Router);
  private productService = inject(ProductService);
  private themeOptionService = inject(ThemeOptionService);

  @Selector()
  static product(state: ProductStateModel) {
    return state.product;
  }

  @Selector()
  static productByIds(state: ProductStateModel) {
    return state.productByIds;
  }

  @Selector()
  static productBySearch(state: ProductStateModel) {
    return state.productBySearch;
  }

  @Selector()
  static productBySearchList(state: ProductStateModel) {
    return state.productBySearchList;
  }

  @Selector()
  static selectedProduct(state: ProductStateModel) {
    return state.selectedProduct;
  }

  @Selector()
  static relatedProducts(state: ProductStateModel) {
    return state.relatedProducts;
  }

  @Selector()
  static categoryProducts(state: ProductStateModel) {
    return state.categoryProducts;
  }

  @Selector()
  static storeProducts(state: ProductStateModel) {
    return state.storeProducts;
  }

  @Selector()
  static menuProducts(state: ProductStateModel) {
    return state.menuProducts;
  }

  @Selector()
  static moreProduct(state: ProductStateModel) {
    return state.moreProduct;
  }

  // action called from dispatch > this.store.dispatch(new GetProductsAction(payload));
  @Action(GetProductsAction)
  getProducts(ctx: StateContext<ProductStateModel>, action: GetProductsAction) {
    this.productService.skeletonLoader = true;
    return this.productService.getProducts(action.payload).pipe(
      tap({
        next: (result: IProductModel) => {
          let products = result.data || [];
          if (action?.payload) {
            // Note:- For Internal filter purpose only, once you apply filter logic on server side then you can remove  it as per your requirement.
            // Note:- we have covered only few filters as demo purpose
            products = result.data.filter(
              product =>
                (action?.payload?.['store_slug'] &&
                  product?.store?.slug == action?.payload?.['store_slug']) ||
                (action?.payload?.['category'] &&
                  product?.categories?.length &&
                  product?.categories?.some(category =>
                    action?.payload?.['category']?.split(',')?.includes(category.slug),
                  )),
            );

            products = products.length ? products : result.data;

            if (action?.payload?.['sortBy']) {
              if (action?.payload?.['sortBy'] === 'asc') {
                products = products.sort((a, b) => {
                  if (a.id < b.id) {
                    return -1;
                  } else if (a.id > b.id) {
                    return 1;
                  }
                  return 0;
                });
              } else if (action?.payload?.['sortBy'] === 'desc') {
                products = products.sort((a, b) => {
                  if (a.id > b.id) {
                    return -1;
                  } else if (a.id < b.id) {
                    return 1;
                  }
                  return 0;
                });
              } else if (action?.payload?.['sortBy'] === 'a-z') {
                products = products.sort((a, b) => {
                  if (a.name < b.name) {
                    return -1;
                  } else if (a.name > b.name) {
                    return 1;
                  }
                  return 0;
                });
              } else if (action?.payload?.['sortBy'] === 'z-a') {
                products = products.sort((a, b) => {
                  if (a.name > b.name) {
                    return -1;
                  } else if (a.name < b.name) {
                    return 1;
                  }
                  return 0;
                });
              } else if (action?.payload?.['sortBy'] === 'low-high') {
                products = products.sort((a, b) => {
                  if (a.sale_price < b.sale_price) {
                    return -1;
                  } else if (a.price > b.price) {
                    return 1;
                  }
                  return 0;
                });
              } else if (action?.payload?.['sortBy'] === 'high-low') {
                products = products.sort((a, b) => {
                  if (a.sale_price > b.sale_price) {
                    return -1;
                  } else if (a.price < b.price) {
                    return 1;
                  }
                  return 0;
                });
              }
            } else if (!action?.payload?.['ids']) {
              products = products.sort((a, b) => {
                if (a.id < b.id) {
                  return -1;
                } else if (a.id > b.id) {
                  return 1;
                }
                return 0;
              });
            }

            if (action?.payload?.['search']) {
              products = products.filter(product =>
                product.name.toLowerCase().includes(action?.payload?.['search'].toLowerCase()),
              );
            }

            if (action?.payload?.['brand']) {
              products = products.filter(
                product => product?.brand?.slug === action?.payload?.['brand'],
              );
            }
          }

          ctx.patchState({
            product: {
              data: products,
              total: products.length ? products.length : result.data.length,
            },
          });
        },
        complete: () => {
          this.productService.skeletonLoader = false;
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetProductByIdsAction)
  getProductByIds(ctx: StateContext<ProductStateModel>, action: GetProductByIdsAction) {
    return this.productService.getProducts(action.payload).pipe(
      tap({
        next: (result: IProductModel) => {
          const state = ctx.getState();
          ctx.patchState({
            ...state,
            productByIds: result.data,
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetNewArrivalsAction)
  getNewArrivals(ctx: StateContext<ProductStateModel>, action: GetNewArrivalsAction) {
    return this.productService.getNewArrivals(action.limit).pipe(
      tap({
        next: (result: IProductModel) => {
          ctx.patchState({
            productByIds: result.data,
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetProductBySlugAction)
  getProductBySlug(ctx: StateContext<ProductStateModel>, { slug }: GetProductBySlugAction) {
    this.themeOptionService.preloader = true;
    return this.productService.getProductBySlug(slug).pipe(
      tap({
        next: result => {
          if (result) {
            result.related_products = Array.isArray(result.related_products)
              ? result.related_products
              : [];
            result.cross_sell_products = Array.isArray(result.cross_sell_products)
              ? result.cross_sell_products
              : [];

            const ids = [
              ...result.related_products,
              ...result.cross_sell_products,
            ];
            const categoryIds = Array.isArray(result.categories)
              ? result.categories.map(category => category.id)
              : [];

            this.store.dispatch(
              new GetRelatedProductsAction({
                ids: ids.join(','),
                category_ids: categoryIds.join(','),
                status: 1,
              }),
            );

            const state = ctx.getState();
            ctx.patchState({
              ...state,
              selectedProduct: result,
            });
          }
        },
        complete: () => {
          this.themeOptionService.preloader = false;
        },
        error: err => {
          this.themeOptionService.preloader = false;
          void this.router.navigate(['/404']);
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetRelatedProductsAction)
  getRelatedProducts(ctx: StateContext<ProductStateModel>, action: GetProductsAction) {
    this.themeOptionService.preloader = true;
    return this.productService.getProducts(action.payload).pipe(
      tap({
        next: (result: IProductModel) => {
          const state = ctx.getState();
          ctx.patchState({
            ...state,
            relatedProducts: result.data,
          });
        },
        complete: () => {
          this.themeOptionService.preloader = false;
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetCategoryProductsAction)
  getCategoryProducts(ctx: StateContext<ProductStateModel>, action: GetProductsAction) {
    this.productService.skeletonCategoryProductLoader = true;
    return this.productService.getProducts(action.payload).pipe(
      tap({
        next: result => {
          const state = ctx.getState();

          result.data.map(product => {
            product['categories_ids'] = product?.categories?.map(category => category.id);
          });

          let products = result.data.filter(product =>
            product?.categories_ids?.includes(action.payload!['category_id']),
          );
          products.splice(action.payload!['paginate']);

          ctx.patchState({
            ...state,
            product: {
              data: [...state.product.data, ...result.data],
              total: state.product.data.length + result.data.length,
            },
            categoryProducts: products,
          });
          this.productService.skeletonCategoryProductLoader = false;
        },
        complete: () => {
          this.productService.skeletonCategoryProductLoader = false;
          this.themeOptionService.preloader = false;
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetStoreProductsAction)
  getStoreProducts(ctx: StateContext<ProductStateModel>, action: GetProductsAction) {
    return this.productService.getProducts(action.payload).pipe(
      tap({
        next: (result: IProductModel) => {
          const state = ctx.getState();
          ctx.patchState({
            ...state,
            storeProducts: result.data,
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetMenuProductsAction)
  getMenuProducts(ctx: StateContext<ProductStateModel>, action: GetMenuProductsAction) {
    return this.productService.getProducts(action.payload).pipe(
      tap({
        next: (result: IProductModel) => {
          const state = ctx.getState();
          ctx.patchState({
            ...state,
            menuProducts: result.data,
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetProductBySearchAction)
  getProductBySearch(ctx: StateContext<ProductStateModel>, action: GetProductBySearchAction) {
    this.productService.searchSkeleton = true;
    return this.productService.getProducts(action.payload).pipe(
      tap({
        next: result => {
          let products;
          if (action?.payload?.['search']) {
            products = result.data.filter(product =>
              product.name.toLowerCase().includes(action?.payload?.['search'].toLowerCase()),
            );
          } else {
            products = result.data;
          }

          ctx.patchState({
            productBySearch: products.splice(0, 4),
          });
        },
        complete: () => {
          this.productService.searchSkeleton = false;
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetProductBySearchListAction)
  getProductBySearchList(
    ctx: StateContext<ProductStateModel>,
    action: GetProductBySearchListAction,
  ) {
    this.productService.searchSkeleton = true;
    return this.productService.getProductBySearchList(action.payload).pipe(
      tap({
        next: result => {
          ctx.patchState({
            productBySearchList: result.data,
          });
        },
        complete: () => {
          this.productService.searchSkeleton = false;
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetMoreProductAction)
  getMoreProduct(ctx: StateContext<ProductStateModel>, action: GetMoreProductAction) {
    return this.productService.getProducts(action.payload).pipe(
      tap({
        next: (result: IProductModel) => {
          const state = ctx.getState();

          result.data.map(product => {
            product['categories_ids'] = product.categories.map(category => category.id);
          });

          let filteredProducts = result.data.filter(product =>
            action.payload!['category_id']?.some((category_id: number) =>
              product.categories_ids.includes(category_id),
            ),
          );

          const page = action.payload!['page']; // e.g., 1 for the first page
          const itemsPerPage = action.payload!['paginate']; // e.g., 4 items per page

          const startIndex = (page - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;

          let paginatedProducts = filteredProducts.length
            ? filteredProducts
            : result.data.slice(startIndex, endIndex);
          if (action.value) {
            ctx.patchState({
              moreProduct: [...state.moreProduct, ...paginatedProducts],
            });
          } else {
            ctx.patchState({
              moreProduct: [...paginatedProducts],
            });
          }
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }
}
