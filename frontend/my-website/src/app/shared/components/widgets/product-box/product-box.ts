import { ChangeDetectorRef, Component, inject, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ProductBoxEight } from './product-box-eight/product-box-eight';
import { ProductBoxEleven } from './product-box-eleven/product-box-eleven';
import { ProductBoxFive } from './product-box-five/product-box-five';
import { ProductBoxFour } from './product-box-four/product-box-four';
import { ProductBoxHorizontal } from './product-box-horizontal/product-box-horizontal';
import { ProductBoxNine } from './product-box-nine/product-box-nine';
import { ProductBoxOne } from './product-box-one/product-box-one';
import { ProductBoxSeven } from './product-box-seven/product-box-seven';
import { ProductBoxSix } from './product-box-six/product-box-six';
import { ProductBoxTen } from './product-box-ten/product-box-ten';
import { ProductBoxThree } from './product-box-three/product-box-three';
import { ProductBoxTwelve } from './product-box-twelve/product-box-twelve';
import { ProductBoxTwo } from './product-box-two/product-box-two';
import { IProduct } from '../../../interface/product.interface';
import { IOption } from '../../../interface/theme-option.interface';
import { ThemeOptionService } from '../../../services/theme-option.service';
import { UpdateProductBoxAction } from '../../../store/action/theme-option.action';
import { ThemeOptionState } from '../../../store/state/theme-option.state';

@Component({
  selector: 'app-product-box',
  templateUrl: './product-box.html',
  styleUrl: './product-box.scss',
  imports: [
    ProductBoxOne,
    ProductBoxHorizontal,
    ProductBoxTwo,
    ProductBoxThree,
    ProductBoxFour,
    ProductBoxFive,
    ProductBoxSix,
    ProductBoxSeven,
    ProductBoxEight,
    ProductBoxNine,
    ProductBoxTen,
    ProductBoxEleven,
    ProductBoxTwelve,
  ],
})
export class ProductBox {
  route = inject(ActivatedRoute);
  private store = inject(Store);
  themeOptionService = inject(ThemeOptionService);
  private cdRef = inject(ChangeDetectorRef);

  readonly product = input<IProduct>();
  readonly style = input<string>();
  readonly product_box_style = input<string>();

  themeOption$: Observable<IOption> = inject(Store).select(ThemeOptionState.themeOptions);
  productBox$: Observable<string> = inject(Store).select(ThemeOptionState.productBox);

  public path: string;
  public variant: string;

  constructor() {
    this.route.queryParams.subscribe(params => (this.path = params['theme']));
  }

  ngOnInit() {
    this.setVariant();
    this.productBox$.subscribe(res => {
      setTimeout(() => {
        this.variant = res;
      }, 500);
      // this.cdRef.detectChanges(); // Force Angular to detect changes
    });
  }

  setVariant() {
    // if(this.path)
    if (
      this.path == 'fashion_one' ||
      this.path == 'fashion_two' ||
      this.path == 'fashion_three' ||
      this.path == 'furniture_two' ||
      this.path == 'watch' ||
      this.path == 'christmas' ||
      this.path == 'single_product'
    ) {
      this.variant = 'product_box_one';
    } else if (
      this.path == 'fashion_four' ||
      this.path == 'fashion_seven' ||
      this.path == 'tools'
    ) {
      this.variant = 'product_box_two';
    } else if (this.path == 'bicycle' || this.path == 'surfboard') {
      this.variant = 'product_box_three';
    } else if (this.path == 'medical' || this.path == 'fashion_six') {
      this.variant = 'product_box_four';
    } else if (
      this.path == 'perfume' ||
      this.path == 'furniture_dark' ||
      this.path == 'furniture_one' ||
      this.path == 'shoes'
    ) {
      this.variant = 'product_box_five';
    } else if (
      this.path == 'bag' ||
      this.path == 'electronics_one' ||
      this.path == 'electronics_two' ||
      this.path == 'electronics_three' ||
      this.path == 'fashion_five'
    ) {
      this.variant = 'product_box_six';
    } else if (
      this.path == 'marketplace_one' ||
      this.path == 'marketplace_two' ||
      this.path == 'marketplace_three' ||
      this.path == 'marketplace_four'
    ) {
      this.variant = 'product_box_seven';
    } else if (
      this.path == 'gym' ||
      this.path == 'vegetables_one' ||
      this.path == 'vegetables_two' ||
      this.path == 'vegetables_four'
    ) {
      this.variant = 'product_box_eight';
    } else if (
      this.path == 'marijuana' ||
      this.path == 'jewellery_three' ||
      this.path == 'goggles'
    ) {
      this.variant = 'product_box_nine';
    } else if (this.path == 'digital_download') {
      this.variant = 'product_box_ten';
    }
    // else if(''){
    //   this.variant = 'product_box_eleven';
    // }
    else if (this.path == 'shoes') {
      this.variant = 'product_box_fourteen';
    } else if (this.path == 'jewellery_one' || this.path == 'jewellery_two') {
      this.variant = 'product_box_twelve';
    } else {
      this.themeOption$.subscribe(theme => {
        this.variant = theme?.product ? theme?.product?.product_box_variant : 'product_box_one';
      });
    }
    this.store.dispatch(new UpdateProductBoxAction(this.variant));
    // this.cdRef.detectChanges();
  }

  ngAfterViewInit() {
    this.setVariant();
    // this.cdRef.detectChanges();
  }
}
