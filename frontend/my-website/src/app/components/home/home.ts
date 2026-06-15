import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Bag } from './bag/bag';
import { Beauty } from './beauty/beauty';
import { Kikiandco } from './kikiandco/kikiandco';
import { Bicycle } from './bicycle/bicycle';
import { Books } from './books/books';
import { Christmas } from './christmas/christmas';
import { DigitalDownload } from './digital-download/digital-download';
import { Electronic1 } from './electronic/electronic-1/electronic-1';
import { Electronic2 } from './electronic/electronic-2/electronic-2';
import { Electronic3 } from './electronic/electronic-3/electronic-3';
import { Fashion1 } from './fashion/fashion-1/fashion-1';
import { Fashion2 } from './fashion/fashion-2/fashion-2';
import { Fashion3 } from './fashion/fashion-3/fashion-3';
import { Fashion4 } from './fashion/fashion-4/fashion-4';
import { Fashion5 } from './fashion/fashion-5/fashion-5';
import { Fashion6 } from './fashion/fashion-6/fashion-6';
import { Fashion7 } from './fashion/fashion-7/fashion-7';
import { Flower } from './flower/flower';
import { FullPage } from './full-page/full-page';
import { Furniture1 } from './furniture/furniture-1/furniture-1';
import { Furniture2 } from './furniture/furniture-2/furniture-2';
import { FurnitureDark } from './furniture/furniture-dark/furniture-dark';
import { Game } from './game/game';
import { Goggles } from './goggles/goggles';
import { Gradient } from './gradient/gradient';
import { Gym } from './gym/gym';
import { Jewellery1 } from './jewellery/jewellery-1/jewellery-1';
import { Jewellery2 } from './jewellery/jewellery-2/jewellery-2';
import { Jewellery3 } from './jewellery/jewellery-3/jewellery-3';
import { Kids } from './kids/kids';
import { Marijuana } from './marijuana/marijuana';
import { Marketplace1 } from './marketplace/marketplace-1/marketplace-1';
import { Marketplace2 } from './marketplace/marketplace-2/marketplace-2';
import { Marketplace3 } from './marketplace/marketplace-3/marketplace-3';
import { Marketplace4 } from './marketplace/marketplace-4/marketplace-4';
import { Medical } from './medical/medical';
import { Nursery } from './nursery/nursery';
import { Parallax } from './parallax/parallax';
import { Perfume } from './perfume/perfume';
import { Pets } from './pets/pets';
import { Shoes } from './shoes/shoes';
import { SingleProduct } from './single-product/single-product';
import { Surfboard } from './surfboard/surfboard';
import { Tools } from './tools/tools';
import { Vegetables1 } from './vegetables/vegetables-1/vegetables-1';
import { Vegetables2 } from './vegetables/vegetables-2/vegetables-2';
import { Vegetables3 } from './vegetables/vegetables-3/vegetables-3';
import { Vegetables4 } from './vegetables/vegetables-4/vegetables-4';
import { Video } from './video/video';
import { VideoSlider } from './video-slider/video-slider';
import { Watch } from './watch/watch';
import { Yoga } from './yoga/yoga';
import { ThemeOptionService } from '../../shared/services/theme-option.service';
import { GetHomePageAction } from '../../shared/store/action/theme.action';
import { ThemeState } from '../../shared/store/state/theme.state';

@Component({
  selector: 'app-home',
  imports: [
    Fashion1,
    Fashion2,
    Fashion3,
    Fashion4,
    Fashion5,
    Fashion6,
    Fashion7,
    Furniture1,
    Furniture2,
    FurnitureDark,
    Electronic1,
    Electronic2,
    Electronic3,
    Marketplace1,
    Marketplace2,
    Marketplace3,
    Marketplace4,
    Vegetables1,
    Vegetables2,
    Vegetables3,
    Vegetables4,
    Jewellery1,
    Jewellery2,
    Jewellery3,
    Bag,
    Watch,
    Medical,
    Perfume,
    Yoga,
    Bicycle,
    Marijuana,
    Tools,
    Christmas,
    Shoes,
    Kids,
    Books,
    Beauty,
    Surfboard,
    Goggles,
    Gym,
    VideoSlider,
    Pets,
    Nursery,
    Game,
    Flower,
    Gradient,
    Video,
    FullPage,
    Parallax,
    DigitalDownload,
    SingleProduct,
    Kikiandco,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private themeOptionService = inject(ThemeOptionService);

  homePage$: Observable<object> = inject(Store).select(ThemeState.homePage) as Observable<object>;
  activeTheme$: Observable<string> = inject(Store).select(
    ThemeState.activeTheme,
  ) as Observable<string>;

  public theme: string;
  public homePage: any;

  constructor() {
    this.route.queryParams.subscribe(params => {
      this.themeOptionService.preloader = true;
      this.activeTheme$.subscribe(theme => {
        this.theme = params['theme'] ? params['theme'] : theme;
        if (this.theme) {
          this.store
            .dispatch(new GetHomePageAction(params['theme'] ? params['theme'] : theme))
            .subscribe((data: any) => {
              this.homePage = data.theme.homePage;
              this.themeOptionService.preloader = false;
            });
        }
      });
    });
  }
}
