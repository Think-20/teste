import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertService } from 'app/alerts/alerts.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Projects } from 'app/alerts/alerts.model';

@Component({
  selector: 'app-alerts-container',
  templateUrl: './alerts-container.component.html',
  styleUrls: ['./alerts-container.component.css']
})
export class AlertsContainerComponent implements OnInit {

    projects: Projects;
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
      dataInfo ? this.projects = dataInfo.update_pendency : this.projects = { count: 0, data: []};
      snackBar.dismiss();
    })
  }
}
