import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { ItemService } from '../item.service';
import { Item } from '../item.model';
import { Pagination } from 'app/shared/pagination.model';
import { DataInfo } from 'app/shared/data-info.model';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'cb-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css'],
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
export class ItemListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  search: FormControl
  items: Item[] = []
  searching = false
  dataInfo: DataInfo
  pagination: Pagination
  pageIndex: number
  formCopy: any
  params = {}
  filter = false
  hasFilterActive = false

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private snackBar: MatSnackBar
  ) { }

  total(items: Item[]) {
    return items.length
  }

  ngOnInit() {
    this.pageIndex = this.itemService.pageIndex
    this.createForm()
    this.loadInitialData()
  }

  createForm() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search,
    })

    this.formCopy = this.searchForm.value

    if (JSON.stringify(this.itemService.searchValue) == JSON.stringify({})) {
      this.itemService.searchValue = this.searchForm.value
    } else {
      this.searchForm.setValue(this.itemService.searchValue)
    }

    this.searchForm.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe((searchValue) => {
        this.params = this.getParams(searchValue)
        this.loadItems(this.params, 1)

        this.pageIndex = 0
        this.itemService.pageIndex = 0
        this.itemService.searchValue = searchValue
        this.updateFilterActive()
      })
  }

  getParams(searchValue) {
    return {
      search: searchValue.search,
    }
  }

  updateFilterActive() {
    if (JSON.stringify(this.itemService.searchValue) === JSON.stringify(this.formCopy)) {
      this.hasFilterActive = false
    } else {
      this.hasFilterActive = true
    }
  }

  clearFilter() {
    this.itemService.searchValue = {}
    this.itemService.pageIndex = 0
    this.pageIndex = 0
    this.createForm()
    this.loadInitialData()
  }

  loadInitialData() {
    if (JSON.stringify(this.itemService.searchValue) === JSON.stringify(this.formCopy)) {
      this.loadItems({}, this.pageIndex + 1)
    } else {
      this.params = this.getParams(this.itemService.searchValue)
      this.loadItems(this.params, this.pageIndex + 1)
    }

    this.updateFilterActive()
  }

  loadItems(params, page: number) {
    let snackBar = this.snackBar.open('Carregando itens...')
    this.searching = true
    this.itemService.items(params, page).subscribe(dataInfo => {
      this.pagination = dataInfo.pagination
      this.items = dataInfo.pagination.data
      this.searching = false
      snackBar.dismiss()
    })
  }

  changePage($event) {
    this.searching = true
    this.items = []
    this.itemService.items(this.itemService.searchValue, ($event.pageIndex + 1)).subscribe(dataInfo => {
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.items = dataInfo.pagination.data
      this.searching = false
      this.pageIndex = $event.pageIndex
      this.itemService.pageIndex = this.pageIndex
    })
  }

  delete(item: Item) {
    this.itemService.delete(item.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if (data.status) {
        this.items.splice(this.items.indexOf(item), 1)
      }
    })
  }

}
