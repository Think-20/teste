import { Component, OnInit, ViewChildren, QueryList, NgZone, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { BriefingService } from '../briefings/briefing.service';
import { Briefing } from '../briefings/briefing.model';
import { Pagination } from 'app/shared/pagination.model';
import { Employee } from '../employees/employee.model';
import { EmployeeService } from '../employees/employee.service';
import { Month, MONTHS } from '../shared/date/months';
import { DAYSOFWEEK, DayOfWeek } from '../shared/date/days-of-week';
import { Router } from '@angular/router';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'cb-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
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
export class ScheduleComponent implements OnInit {

  @ViewChildren('list') list: QueryList<any>
  searchForm: FormGroup
  search: FormControl
  scrollActivate: boolean = false
  rowAppearedState: string = 'ready'
  pagination: Pagination
  briefings: Briefing[] = []
  attendances: Employee[]
  searching = false
  filter = false
  chrono: Chrono[] = []
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
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private el: ElementRef,
    private router: Router
  ) { }

  permissionVerify(module: string, briefing: Briefing): boolean {
    let access: boolean
    let employee = this.authService.currentUser().employee
    switch (module) {
      case 'new': {
        access = this.authService.hasAccess('briefing/save')
        break
      }
      case 'show': {
        access = briefing.attendance.id != employee.id ? this.authService.hasAccess('briefings/get/{id}') : true
        break
      }
      case 'edit': {
        access = briefing.attendance.id != employee.id ? this.authService.hasAccess('briefing/edit') : true
        break
      }
      case 'delete': {
        access = briefing.attendance.id != employee.id ? this.authService.hasAccess('briefing/remove/{id}') : true
        break
      }
      default: {
        access = false
        break
      }
    }
    return access
  }

  ngAfterViewInit() {
    this.list.changes.subscribe(() => {
      this.scrollToDate()

      let list = document.querySelectorAll("[draggable='true']")
      let info = { parentSenderPos: null, parentRecipientPos: null, senderPos: null, recipientPos: null }
      let draggable
      let angular = this

      this.ngZone.runOutsideAngular(() => {
        for (let i = 0; i < list.length; i++) {
          let info = { parentSenderPos: null, senderPos: null }
          draggable = list.item(i) as HTMLElement
          draggable.addEventListener('dragstart', function (event: DragEvent) {
            info.parentSenderPos = Array.prototype.indexOf.call(this.parentNode.parentNode.parentNode.children, this.parentNode.parentNode)
            info.senderPos = Array.prototype.indexOf.call(this.parentNode.children, this)
            event.dataTransfer.setData('type', JSON.stringify(info))
          })
          draggable.addEventListener('dragover', function (event) {
            event.preventDefault()
          })
          draggable.addEventListener('dragend', function (event) {
            event.preventDefault()
          })
        }
      })

      this.ngZone.run(() => {
        for (let i = 0; i < list.length; i++) {
          draggable = list.item(i) as HTMLElement
          draggable.addEventListener('drop', function (event: DragEvent) {
            if (this.parentNode == null) {
              return
            }

            event.preventDefault()

            angular.scrollActivate = false
            info = JSON.parse(event.dataTransfer.getData('type'))
            info.parentRecipientPos = Array.prototype.indexOf.call(this.parentNode.parentNode.parentNode.children, this.parentNode.parentNode)
            info.recipientPos = Array.prototype.indexOf.call(this.parentNode.children, this)

            let senderParent = document.querySelectorAll('.line-briefings')[info.parentSenderPos] as HTMLElement
            let recipientParent = document.querySelectorAll('.line-briefings')[info.parentRecipientPos] as HTMLElement
            let parentRecipientPos: number = info.parentRecipientPos
            let parentSenderPos: number = info.parentSenderPos

            //let briefing1Html = senderParent.querySelectorAll('.line-briefing')[info.senderPos] as HTMLElement
            //briefing1Html.style.backgroundColor = 'yellow'
            //let briefing2Html = recipientParent.querySelectorAll('.line-briefing')[info.recipientPos] as HTMLElement
            //briefing2Html.style.backgroundColor = 'red'

            let briefing1 = angular.chrono[parentSenderPos].briefings[info.senderPos]
            let briefing2 = angular.chrono[parentRecipientPos].briefings[info.recipientPos]

            if (briefing2.attendance_id != undefined
              && briefing1.attendance_id != briefing2.attendance_id
              && !this.permissionVerify('new')) {
              return false
            }

            let temp = briefing1.available_date
            briefing1.available_date = briefing2.available_date
            briefing2.available_date = temp

            let snackBar = angular.snackBar.open('Aguarde enquanto mudamos a data...')

            angular.briefingService.getNextAvailableDate(briefing1.available_date).subscribe((data) => {
              briefing1.available_date = data.available_date
              briefing1.creation_id = data.creation.id
              angular.briefingService.editAvailableDate(briefing1).subscribe((data) => {
                if(data.status == true) {
                  if(briefing2.id != undefined) {
                    console.log('briefing2.id é undefined, e estou calculando a próxima data')
                    angular.briefingService.getNextAvailableDate(briefing2.available_date).subscribe((data) => {
                      briefing2.available_date = data.available_date
                      briefing2.creation_id = data.creation.id
                      angular.briefingService.editAvailableDate(briefing2).subscribe((data) => {
                        if(data.status == true) {
                          snackBar.dismiss()
                          angular.changeMonth(angular.month)
                        } else {
                          snackBar.dismiss()
                          angular.snackBar.open('Houve um erro ao alterar.', '', {
                            duration: 3000
                          })
                          return false
                        }
                      })
                    })
                  } else {
                    snackBar.dismiss()
                    angular.changeMonth(angular.month)
                  }
                } else {
                  snackBar.dismiss()
                  angular.snackBar.open('Houve um erro ao alterar.', '', {
                    duration: 3000
                  })
                  return false
                }
              })
            })            
          })
        }
      })
    })
  }

  ngOnInit() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search,
      attendance: this.fb.control('')
    })

    this.date = new Date()
    this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1))
    this.changeMonth(this.month)
  }

  changeMonth(month: Month) {
    this.searching = true
    let snackBar = this.snackBar.open('Carregando briefings...')
    this.month = month
    let iniDateWithoutLimits = new Date(this.date.getUTCFullYear() + '-' + (month.id) + '-01')
    let finDateWithoutLimits = new Date(this.date.getUTCFullYear() + '-' + (month.id) + '-31')
    iniDateWithoutLimits.setDate(iniDateWithoutLimits.getDate() - 10)
    finDateWithoutLimits.setDate(finDateWithoutLimits.getDate() + 10)
    let iniDate = iniDateWithoutLimits.getUTCFullYear() + '-' + (iniDateWithoutLimits.getMonth() + 1) + '-' + iniDateWithoutLimits.getDate()
    let finDate = finDateWithoutLimits.getUTCFullYear() + '-' + (finDateWithoutLimits.getMonth() + 1) + '-' + finDateWithoutLimits.getDate()

    let date = new Date()
    if (month.id == date.getMonth() + 1) {
      this.scrollActivate = true
    } else {
      this.scrollActivate = false
    }

    this.briefingService.briefings({
      iniDate: iniDate,
      finDate: finDate,
      paginate: false
    }).subscribe(pagination => {
      this.pagination = pagination
      this.searching = false
      this.briefings = pagination.data
      this.chronologicDisplay(this.date.getUTCFullYear() + '-' + (month.id) + '-01')
      this.setUpdatedMessage()
      snackBar.dismiss()
    })
  }

  setUpdatedMessage() {
    if (this.briefings.length == 0) {
      this.updatedMessage = 'Sem atualizações'
      return
    }

    let sortedBriefings = this.briefings.sort((a, b) => {
      if (a.updated_at > b.updated_at) {
        return 1
      } else if (a.updated_at < b.updated_at) {
        return -1
      } else {
        return 0
      }
    })

    let formatedDate = ''
    let briefing = sortedBriefings[sortedBriefings.length - 1]
    let date = new Date(briefing.updated_at)

    if (date.getDate() < 10) {
      formatedDate += '0' + date.getDate() + '/'
    } else {
      formatedDate += date.getDate() + '/'
    }

    if ((date.getUTCMonth() + 1) < 10) {
      formatedDate += '0' + (date.getUTCMonth() + 1) + '/'
    } else {
      formatedDate += (date.getUTCMonth() + 1) + '/'
    }

    formatedDate += date.getFullYear()
    formatedDate += ' às '

    if (date.getHours() < 10) {
      formatedDate += '0' + date.getHours() + ':'
    } else {
      formatedDate += date.getHours() + ':'
    }

    if (date.getMinutes() < 10) {
      formatedDate += '0' + date.getMinutes()
    } else {
      formatedDate += date.getMinutes()
    }

    this.updatedMessage = 'Última atualização ' + formatedDate + ' por ' + briefing.attendance.name
  }

  jobDisplay(briefing: Briefing, chrono: Chrono) {
    if(briefing.id == null) {
      return ''
    }

    let date = new Date(Date.parse(briefing.available_date + 'T00:00:00'))
  
    if(date.getDate() != chrono.day) {
      return 'Continuação'
    } 

    return briefing.job.description
  }

  chronologicDisplay(iniDate) {
    let i: number = 0
    let date: Date = new Date(iniDate)
    let thisMonth: number = date.getMonth()
    let days: number[]
    date.setDate(1)

    while (date.getMonth() == thisMonth) {
      if (date.getDay() > 0 && date.getDay() < 6) {
        let briefings = this.briefings.filter((briefing) => {
          let briefingDate = new Date(Date.parse(briefing.available_date + 'T00:00:00'))
          let lastDate = new Date(Date.parse(briefing.available_date + 'T00:00:00'))

          for (let i = 0; i < Math.ceil(briefing.estimated_time - 1); i++) {
            lastDate.setDate(lastDate.getDate() + 1)
            while (lastDate.getDay() == 0 || lastDate.getDay() == 6) {
              lastDate.setDate(lastDate.getDate() + 1)
            }
          }

          return briefingDate <= date && lastDate >= date
        })

        if (briefings.length < 6) {
          let length = briefings.length
          for (let y = 0; y < (5 - length); y++) {
            let briefing = new Briefing()
            briefing.available_date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
            briefings.push(briefing)
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
    let date = new Date()
    let dayString: string
    const elementBodyTable = document.querySelectorAll('.mat-row-scroll')[0] as HTMLElement;

    if(this.month.id == date.getMonth() + 1) {
      dayString = '.day-' + this.date.getDate()
      const elementList = document.querySelectorAll(dayString);

      if (elementList.length > 0) {
        const element = elementList[0] as HTMLElement;
        elementBodyTable.scrollTo(0, element.offsetTop - 45)
      } 
    } else {
      elementBodyTable.scrollTo(0, 0)
    }
  }

  addBriefing(day: number) {
    let month = this.date.getMonth() + 1
    let tempMonth = month.toString()
    let tempDay = day.toString()

    if (month < 10) {
      tempMonth = '0' + month
    }

    if (day < 10) {
      tempDay = '0' + day
    }

    this.router.navigate(['/briefings/new', this.date.getUTCFullYear() + '-' + tempMonth + '-' + tempDay])
  }

  price(price: number) {
    if (price == 0) {
      return '0,00'
    }

    let formatedPrice: string = price.toString().replace('.', ',')

    for (let i = (price.toString().length - 4); i >= 0; i--) {
      if (i != 6 && ((i - 3) % 3 == 0) && formatedPrice.charAt(i - 1) != '') {
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

      if (data.status) {
        this.briefings.splice(this.briefings.indexOf(briefing), 1)
        this.pagination.total = this.pagination.total - 1
      }
    })
  }

}

export class Chrono {
  day: number
  dayOfWeek: DayOfWeek
  briefings: Briefing[]
}
