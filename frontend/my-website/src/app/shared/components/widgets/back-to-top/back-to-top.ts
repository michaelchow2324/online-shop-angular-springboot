import { ViewportScroller } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-back-to-top',
  imports: [],
  templateUrl: './back-to-top.html',
  styleUrl: './back-to-top.scss',
})
export class BackToTop {
  private viewScroller = inject(ViewportScroller);

  tapToTop() {
    this.viewScroller.scrollToPosition([0, 0]);
  }
}
