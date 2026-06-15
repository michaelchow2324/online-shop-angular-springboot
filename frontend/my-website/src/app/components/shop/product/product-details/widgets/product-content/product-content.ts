import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, inject, input, Input, output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CarouselComponent } from 'ngx-owl-carousel-o';
import { Observable } from 'rxjs';

import { Button } from '../../../../../../shared/components/widgets/button/button';
import { SaleTimer } from '../../../../../../shared/components/widgets/sale-timer/sale-timer';
import { VariantAttributes } from '../../../../../../shared/components/widgets/variant-attributes/variant-attributes';
import { ICart, ICartAddOrUpdate } from '../../../../../../shared/interface/cart.interface';
import { IProduct, IVariation } from '../../../../../../shared/interface/product.interface';
import { IValues } from '../../../../../../shared/interface/setting.interface';
import { IOption } from '../../../../../../shared/interface/theme-option.interface';
import { CurrencySymbolPipe } from '../../../../../../shared/pipe/currency.pipe';
import { AddToCartAction } from '../../../../../../shared/store/action/cart.action';
import { AddToCompareAction } from '../../../../../../shared/store/action/compare.action';
import {
  AddToWishlistAction,
  DeleteWishlistAction,
} from '../../../../../../shared/store/action/wishlist.action';
import { CartState } from '../../../../../../shared/store/state/cart.state';
import { SettingState } from '../../../../../../shared/store/state/setting.state';
import { WishlistState } from '../../../../../../shared/store/state/wishlist.state';
import { ProductSocialShare } from '../product-social-share/product-social-share';
import { ProductWholesales } from '../product-wholesales/product-wholesales';

@Component({
  selector: 'app-product-content',
  imports: [
    NgbModule,
    CurrencySymbolPipe,
    VariantAttributes,
    TranslateModule,
    SaleTimer,
    ProductWholesales,
    Button,
    NgClass,
  ],
  templateUrl: './product-content.html',
  styleUrl: './product-content.scss',
})
export class ProductContent {
  private store = inject(Store);
  private router = inject(Router);
  private modal = inject(NgbModal);

  cartItem$: Observable<ICart[]> = inject(Store).select(CartState.cartItems);
  setting$: Observable<IValues> = inject(Store).select(SettingState.setting) as Observable<IValues>;
  wishlistIds$: Observable<number[]> = inject(Store).select(WishlistState.wishlistIds);

  @Input() product: IProduct;
  readonly option = input<IOption | null>();
  readonly owlCar = input<CarouselComponent>();
  readonly product_variation = input<boolean>(false);
  readonly variant_hover = input<boolean>(true);

  readonly selectedVariant = output<IVariation>();

  public selectedVariation: IVariation | null;
  public productQty: number = 1;
  public shippingFreeAmt: number = 0;
  public totalPrice: number = 0;
  public cartItem: ICart | null;
  public isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);

    this.isBrowser = isPlatformBrowser(platformId);
    this.setting$.subscribe(
      setting => (this.shippingFreeAmt = setting?.general?.min_order_free_shipping),
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product'] && changes['product'].currentValue) {
      this.selectedVariation = null;
      this.product = changes['product']?.currentValue;
    }

    this.productQty = 1;

    this.cartItem$.subscribe(items => {
      this.cartItem = items.find(item => {
        if (
          item.variation &&
          item.variation != null &&
          item.variation_id &&
          item.variation_id != null
        ) {
          const variations = Array.isArray(this.product.variations) ? this.product.variations : [];
          variations.find(i => {
            if (i.id == item.variation_id) return i.id == item.variation_id;
          });
          return true;
        } else {
          return item.product.id == this.product.id;
        }
      })!;
    });
  }

  ngOnInit() {
    this.wholesalePriceCal();
  }

  selectVariation(variation: IVariation) {
    if (variation) {
      this.selectedVariation = variation;
      this.selectedVariant.emit(this.selectedVariation);
    }
  }

  updateQuantity(qty: number) {
    if (1 > this.productQty + qty) return;
    this.productQty = this.productQty + qty;

    this.wholesalePriceCal();
  }

  externalProductLink(link: string) {
    if (this.isBrowser) {
      if (link) {
        window.open(link, '_blank');
      }
    }
  }

  addToCart(product: IProduct, buyNow?: boolean) {
    if (product) {
      const params: ICartAddOrUpdate = {
        id:
          this.cartItem &&
          this.selectedVariation &&
          this.cartItem?.variation &&
          this.selectedVariation?.id == this.cartItem?.variation?.id
            ? this.cartItem.id
            : null,
        product_id: product?.id,
        product: product ? product : null,
        variation: this.selectedVariation ? this.selectedVariation : null,
        variation_id: this.selectedVariation?.id ? this.selectedVariation?.id : null,
        quantity: this.productQty,
      };

      this.store.dispatch(new AddToCartAction(params)).subscribe({
        complete: () => {
          this.modal.dismissAll();
          if (buyNow) {
            void this.router.navigate(['/checkout']);
          }
        },
      });
    }
  }

  addToWishlist(product: IProduct) {
    if (this.store.selectSnapshot(state => state.auth && state.auth.access_token)) {
      product['is_wishlist'] = !product['is_wishlist'];
    }
    let action =
      product['is_wishlist'] &&
      product['is_wishlist'] &&
      !!this.store.selectSnapshot(state => state.auth && state.auth.access_token)
        ? new AddToWishlistAction({ product_id: product.id })
        : new DeleteWishlistAction(product.id);
    if (action) {
      this.store.dispatch(action);
    }
  }

  addToCompare(product: IProduct) {
    this.store.dispatch(new AddToCompareAction({ product: product }));
  }

  wholesalePriceCal() {
    const wholesales = Array.isArray(this.product.wholesales)
      ? this.product.wholesales
      : [];
    const wholesale =
      wholesales.find(
        value => value.min_qty <= this.productQty && value.max_qty >= this.productQty,
      ) || null;
    const product = this.product;
    const productSalePrice =
      product.sale_price ??
      (product as any).salePrice ??
      product.price;

    if (wholesale && product.wholesale_price_type == 'fixed') {
      this.totalPrice = this.productQty * wholesale.value;
    } else if (wholesale && product.wholesale_price_type == 'percentage') {
      this.totalPrice =
        this.productQty *
        (this.selectedVariation ? this.selectedVariation.sale_price : productSalePrice);
      this.totalPrice = this.totalPrice - this.totalPrice * (wholesale.value / 100);
    } else {
      this.totalPrice =
        this.productQty *
        (this.selectedVariation ? this.selectedVariation.sale_price : productSalePrice);
    }
  }

  openModal(product: IProduct) {
    const modal = this.modal.open(ProductSocialShare, {
      centered: true,
      windowClass: 'theme-modal-2',
    });
    modal.componentInstance.product = product;
  }
}
