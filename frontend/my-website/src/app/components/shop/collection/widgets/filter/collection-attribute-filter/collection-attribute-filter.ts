import { Component, inject, Input, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IAttribute } from '../../../../../../shared/interface/attribute.interface';
import { Params } from '../../../../../../shared/interface/core.interface';

@Component({
  selector: 'app-collection-attribute-filter',
  templateUrl: './collection-attribute-filter.html',
  styleUrl: './collection-attribute-filter.scss',
})
export class CollectionAttributeFilter {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly attribute = input<IAttribute>();
  @Input() filter: Params;

  public selectedAttributes: string[] = [];

  ngOnChanges() {
    const filter = this.filter;
    this.selectedAttributes = filter!['attribute'] ? filter!['attribute'].split(',') : [];
  }

  applyFilter(event: Event) {
    const index = this.selectedAttributes.indexOf((<HTMLInputElement>event?.target)?.value); // checked and unchecked value

    if ((<HTMLInputElement>event?.target)?.checked)
      this.selectedAttributes.push((<HTMLInputElement>event?.target)?.value); // push in array cheked value
    else this.selectedAttributes.splice(index, 1); // removed in array unchecked value

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        attribute: this.selectedAttributes.length ? this.selectedAttributes?.join(',') : null,
        page: 1,
      },
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false, // do trigger navigation
    });
  }

  // check if the item are selected
  checked(item: string) {
    if (this.selectedAttributes?.indexOf(item) != -1) {
      return true;
    }
    return false;
  }
}
