import { JsonPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, input, output } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { IProduct, IVariation } from '../../../../../interface/product.interface';
import { result } from '../../product-box-two/product-box-two';

@Component({
  selector: 'app-dropdown-variant',
  imports: [TranslateModule, JsonPipe],
  templateUrl: './dropdown-variant.html',
  styleUrl: './dropdown-variant.scss',
})
export class DropdownVariant {
  private ref = inject(ChangeDetectorRef);

  readonly product = input<IProduct>();
  readonly selectedOption = output<IVariation>();

  public result: result[] = [];
  public soldOutAttributesIds: number[] = [];
  public selectedVariation: IVariation;

  ngOnChanges() {
    setTimeout(() => {
      const product = this.product();
      if (product?.variations?.length) {
        this.result = this.generateCombinations(product);
      }
    }, 1);
  }

  // Select First Attribute
  checkVariant(item: IVariation, i: number) {
    if (item.stock_status == 'in_stock' && item.status) {
      if (
        item.stock_status === 'in_stock' &&
        item.status &&
        i ===
          this.result.findIndex(obj => obj.value.stock_status === 'in_stock' && obj.value.status)
      ) {
        return true;
      }
    }
  }

  getSelectedVariant(item: any) {
    if (item && item.target.value) {
      this.selectedOption.emit(JSON.parse(item.target.value));
    }
  }

  // Combination Of Variations
  generateCombinations(attributes: IProduct): any {
    const selectVariations: any[] = [];

    attributes.variations.forEach(variation => {
      const labelAttributes = variation.attribute_values.map(attr => attr.value)?.join('/');
      const value = variation;

      selectVariations.push({ label: labelAttributes, value });
    });

    // Selected Variation While Page Load
    selectVariations.forEach((item, i) => {
      if (item.value.stock_status == 'in_stock' && !!item.value.status) {
        if (
          item.value.stock_status === 'in_stock' &&
          !!item.value.status &&
          i ===
            selectVariations.findIndex(
              obj => obj.value.stock_status === 'in_stock' && obj.value.status,
            )
        ) {
          this.selectedVariation = item.value;
          if (this.selectedVariation) {
            this.selectedOption.emit(this.selectedVariation);
          }
          return true;
        }
      }
    });

    return selectVariations;
  }
}
