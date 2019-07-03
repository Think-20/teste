import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ItemCategoryService } from '../item-category.service';
import { ItemCategory } from '../item-category.model';
import { Pagination } from 'app/shared/pagination.model';
import { DataInfo } from 'app/shared/data-info.model';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'cb-itemCategory-list',
  templateUrl: './item-category-list.component.html',
  styleUrls: ['./item-category-list.component.css'],
  animations: [
    trigger('rowAppeared', [
      state('ready', style({ opacity: 1 })),
      transition('void => ready', animate('300ms 0s ease-in', keyframes([
        style({ opacity: 0, transform: 'translateX(-30px)', offset: 0 }),
        style({ opacity: 0.8, transform: 'translateX(10px)', offset: 0.8 }),
        style({ opacity: 1, transform: 'translateX(0px)', offset: 1 })
      ]))),
      transition('ready => void', animate('300ms 0s ease-out', keyframes([
        style({ opacity: 1, transform: 'translateX(0px)', offset: 0 }),
        style({ opacity: 0.8, transform: 'translateX(-10px)', offset: 0.2 }),
        style({ opacity: 0, transform: 'translateX(30px)', offset: 1 })
      ])))
    ])
  ]
})
@Injectable()
export class ItemCategoryListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  search: FormControl
  itemCategories: ItemCategory[] = []
  dataInfo: DataInfo
  pagination: Pagination
  pageIndex: number
  formCopy: any
  params = {}
  filter = false
  hasFilterActive = false
  searching = false

  constructor(
    private fb: FormBuilder,
    private itemCategoryService: ItemCategoryService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.pageIndex = this.itemCategoryService.pageIndex
    this.createForm()
    this.loadInitialData()
  }

  createForm() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search,
    })

    this.formCopy = this.searchForm.value

    if (JSON.stringify(this.itemCategoryService.searchValue) == JSON.stringify({})) {
      this.itemCategoryService.searchValue = this.searchForm.value
    } else {
      this.searchForm.setValue(this.itemCategoryService.searchValue)
    }

    this.searchForm.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe((searchValue) => {
        this.params = this.getParams(searchValue)
        this.loadItemCategories(this.params, 1)

        this.pageIndex = 0
        this.itemCategoryService.pageIndex = 0
        this.itemCategoryService.searchValue = searchValue
        this.updateFilterActive()
      })
  }

  getParams(searchValue) {
    return {
      search: searchValue.search,
    }
  }

  updateFilterActive() {
    if (JSON.stringify(this.itemCategoryService.searchValue) === JSON.stringify(this.formCopy)) {
      this.hasFilterActive = false
    } else {
      this.hasFilterActive = true
    }
  }

  clearFilter() {
    this.itemCategoryService.searchValue = {}
    this.itemCategoryService.pageIndex = 0
    this.pageIndex = 0
    this.createForm()
    this.loadInitialData()
  }

  loadInitialData() {
    if (JSON.stringify(this.itemCategoryService.searchValue) === JSON.stringify(this.formCopy)) {
      this.loadItemCategories({}, this.pageIndex + 1)
    } else {
      this.params = this.getParams(this.itemCategoryService.searchValue)
      this.loadItemCategories(this.params, this.pageIndex + 1)
    }

    this.updateFilterActive()
  }

  loadItemCategories(params, page: number) {
    let snackBar = this.snackBar.open('Carregando categorias de item...')
    this.searching = true
    this.itemCategoryService.itemCategories(params, page).subscribe(dataInfo => {
      this.pagination = dataInfo.pagination
      this.itemCategories = dataInfo.pagination.data
      this.searching = false
      snackBar.dismiss()
    })
  }

  changePage($event) {
    this.searching = true
    this.itemCategories = []
    this.itemCategoryService.itemCategories(this.itemCategoryService.searchValue, ($event.pageIndex + 1)).subscribe(dataInfo => {
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.itemCategories = dataInfo.pagination.data
      this.searching = false
      this.pageIndex = $event.pageIndex
      this.itemCategoryService.pageIndex = this.pageIndex
    })
  }

  delete(itemCategory: ItemCategory) {
    this.itemCategoryService.delete(itemCategory.id).subscribe(() => {
      this.itemCategories.splice(this.itemCategories.indexOf(itemCategory), 1)
    })
  }

}
