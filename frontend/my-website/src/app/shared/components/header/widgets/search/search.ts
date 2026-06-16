import { isPlatformBrowser, DecimalPipe } from "@angular/common";
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  PLATFORM_ID,
  SimpleChanges,
  viewChild,
  input,
} from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from "@ngx-translate/core";
import { Store } from "@ngxs/store";
import {
  debounceTime,
  distinctUntilChanged,
  interval,
  Observable,
  Subscription,
} from "rxjs";

import { SearchDropdown } from "./search-dropdown/search-dropdown";
import { ClickOutsideDirective } from "../../../../directive/outside.directive";
import {
  ICategory,
  ICategoryModel,
} from "../../../../interface/category.interface";
import { IProduct } from "../../../../interface/product.interface";
import { MenuService } from "../../../../services/menu.service";
import { GetSearchByCategoryAction } from "../../../../store/action/category.action";
import { GetProductBySearchListAction } from "../../../../store/action/product.action";
import { CategoryState } from "../../../../store/state/category.state";
import { ProductState } from "../../../../store/state/product.state";
import { SearchModal } from "../../../widgets/modal/search-modal/search-modal";

@Component({
  selector: "app-search",
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    SearchDropdown,
    ClickOutsideDirective,
    DecimalPipe,
  ],
  templateUrl: "./search.html",
  styleUrl: "./search.scss",
})
export class Search {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  menuService = inject(MenuService);
  private modal = inject(NgbModal);
  private platformId = inject<Object>(PLATFORM_ID);

  readonly style = input<string>();

  public isOpen: boolean = false;

  readonly resultsContainer = viewChild<ElementRef>("resultsContainer");

  productBySearch$: Observable<IProduct[]> = inject(Store).select(
    ProductState.productBySearchList,
  );
  category$: Observable<ICategoryModel> = inject(Store).select(
    CategoryState.category,
  );
  searchCategory$: Observable<ICategory[]> = inject(Store).select(
    CategoryState.searchByCategory,
  );

  public term = new FormControl();
  public searchText: string = "";
  public selectedCategory = new FormControl("");
  public show: boolean = false;
  public isOpenResult = false;
  public product: IProduct[];
  public filteredResults: IProduct[] = [];
  public filteredCategory: ICategory[] = [];
  public selectedResultIndex = -1;
  public categories: ICategory[];
  public textToType = "Search with brand and category...";
  public typedText = "";
  public animationSubscription: Subscription | undefined;
  public isBrowser: boolean;

  constructor() {
    const platformId = this.platformId;

    this.isBrowser = isPlatformBrowser(platformId);
    this.category$.subscribe(
      (res) =>
        (this.categories = res.data.filter(
          (category) => category.type == "product",
        )),
    );
    this.store.dispatch(
      new GetSearchByCategoryAction({ status: 1, paginate: 4 }),
    );
    this.searchCategory$.subscribe((categories) => {
      this.filteredCategory = categories;
    });

    this.productBySearch$.subscribe((item) => (this.product = item));
    this.selectedCategory.valueChanges.subscribe((data) => {
      this.isOpenResult = false;
      let category = data ? { status: 1, category_id: data } : { status: 1 };
      this.store.dispatch(new GetProductBySearchListAction(category));
      this.store.dispatch(
        new GetSearchByCategoryAction(
          data ? { status: 1, ids: data } : { status: 1, paginate: 4 },
        ),
      );
    });
  }

