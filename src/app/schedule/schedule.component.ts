import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { BriefingService } from '../briefings/briefing.service';
import { Briefing } from '../briefings/briefing.model';
import { Pagination } from 'app/shared/pagination.model';
import { Employee } from '../employees/employee.model';
import { EmployeeService } from '../employees/employee.service';

@Component({
  selector: 'cb-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
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
export class ScheduleComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  search: FormControl
  pagination: Pagination
  briefings: Briefing[] = []
  attendances: Employee[]
  searching = false
  filter = false
  chrono = [{}]

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private briefingService: BriefingService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search,
      attendance: this.fb.control('')
    })

    /*
    this.employeeService.canInsertClients().subscribe((attendances) => {
      this.attendances = attendances
    })
    */

    this.searching = true
    let snackBar = this.snackBar.open('Carregando briefings...')

    this.briefingService.briefings().subscribe(pagination => {
      this.pagination = pagination
      this.searching = false
      this.briefings = pagination.data
      this.chronologicDisplay()
      snackBar.dismiss()
    })
  }

  chronologicDisplay() {
    let i: number = 0
    let date: Date = new Date()
    let thisMonth: number = date.getMonth()
    let days: number[]

    console.log(date, thisMonth)

    date.setDate(1)

    while(date.getMonth() == thisMonth) {
      if(date.getDay() > 0 && date.getDay() < 6) {
        let briefings = this.briefings.filter((briefing) => {
          let briefingDate = new Date(Date.parse(briefing.available_date + 'T00:00:00'))
          console.log(briefingDate, briefing.available_date)
          return briefingDate.getDate() == date.getDate()
            && briefingDate.getMonth() == date.getMonth()
        })

        if(briefings.length < 6) {
          let length = briefings.length
          for(let y = 0; y < (5 - length); y++) {
            briefings.push(new Briefing())
          }
        }

        this.chrono[i] = {
          day: date.getDate(),
          weekDay: date.getDay(),
          briefings: briefings          
        }

        i++
      }

      date.setDate(date.getDate() + 1)
    }
  }

  price(price: number) {
    if(price == 0) {
      return '0,00'
    }

    let formatedPrice: string = price.toString().replace('.',',')

    for(let i = (price.toString().length - 4); i >= 0; i--) {
      if(i != 6 && ((i - 3) % 3 == 0) && formatedPrice.charAt(i - 1) != '') {
        formatedPrice = formatedPrice.slice(0, i) + '.' + formatedPrice.slice(i, formatedPrice.toString().length)
      }
    }

    return formatedPrice
  }

  changePage($event) {
    this.searching = true
    this.briefings = []
    this.briefingService.briefings(this.search.value, ($event.pageIndex + 1)).subscribe(pagination => {
      this.pagination = pagination
      this.briefings = pagination.data
      this.searching = false
    })
  }

  delete(briefing: Briefing) {
    this.briefingService.delete(briefing.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if(data.status) {
        this.briefings.splice(this.briefings.indexOf(briefing), 1)
        this.pagination.total = this.pagination.total - 1
      }
    })
  }

}
