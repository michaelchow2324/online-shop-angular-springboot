import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-theme-title',
  imports: [NgClass],
  templateUrl: './theme-title.html',
  styleUrl: './theme-title.scss',
})
export class ThemeTitle {
  readonly title = input<any>();
  readonly type = input<string>();
  readonly textWhite = input<boolean>(false);
  readonly space = input<boolean>(true);
  readonly class = input<string>();

  getTitle(value: string) {
    const text = value.split(' ');

    const firstWord = text.slice(0, 3).join(' ');
    const remainingWord = text.slice(3).join(' ');
    return `<h4>${firstWord} <span class="gradient-text">${remainingWord}</span></h4>`;
  }
}
