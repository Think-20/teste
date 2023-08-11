import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertService } from 'app/alerts/alerts.service';

@Component({
  selector: 'app-alerts-container',
  templateUrl: './alerts-container.component.html',
  styleUrls: ['./alerts-container.component.css']
})
export class AlertsContainerComponent implements OnInit {

    item: any;

  constructor(
        private alertService: AlertService,
        private datePipe: DatePipe
    ) { }

  ngOnInit() {
    
  }

  timeIconDisplay(): string {
    if(this.item.task.job.id == null) {
      return ''
    }

    if(this.item.task.done == 1) {
      return 'done'
    } else {
      let lastItem = this.item.task.items[(this.item.task.items.length - 1)]
      let finalDate = new Date(lastItem.date + 'T00:00:00')

      if(this.datePipe.transform(finalDate, 'yyyy-MM-dd') < this.datePipe.transform(new Date(), 'yyyy-MM-dd')) {
        return 'alarm'
      } else {
        return 'access_alarm'
      }
    }
  }
}
