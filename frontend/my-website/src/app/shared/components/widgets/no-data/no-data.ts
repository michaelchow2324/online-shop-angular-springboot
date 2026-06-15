import { Component, input } from '@angular/core';

@Component({
  selector: 'app-no-data',
  imports: [],
  templateUrl: './no-data.html',
  styleUrl: './no-data.scss',
})
export class NoData {
  readonly class = input<string>('no-data-added');
  readonly image = input<string>();
  readonly text = input<string>();
  readonly description = input<string>();
}
