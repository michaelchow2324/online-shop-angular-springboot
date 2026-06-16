import { NgClass } from '@angular/common';
import { Component, inject, Input, output, SimpleChanges } from '@angular/core';

import { IPaginate } from '../../../interface/pagination.interface';
import { PaginationService } from '../../../services/pagination.service';

@Component({
  selector: 'app-pagination',
  imports: [NgClass],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  public paginationService = inject(PaginationService);

  @Input() total: number;
  @Input() currentPage: number;
  @Input() pageSize: number;

  readonly setPage = output<number>();

  public paginate: IPaginate;

  // Detect changes
  ngOnChanges(changes: SimpleChanges) {
    this.total = changes['total'] ? changes['total'].currentValue : this.total;
    this.currentPage = changes['currentPage']
      ? changes['currentPage'].currentValue
      : this.currentPage;
    this.pageSize = changes['pageSize'] ? changes['pageSize'].currentValue : this.pageSize;
    this.paginate = this.paginationService.getPager(this.total, this.currentPage, this.pageSize);
  }

  // Set Page
  pageSet(page: number) {
    this.setPage.emit(page); // Set Page Number
  }
}
