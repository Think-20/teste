import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { PlaceService } from '../place.service';
import { Place } from '../place.model';
import { AuthService } from '../../login/auth.service';
import { Pagination } from '../../shared/pagination.model';
import { EmployeeService } from '../../employees/employee.service';
import { Employee } from '../../employees/employee.model';
import { DataInfo } from '../../shared/data-info.model';
import { distinctUntilChanged } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operator/debounceTime';

@Component({
  selector: 'cb-place-list',
  templateUrl: './place-list.component.html',
  styleUrls: ['./place-list.component.css'],
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
export class PlaceListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  search: FormControl
  places: Place[] = []
  attendances: Employee[]
  searching = false
  filter: boolean = false
  pagination: Pagination
  pageIndex: number = 0
  dataInfo: DataInfo

  constructor(
    private fb: FormBuilder,
    private placeService: PlaceService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  total(places: Place[]) {
    return places.length
  }

  permissionVerify(module: string, place: Place): boolean {
    let access: boolean
    let employee = this.authService.currentUser().employee
    switch(module) {
      case 'show': {
        access = this.authService.hasAccess('places/get/{id}')
        break
      }
      case 'edit': {
        access = this.authService.hasAccess('place/edit')
        break
      }
      case 'delete': {
        access = this.authService.hasAccess('place/remove/{id}')
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
      attendance: this.fb.control(''),
      place_status: this.fb.control(''),
      rate: this.fb.control(''),
      place_type: this.fb.control('')
    })

    this.loadPlaces()

    this.searchForm.valueChanges
    .pipe(distinctUntilChanged())
    .debounceTime(500)
    .subscribe(() => {
      let controls = this.searchForm.controls
      this.loadPlaces({
        search: controls.search.value,
        attendance: controls.attendance.value,
        place_status: controls.place_status.value,
        place_type: controls.place_type.value,
        rate: controls.rate.value,
      })
    })
  }

  loadPlaces(params = {}) {
    this.searching = true
    let snackBar = this.snackBar.open('Carregando locais...')

    this.placeService.places(params).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.places = <Place[]> this.pagination.data
      snackBar.dismiss()
    })
  }

  filterToggle() {
    this.filter = this.filter ? false : true
  }

  filterForm() {
    this.searching = true
    this.placeService.places(this.searchForm.value).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.places = <Place[]> this.pagination.data
    })
  }

  compareAttendance(var1: Employee, var2: Employee) {
    return var1.id === var2.id
  }

  delete(place: Place) {
    this.placeService.delete(place.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if(data.status) {
        this.places.splice(this.places.indexOf(place), 1)
      }
    })
  }

  changePage($place) {
    this.searching = true
    this.places = []
    this.placeService.places(this.searchForm.value, ($place.pageIndex + 1)).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.places = <Place[]> this.pagination.data
    })
    this.pageIndex = $place.pageIndex
  }

}
