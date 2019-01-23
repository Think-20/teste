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
  search: FormControl
  functionalities: Functionality[] = []
  searching = false
  filter: boolean = false
  pagination: Pagination
  pageIndex: number = 0
  dataInfo: DataInfo
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
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search,
    })

    this.loadFunctionalities()

    this.searchForm.valueChanges
    .pipe(distinctUntilChanged())
    .debounceTime(500)
    .subscribe(() => {
      let controls = this.searchForm.controls
      this.loadFunctionalities({
        search: controls.search.value,
      })
    })
  }

  loadFunctionalities(params = {}) {
    this.searching = true
    let snackBar = this.snackBar.open('Carregando dados...')

    this.functionalityService.functionalities(params).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.functionalities = <Functionality[]> this.pagination.data
      snackBar.dismiss()
    })
  }

  filterToggle() {
    this.filter = this.filter ? false : true
  }

  filterForm() {
    this.searching = true
    this.functionalityService.functionalities(this.searchForm.value).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.functionalities = <Functionality[]> this.pagination.data
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

    this.functionalityService.functionalities(this.searchForm.value, ($event.pageIndex + 1)).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.functionalities = <Functionality[]> this.pagination.data
    })

    this.pageIndex = $event.pageIndex
  }

}
