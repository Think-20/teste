import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { DisplayService } from '../display.service';
import { Display } from '../display.model';
import { AuthService } from '../../login/auth.service';
import { Pagination } from '../../shared/pagination.model';
import { DataInfo } from '../../shared/data-info.model';
import { distinctUntilChanged } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { API } from '../../app.api';

@Component({
  selector: 'cb-display-list',
  templateUrl: './display-list.component.html',
  styleUrls: ['./display-list.component.css'],
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
export class DisplayListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  search: FormControl
  displays: Display[] = []
  searching = false
  filter: boolean = false
  pagination: Pagination
  pageIndex: number = 0
  dataInfo: DataInfo
  API = API

  constructor(
    private fb: FormBuilder,
    private displayService: DisplayService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  total(displays: Display[]) {
    return displays.length
  }

  permissionVerify(module: string, display: Display): boolean {
    let access: boolean
    switch(module) {
      case 'show': {
        access = display.id != display.id ? this.authService.hasAccess('displays/get/{id}') : true
        break
      }
      case 'edit': {
        access = display.id != display.id ? this.authService.hasAccess('display/edit') : true
        break
      }
      case 'delete': {
        access = display.id != display.id ? this.authService.hasAccess('display/remove/{id}') : true
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

    this.loadDisplays()

    this.searchForm.valueChanges
    .pipe(distinctUntilChanged())
    .debounceTime(500)
    .subscribe(() => {
      let controls = this.searchForm.controls
      this.loadDisplays({
        search: controls.search.value,
      })
    })
  }

  loadDisplays(params = {}) {
    this.searching = true
    let snackBar = this.snackBar.open('Carregando dados...')

    this.displayService.displays(params).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.displays = <Display[]> this.pagination.data
      snackBar.dismiss()
    })
  }

  filterToggle() {
    this.filter = this.filter ? false : true
  }

  filterForm() {
    this.searching = true
    this.displayService.displays(this.searchForm.value).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.displays = <Display[]> this.pagination.data
    })
  }

  delete(display: Display) {
    this.displayService.delete(display.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if(data.status) {
        this.displays.splice(this.displays.indexOf(display), 1)
      }
    })
  }

  changePage($event) {
    this.searching = true
    this.displays = []

    this.displayService.displays(this.searchForm.value, ($event.pageIndex + 1)).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.displays = <Display[]> this.pagination.data
    })

    this.pageIndex = $event.pageIndex
  }

}
