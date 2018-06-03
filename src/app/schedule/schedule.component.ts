import { Component, OnInit, ViewChildren, QueryList, HostListener } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { BriefingService } from '../briefings/briefing.service';
import { Briefing } from '../briefings/briefing.model';
import { Pagination } from 'app/shared/pagination.model';
import { Employee } from '../employees/employee.model';
import { EmployeeService } from '../employees/employee.service';
import { Month, MONTHS } from '../shared/date/months';
import { DAYSOFWEEK } from '../shared/date/days-of-week';
import { Router } from '@angular/router';

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

  @ViewChildren('list') list: QueryList<any>
  scrollActivate: boolean = false
  rowAppearedState: string = 'ready'
  pagination: Pagination
  briefings: Briefing[] = []
  attendances: Employee[]
  searching = false
  filter = false
  chrono = [{}]
  month: Month
  months: Month[] = MONTHS
  date: Date
  updatedMessage: string = ''

  briefingDrag: Briefing
  lineBriefing: HTMLElement
  tempX: number
  tempY: number

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private briefingService: BriefingService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  onDragOver($event: DragEvent) {
    let moduleX = $event.layerX - this.tempX > 0 ? $event.layerX - this.tempX : ($event.layerX - this.tempX) * -1
    let moduleY = $event.layerY - this.tempY > 0 ? $event.layerY - this.tempY : ($event.layerY - this.tempY) * -1

    if( ($event.layerY == this.tempY && $event.layerX == this.tempX)
    || ($event.layerY == 0 && $event.layerX == 0)
    || (moduleX > 200 || moduleY > 200) ) {
      return
    }

    this.lineBriefing.style.top = $event.layerY + 'px'
    this.lineBriefing.style.left = $event.layerX + 'px'

    this.tempX = $event.layerX
    this.tempY = $event.layerY

    $event.preventDefault()

    /*
    if($event.layerX == 0 && $event.layerY == 0) {
      this.lineBriefing.style.position = 'relative'
      this.lineBriefing.style.width = ''
      this.lineBriefing.style.left = ''
      this.lineBriefing.style.top = ''
      $event.stopPropagation()
      $event.preventDefault()
    }
    */
  }

  onDrop($event: DragEvent, chrono) {
    console.log('onDrop', $event)
    console.log(chrono, chrono.day)
  }

  finishDrag($event: DragEvent, chrono) {
    console.log('finishDrag', $event)
    console.log(chrono, chrono.day)
  }

  presetDrag(line) {
    this.lineBriefing = line as HTMLElement
    this.lineBriefing.style.width = this.lineBriefing.offsetWidth + 'px';
    this.lineBriefing.style.transition = 'all 0.1s linear'
    this.tempX = this.lineBriefing.offsetLeft
    this.tempY = this.lineBriefing.offsetTop
  }

  startDrag($event: DragEvent, briefing: Briefing) {
    return false
    /*
    let image = this.lineBriefing.cloneNode(true) as HTMLElement
    this.lineBriefing.style.position = 'absolute'
    $event.dataTransfer.setDragImage(image, 0, 0)
    */
  }

  ngAfterViewInit() {
    this.list.changes.subscribe(() => {
      if(this.scrollActivate)
        this.scrollToDate()
    })
  }

  ngOnInit() {
    this.date = new Date()
    this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1))
    this.scrollActivate = true
    this.changeMonth(this.month)    
    this.scrollActivate = false
  }

  changeMonth(month: Month) {
    this.searching = true
    let snackBar = this.snackBar.open('Carregando briefings...')
    this.month = month
    let iniDate = this.date.getUTCFullYear() + '-' + (month.id) + '-01'
    let finDate = this.date.getUTCFullYear() + '-' + (month.id) + '-31'

    this.briefingService.briefings({
        iniDate: iniDate,
        finDate: finDate,
        paginate: false
    }).subscribe(pagination => {
      this.pagination = pagination
      this.searching = false
      this.briefings = pagination.data
      this.chronologicDisplay(iniDate)
      this.setUpdatedMessage()
      snackBar.dismiss()
    })
  }

  setUpdatedMessage() {
    if(this.briefings.length == 0) {
      this.updatedMessage = 'Sem atualizações'
      return
    }

    let sortedBriefings = this.briefings.sort((a,b) => {
      if(a.updated_at > b.updated_at) {
        return 1
      } else if(a.updated_at < b.updated_at) {
        return -1
      } else {
        return 0
      }
    })

    let formatedDate = ''
    let briefing = sortedBriefings[sortedBriefings.length - 1]
    let date = new Date(briefing.updated_at)
    
    if(date.getDate() < 10) {
      formatedDate += '0' + date.getDate() + '/'
    } else {
      formatedDate += date.getDate() + '/'
    }

    if((date.getUTCMonth() + 1) < 10) {
      formatedDate += '0' + (date.getUTCMonth() + 1) + '/'
    } else {
      formatedDate += (date.getUTCMonth() + 1) + '/'
    }

    formatedDate += date.getFullYear()
    formatedDate += ' às '
    
    if(date.getHours() < 10) {
      formatedDate += '0' + date.getHours() + ':'
    } else {
      formatedDate += date.getHours() + ':'
    }
    
    if(date.getMinutes() < 10) {
      formatedDate += '0' + date.getMinutes()
    } else {
      formatedDate += date.getMinutes()
    }

    this.updatedMessage = 'Atualizado ' + formatedDate + ' por ' + briefing.attendance.name
  }

  chronologicDisplay(iniDate) {
    let i: number = 0
    let date: Date = new Date(iniDate)
    let thisMonth: number = date.getMonth()
    let days: number[]
    date.setDate(1)

    while(date.getMonth() == thisMonth) {
      if(date.getDay() > 0 && date.getDay() < 6) {
        let briefings = this.briefings.filter((briefing) => {
          let briefingDate = new Date(Date.parse(briefing.available_date + 'T00:00:00'))
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
          dayOfWeek: DAYSOFWEEK.find(dayOfWeek => dayOfWeek.id == date.getDay()),
          briefings: briefings
        }

        i++
      }

      date.setDate(date.getDate() + 1)
    }
  }

  scrollToDate() {
    const elementList = document.querySelectorAll('.day-' + this.date.getDate());

    if(elementList.length > 0) {
      const element = elementList[0] as HTMLElement;
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  addBriefing(day: number) {
    let month = this.date.getMonth() + 1
    let tempMonth = month.toString()
    let tempDay = day.toString()

    if(month < 10) {
      tempMonth = '0' + month
    }

    if(day < 10) {
      tempDay = '0' + day
    }

    this.router.navigate(['/briefings/new', this.date.getUTCFullYear() + '-' + tempMonth + '-' + tempDay])
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