  ngOnInit() {
    if (
      this.isBrowser &&
      (this.style() == "simple" || this.style() == "kiki")
    ) {
      this.startTypingAnimation();
    }

    this.term.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged()) // Adjust the debounce time as needed (in milliseconds)
      .subscribe((inputValue) => {
        if (inputValue.length >= 1) {
          this.searchText = inputValue;
          this.filteredResults = this.filterWords(this.term.value).slice(0, 4);
          this.filteredCategory = this.searchCategory(this.searchText);
          this.selectedResultIndex = -1;
        } else if (inputValue.length == 0) {
          this.onInputChange();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    let data = changes["data"]?.currentValue;
    let ids = data?.content?.home_banner?.main_banner?.category_ids;
    if (ids && ids.length) {
      this.category$.subscribe((res) => {
        this.categories = res.data.filter((category) =>
          ids?.includes(category.id),
        );
      });
    }
  }

  @HostListener("document:keydown", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === "ArrowUp") {
      this.navigateResults(-1);
    } else if (event.key === "ArrowDown") {
      this.navigateResults(1);
    }
  }

  openSearchModal() {
    this.modal.open(SearchModal, {
      centered: true,
      size: "xl",
      windowClass: "theme-modal-2 search-modal",
    });
  }

  onInputChange() {
    this.filteredResults = this.product.slice(0, 4);
    this.filteredCategory = this.searchCategory(this.term.value);
    this.selectedResultIndex = -1;
  }

  focusInput(val: boolean) {
    this.filteredResults = this.product.slice(0, 4);

    if (val) this.isOpenResult = val;
  }

  filterWords(input: string): IProduct[] {
    return this.product.filter((product) => {
      const productName = product.name.toLowerCase();
      const inputLower = input.toLowerCase();
      const words = productName.split(" ");
      const isMatch = words.some((word) => word.startsWith(inputLower));
      return isMatch;
    });
  }

  selectResult(result: string) {
    this.term.patchValue(result);
    this.filteredResults = [];
    this.selectedResultIndex = -1;
  }

  searchCategory(term: string) {
    let params = { status: 1, paginate: 4, search: term };
    this.store.dispatch(new GetSearchByCategoryAction(params));
    this.searchCategory$.subscribe(
      (categories) => (this.filteredCategory = categories),
    );
    return [];
  }

  navigateResults(direction: number) {
    const newIndex = this.selectedResultIndex + direction;
    if (newIndex >= 0 && newIndex < this.filteredResults.length) {
      this.selectedResultIndex = newIndex;
      this.scrollResultsContainer();
    }
  }

  private scrollResultsContainer() {
    const resultsContainer = this.resultsContainer();
    if (resultsContainer && resultsContainer.nativeElement) {
      const container = resultsContainer.nativeElement;
      const selectedResultElement =
        resultsContainer.nativeElement.querySelector(".result-item.selected");

      if (selectedResultElement) {
        const containerRect = container.getBoundingClientRect();
        const selectedRect = selectedResultElement.getBoundingClientRect();

        if (selectedRect.bottom > containerRect.bottom) {
          // Scroll down
          container.scrollTop += 150;
        } else if (selectedRect.top < containerRect.top) {
          // Scroll up
          container.scrollTop -= 150;
        }
      }
    }
  }

  onEnterKey() {
    // Perform the action you want when the Enter key is pressed in the input
    if (this.selectedResultIndex !== -1) {
      const selectedItem = this.filteredResults[this.selectedResultIndex];
      void this.router.navigateByUrl(`/product/${selectedItem.slug}`);
      this.isOpenResult = false;
      this.menuService.isOpenSearch = false;
      this.selectedResultIndex = 0;
      this.term.patchValue("");
    }
  }

  redirectToSearch() {
    void this.router.navigate(["/search"], {
      relativeTo: this.route,
      queryParams: {
        category: null,
        search: this.term.value ? this.term.value : null,
      },
      queryParamsHandling: "merge", // preserve the existing query params in the route
      skipLocationChange: false, // do trigger navigation
    });
  }

  toggleSearchBox() {
    this.show = !this.show;
  }

  navigateToProduct(slug: string) {
    this.closeSearch();
    void this.router.navigateByUrl(`/product/${slug}`);
  }

  navigateToCategory(slug: string) {
    this.closeSearch();
    void this.router.navigateByUrl(`/collections/${slug}`);
  }

  openSearch() {
    if (this.menuService.isOpenSearch) return;
    this.menuService.isOpenSearch = true;
    // Auto-focus the input after the panel transitions in
    if (this.isBrowser) {
      setTimeout(() => {
        const input = document.querySelector(
          ".kiki-search-input",
        ) as HTMLInputElement;
        if (input) input.focus();
      }, 260);
    }
  }

  closeSearch() {
    this.menuService.isOpenSearch = false;
    this.isOpenResult = false;
  }

  startTypingAnimation() {
    const charactersArray = this.textToType.split("");
    let currentIndex = 0;
    let eraseMode = false;

    this.animationSubscription = interval(150).subscribe(() => {
      if (!eraseMode) {
        if (currentIndex < charactersArray.length) {
          this.typedText += charactersArray[currentIndex];
          currentIndex++;
        } else {
          eraseMode = true;
        }
      } else {
        if (this.typedText.length > 0) {
          this.typedText = this.typedText.slice(0, -1);
        } else {
          eraseMode = false;
          currentIndex = 0;
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.animationSubscription) {
      this.animationSubscription.unsubscribe();
    }
  }
}
