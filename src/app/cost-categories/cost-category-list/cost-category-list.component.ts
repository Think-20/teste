import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { CostCategoryService } from '../cost-category.service';
import { CostCategory } from '../cost-category.model';
import { Pagination } from 'app/shared/pagination.model';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { DataInfo } from 'app/shared/data-info.model';

@Component({
  selector: 'cb-costCategory-list',
  templateUrl: './cost-category-list.component.html',
  styleUrls: ['./cost-category-list.component.css'],
  animations: [
    trigger('rowAppeared', [
      state('ready', style({opacity: 1})),
      transition('void => ready', animate('300ms 0s ease-in', keyframes([
        style({opacity: 0, transform: 'translateX(-30px)', offset: 0}),
        style({opacity: 0.8, transform: 'translateX(10px)', offset: 0.8}),
        style({opacity: 1, transform: 'translateX(0px)', offset: 1})
      ]))),
      transition('ready => void', animate('300ms 0s ease-out', keyframes([
        style({opacity: 1, transform: 'translateX(0px)', offset: 0}),
        style({opacity: 0.8, transform: 'translateX(-10px)', offset: 0.2}),
        style({opacity: 0, transform: 'translateX(30px)', offset: 1})
      ])))
    ])
  ]
})
@Injectable()
export class CostCategoryListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  formCopy: any
  search: FormControl
  costCategories: CostCategory[] = []
  dataInfo: DataInfo
  pagination: Pagination
  pageIndex: number
  params = {}
  filter = false
  hasFilterActive = false
  searching = false

  constructor(
    private fb: FormBuilder,
    private costCategoryService: CostCategoryService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.pageIndex = this.costCategoryService.pageIndex
    this.createForm()
    this.loadInitialData()
  }

  createForm() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search
    })

    this.formCopy = this.searchForm.value

    if(JSON.stringify(this.costCategoryService.searchValue) == JSON.stringify({})) {
      this.costCategoryService.searchValue = this.searchForm.value
    } else {
      this.searchForm.setValue(this.costCategoryService.searchValue)
    }

    this.searchForm.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe((searchValue) => {
        this.params = this.getParams(searchValue)
        this.loadCostCategories(this.params, 1)

        this.pageIndex = 0
        this.costCategoryService.pageIndex = 0
        this.costCategoryService.searchValue = searchValue
        this.updateFilterActive()
      })
  }

  getParams(searchValue) {
    return {
      search: searchValue.search
    }
  }

  updateFilterActive() {
    if (JSON.stringify(this.costCategoryService.searchValue) === JSON.stringify(this.formCopy)) {
      this.hasFilterActive = false
    } else {
      this.hasFilterActive = true
    }
  }

  clearFilter() {
    this.costCategoryService.searchValue = {}
    this.costCategoryService.pageIndex = 0
    this.pageIndex = 0
    this.createForm()
    this.loadInitialData()
  }

  loadInitialData() {
    if (JSON.stringify(this.costCategoryService.searchValue) === JSON.stringify(this.formCopy)) {
      this.loadCostCategories({}, this.pageIndex + 1)
    } else {
      this.params = this.getParams(this.costCategoryService.searchValue)
      this.loadCostCategories(this.params, this.pageIndex + 1)
    }

    this.updateFilterActive()
  }

  loadCostCategories(params, page: number) {
    let snackBar = this.snackBar.open('Carregando categorias de custo...')
    this.searching = true
    this.costCategoryService.costCategories(params, page).subscribe(dataInfo => {
      this.pagination = dataInfo.pagination
      this.costCategories = dataInfo.pagination.data
      this.searching = false
      snackBar.dismiss()
    })
  }

  changePage($event) {
    this.searching = true
    this.costCategories = []
    this.costCategoryService.costCategories(this.costCategoryService.searchValue, ($event.pageIndex + 1)).subscribe(dataInfo => {
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.costCategories = dataInfo.pagination.data
      this.searching = false
      this.pageIndex = $event.pageIndex
      this.costCategoryService.pageIndex = this.pageIndex
    })
  }

  delete(costCategory: CostCategory) {
    this.costCategoryService.delete(costCategory.id).subscribe(() => {
      this.costCategories.splice(this.costCategories.indexOf(costCategory), 1)
    })
  }

}
