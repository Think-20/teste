import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { FunctionalityService } from '../functionality.service';
import { Functionality } from '../functionality.model';
import { AuthService } from '../../login/auth.service';
import { Pagination } from '../../shared/pagination.model';
import { DataInfo } from '../../shared/data-info.model';
import { distinctUntilChanged } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { API } from '../../app.api';

@Component({
  selector: 'cb-functionality-list',
  templateUrl: './functionality-list.component.html',
  styleUrls: ['./functionality-list.component.css'],
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
export class FunctionalityListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  formCopy: FormGroup
  search: FormControl
  functionalities: Functionality[] = []
  searching = false
  filter: boolean = false
  pagination: Pagination
  dataInfo: DataInfo
  pageIndex: number
  params = {}
  hasFilterActive = false
  API = API

  constructor(
    private fb: FormBuilder,
    private functionalityService: FunctionalityService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  total(functionalities: Functionality[]) {
    return functionalities.length
  }

  permissionVerify(module: string, functionality: Functionality): boolean {
    let access: boolean
    switch(module) {
      case 'show': {
        access = functionality.id != functionality.id ? this.authService.hasAccess('functionalities/get/{id}') : true
        break
      }
      case 'edit': {
        access = functionality.id != functionality.id ? this.authService.hasAccess('functionality/edit') : true
        break
      }
      case 'delete': {
        access = functionality.id != functionality.id ? this.authService.hasAccess('functionality/remove/{id}') : true
        break
      }
      default: {
        access = false
        break
      }
    }
    return access
  }

  ngOnInit() {
    this.pageIndex = this.functionalityService.pageIndex

    this.createForm()
    this.loadInitialData()
  }

  createForm() {
    this.search = this.fb.control('')
    this.formCopy = this.fb.group({
      search: this.search,
    })

    this.searchForm = Object.create(this.formCopy)

    if(JSON.stringify(this.functionalityService.searchValue) == JSON.stringify({})) {
      this.functionalityService.searchValue = this.searchForm.value
    } else {
      this.searchForm.setValue(this.functionalityService.searchValue)
    }

    this.searchForm.valueChanges
    .pipe(distinctUntilChanged())
    .debounceTime(500)
    .subscribe((searchValue) => {
      let controls = this.searchForm.controls
      this.params = {
        search: controls.search.value,
      }

      this.loadFunctionalities(this.params, 1)

      this.pageIndex = 0
      this.functionalityService.pageIndex = 0
      this.functionalityService.searchValue = searchValue
      this.updateFilterActive()
    })
  }

  updateFilterActive() {
    if (JSON.stringify(this.functionalityService.searchValue) === JSON.stringify(this.formCopy.value)) {
      this.hasFilterActive = false
    } else {
      this.hasFilterActive = true
    }
  }

  clearFilter() {
    this.functionalityService.searchValue = {}
    this.functionalityService.pageIndex = 0
    this.pageIndex = 0
    this.createForm()
    this.loadInitialData()
  }

  loadInitialData() {
    if (JSON.stringify(this.functionalityService.searchValue) === JSON.stringify(this.formCopy.value)) {
      this.loadFunctionalities({}, this.pageIndex + 1)
    } else {
      this.loadFunctionalities(this.functionalityService.searchValue, this.functionalityService.pageIndex + 1)
    }

    this.updateFilterActive()
  }

  loadFunctionalities(params, page: number) {
    this.searching = true
    let snackBar = this.snackBar.open('Carregando dados...')

    this.functionalityService.functionalities(params, page).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.functionalities = <Functionality[]> this.pagination.data
      snackBar.dismiss()
    })
  }

  delete(functionality: Functionality) {
    this.functionalityService.delete(functionality.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if(data.status) {
        this.functionalities.splice(this.functionalities.indexOf(functionality), 1)
      }
    })
  }

  changePage($event) {
    this.searching = true
    this.functionalities = []

    this.functionalityService.functionalities(this.functionalityService.searchValue, ($event.pageIndex + 1)).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.functionalities = <Functionality[]> this.pagination.data
      this.pageIndex = $event.pageIndex
      this.functionalityService.pageIndex = this.pageIndex
    })
  }

}
