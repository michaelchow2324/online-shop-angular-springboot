import { Component, inject, Input, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Store } from '@ngxs/store';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Observable } from 'rxjs';

import { IAttachment } from '../../../../../interface/attachment.interface';
import { IProduct } from '../../../../../interface/product.interface';
import { IOption } from '../../../../../interface/theme-option.interface';
import { ThemeOptionState } from '../../../../../store/state/theme-option.state';

@Component({
  selector: 'app-image-variant',
  imports: [RouterModule, CarouselModule],
  templateUrl: './image-variant.html',
  styleUrl: './image-variant.scss',
})
export class ProductBoxImageVariant {
  @Input() thumbnail: IAttachment | null;
  readonly gallery_images = input<any>();
  readonly product = input<IProduct>();

  themeOptions$: Observable<IOption> = inject(Store).select(ThemeOptionState.themeOptions);

  public variant: string = 'image_zoom';
  public flipImage: IAttachment[] = [];
  public imageType = [
    'image/apng',
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg',
    'image/svg+xml',
    'image/webp',
  ];
  public customOptions: OwlOptions = {
    loop: true,
    autoplayTimeout: 1200,
    items: 1,
    autoplay: false, // Initialize autoplay as false
  };

  ngOnInit() {
    this.themeOptions$.subscribe(options => {
      this.variant = options.product.image_variant;
    });

    this.flipImage = this.gallery_images().map((image: any) => {
      let images;
      if (this.imageType.includes(image.mime_type)) {
        images = image;
      }
      return images!;
    });
  }

  startAutoplay() {
    this.thumbnail = null;
    this.customOptions = { ...this.customOptions, autoplay: true };
  }

  stopAutoplay() {
    this.customOptions = { ...this.customOptions, autoplay: false };
  }
}
