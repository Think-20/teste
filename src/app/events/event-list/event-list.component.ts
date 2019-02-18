import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { EventService } from '../event.service';
import { Event } from '../event.model';
import { AuthService } from '../../login/auth.service';
import { Pagination } from '../../shared/pagination.model';
import { DataInfo } from '../../shared/data-info.model';
import { distinctUntilChanged } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operator/debounceTime';

@Component({
  selector: 'cb-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css'],
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
export class EventListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  search: FormControl
  events: Event[] = []
  searching = false
  filter: boolean = false
  pagination: Pagination
  pageIndex: number = 0
  dataInfo: DataInfo

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  total(events: Event[]) {
    return events.length
  }

  permissionVerify(module: string, event: Event): boolean {
    let access: boolean
    switch(module) {
      case 'show': {
        access = this.authService.hasAccess('events/get/{id}')
        break
      }
      case 'edit': {
        access = this.authService.hasAccess('event/edit')
        break
      }
      case 'delete': {
        access = this.authService.hasAccess('event/remove/{id}')
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

    this.loadEvents()

    this.searchForm.valueChanges
    .pipe(distinctUntilChanged())
    .debounceTime(500)
    .subscribe(() => {
      let controls = this.searchForm.controls
      this.loadEvents({
        search: controls.search.value,
        attendance: controls.attendance.value,
        event_status: controls.event_status.value,
        event_type: controls.event_type.value,
        rate: controls.rate.value,
      })
    })
  }

  loadEvents(params = {}) {
    this.searching = true
    let snackBar = this.snackBar.open('Carregando eventos...')

    this.eventService.events(params).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.events = <Event[]> this.pagination.data
      snackBar.dismiss()
    })
  }

  filterToggle() {
    this.filter = this.filter ? false : true
  }

  filterForm() {
    this.searching = true
    this.eventService.events(this.searchForm.value).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.events = <Event[]> this.pagination.data
    })
  }

  delete(event: Event) {
    this.eventService.delete(event.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if(data.status) {
        this.events.splice(this.events.indexOf(event), 1)
      }
    })
  }

  changePage($event) {
    this.searching = true
    this.events = []
    this.eventService.events(this.searchForm.value, ($event.pageIndex + 1)).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.events = <Event[]> this.pagination.data
    })
    this.pageIndex = $event.pageIndex
  }

}
