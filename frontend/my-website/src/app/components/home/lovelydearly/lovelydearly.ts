import { isPlatformBrowser } from "@angular/common";
import { Component, PLATFORM_ID, inject, input, signal } from "@angular/core";

import { Store } from "@ngxs/store";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";

import { Categories } from "../../../shared/components/widgets/categories/categories";
import { ILovelydearly } from "../../../shared/interface/theme.interface";
import { InstagramPost, InstagramService } from "../../../shared/services/instagram.service";
import { ThemeOptionService } from "../../../shared/services/theme-option.service";
import { GetCategoriesAction } from "../../../shared/store/action/category.action";
import { GetNewArrivalsAction } from "../../../shared/store/action/product.action";
import { ProductState } from "../../../shared/store/state/product.state";
import { ThemeHomeSlider } from "../widgets/theme-home-slider/theme-home-slider";
import { ThemeProduct } from "../widgets/theme-product/theme-product";
import { ThemeProductTabSection } from "../widgets/theme-product-tab-section/theme-product-tab-section";
import { ThemeServices } from "../widgets/theme-services/theme-services";
import { ThemeSocialMedia } from "../widgets/theme-social-media/theme-social-media";
import { ThemeTitle } from "../widgets/theme-title/theme-title";

@Component({
  selector: "app-lovelydearly",
  imports: [
    ThemeHomeSlider,
    Categories,
    ThemeTitle,
    ThemeProduct,
    ThemeServices,
    ThemeProductTabSection,
    ThemeSocialMedia,
  ],
  templateUrl: "./lovelydearly.html",
  styleUrl: "./lovelydearly.scss",
})
export class Lovelydearly {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);
  private instagramService = inject(InstagramService);

  private platformId: boolean;
  readonly data = input<ILovelydearly>();
  readonly slug = input<string>();

  /** Live Instagram posts; null = not yet loaded, [] = failed/no posts */
  instagramPosts = signal<InstagramPost[] | null>(null);
  /** Newest active products for the New Arrivals rail (default 10). */
  newArrivalIds: number[] = [];
  private static readonly NEW_ARRIVALS_LIMIT = 10;

  /** Builds a social_media object shaped like the JSON data so ThemeSocialMedia can consume it. */
  get instagramMediaData() {
    const posts = this.instagramPosts();
    const staticData = this.data()?.content?.social_media;
    if (!posts || posts.length === 0) return staticData;
    return {
      ...staticData,
      banners: posts.map(p => ({
        status: true,
        image_url: p.imageUrl,
        button_text: '',
        redirect_link: { link: p.permalink, link_type: 'external_url' },
      })),
    };
  }

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);
    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnChanges() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      const categoryProductIds = data?.content?.category_product?.category_ids || [];

      // Newest active products for New Arrivals (not a hardcoded merchandising list)
      const getProduct$ = this.store.dispatch(
        new GetNewArrivalsAction(Lovelydearly.NEW_ARRIVALS_LIMIT),
      ).pipe(catchError(() => of(null)));

      // Get Categories — load all, let each section filter client-side
      let getCategory$;
      if (data?.content?.categories?.status || categoryProductIds.length) {
        getCategory$ = this.store.dispatch(new GetCategoriesAction());
      } else {
        getCategory$ = of(null);
      }

      forkJoin([getProduct$, getCategory$]).subscribe({
        next: () => {
          const products = this.store.selectSnapshot(ProductState.productByIds) || [];
          this.newArrivalIds = products.map(product => product.id);
        },
        complete: () => {
          this.themeOptionService.preloader = false;
        },
      });

      // Load live Instagram feed; fall back silently to static JSON on error
      if (data?.content?.social_media?.status) {
        this.instagramService.getFeed().pipe(
          catchError(() => of([] as InstagramPost[]))
        ).subscribe(posts => this.instagramPosts.set((posts || []).slice(0, 5)));
      }
    }
  }
}
