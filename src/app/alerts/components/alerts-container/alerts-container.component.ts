import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertService } from 'app/alerts/alerts.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-alerts-container',
  templateUrl: './alerts-container.component.html',
  styleUrls: ['./alerts-container.component.css']
})
export class AlertsContainerComponent implements OnInit {

    item: any;

  constructor(
        private alertService: AlertService,
        private datePipe: DatePipe,
        private snackBar: MatSnackBar,
    ) { }

  ngOnInit() {
    this.load();
  }

  load() {
    const snackBar = this.snackBar.open('Carregando tarefas...')

    this.alertService.getAlerts().subscribe(dataInfo => {
      dataInfo ? this.item = dataInfo : this.item = []
      console.log(dataInfo)
      snackBar.dismiss()
    })
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
