import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, inject, Input, PLATFORM_ID, viewChild } from '@angular/core';

import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { CarouselComponent, CarouselModule, SlidesOutputData } from 'ngx-owl-carousel-o';
import { Observable } from 'rxjs';

import { ProductContent } from '../../../../../components/shop/product/product-details/widgets/product-content/product-content';
import { ProductDeliveryInformation } from '../../../../../components/shop/product/product-details/widgets/product-delivery-information/product-delivery-information';
import { ProductDetails } from '../../../../../components/shop/product/product-details/widgets/product-details/product-details';
import { productMainThumbSlider, productThumbSlider } from '../../../../data/owl-carousel';
import { ICart, ICartAddOrUpdate } from '../../../../interface/cart.interface';
import { IProduct, IVariation } from '../../../../interface/product.interface';
import { AddToCartAction } from '../../../../store/action/cart.action';
import { CartState } from '../../../../store/state/cart.state';
import { Button } from '../../button/button';

@Component({
  selector: 'app-product-details-modal',
  imports: [
    CarouselModule,
    TranslateModule,
    NgxImageZoomModule,
    NgbModule,
    Button,
    ProductDetails,
    ProductContent,
    ProductDeliveryInformation,
    NgClass,
  ],
  templateUrl: './product-details-modal.html',
  styleUrl: './product-details-modal.scss',
})
export class ProductDetailsModal {
  modal = inject(NgbActiveModal);
  private store = inject(Store);
  private platformId = inject<Object>(PLATFORM_ID);

  @Input() product: IProduct;

  readonly thumbnailCarousel = viewChild<CarouselComponent>('thumbnailCarousel');

  cartItem$: Observable<ICart[]> = inject(Store).select(CartState.cartItems);

  public modalOpen: boolean = false;
  public videType = ['video/mp4', 'video/webm', 'video/ogg'];
  public audioType = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
  public videoType = ['mp4', 'mov', 'avi'];
  public audio = ['mpeg', 'wav', 'ogg', 'mp3'];
  public cartItem: ICart | null;
  public productQty: number = 1;
  public selectedVariation: IVariation;
  public totalPrice: number = 0;
  public activeSlide: string = '0';

  public productMainThumbSlider = productMainThumbSlider;
  public productThumbSlider = productThumbSlider;
  public isBrowser: boolean;

  ngOnInit() {
    this.cartItem$.subscribe(items => {
      this.cartItem = items.find(item => item.product.id == this.product?.id)!;
    });
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  selectedVariant(variant: IVariation) {
    this.selectedVariation = variant;
  }

  onSlideChange(event: SlidesOutputData) {
    const thumbnailCarousel = this.thumbnailCarousel();
    if (thumbnailCarousel && event && event.slides && event.slides.length > 0) {
      this.activeSlide = event.slides[0].id;

      if (this.activeSlide) {
        thumbnailCarousel.to(this.activeSlide);
      }
    }
  }

  updateQuantity(qty: number) {
    if (1 > this.productQty + qty) return;
    this.productQty = this.productQty + qty;
    this.wholesalePriceCal();
  }

  wholesalePriceCal() {
    let wholesale =
      this.product?.wholesales.find(
        value => value.min_qty <= this.productQty && value.max_qty >= this.productQty,
      ) || null;
    const product = this.product;
    if (wholesale && product!.wholesale_price_type == 'fixed') {
      this.totalPrice = this.productQty * wholesale.value;
    } else if (wholesale && product!.wholesale_price_type == 'percentage') {
      this.totalPrice =
        this.productQty *
        (this.selectedVariation ? this.selectedVariation.sale_price : product!.sale_price);
      this.totalPrice = this.totalPrice - this.totalPrice * (wholesale.value / 100);
    } else {
      this.totalPrice =
        this.productQty *
        (this.selectedVariation ? this.selectedVariation.sale_price : product!.sale_price);
    }
  }

  addToCart(product: IProduct) {
    if (product) {
      const params: ICartAddOrUpdate = {
        id:
          this.cartItem &&
            this.selectedVariation &&
            this.cartItem?.variation &&
            this.selectedVariation?.id == this.cartItem?.variation?.id
            ? this.cartItem.id
            : null,
        product_id: product?.id!,
        product: product ? product : null,
        variation: this.selectedVariation ? this.selectedVariation : null,
        variation_id: this.selectedVariation?.id ? this.selectedVariation?.id! : null,
        quantity: this.productQty,
      };
      this.store.dispatch(new AddToCartAction(params)).subscribe({
        complete: () => {
          this.modal.close();
        },
      });
    }
  }

  getImageContent(imageUrl: string): string {
    if (this.videoType.includes(imageUrl.substring(imageUrl.lastIndexOf('.') + 1))) {
      return `<i class="ri-video-line"></i>`;
    } else if (this.audio.includes(imageUrl.substring(imageUrl.lastIndexOf('.') + 1))) {
      return `<i class="ri-headphone-line"></i>`;
    } else {
      return `<img src="${imageUrl}" class="img-fluid">`;
    }
  }

  externalProductLink(link: string) {
    if (this.isBrowser) {
      if (link) {
        window.open(link, '_blank');
      }
    }
  }
}
