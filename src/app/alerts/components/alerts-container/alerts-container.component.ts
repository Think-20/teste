import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertService } from 'app/alerts/alerts.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditStatus, ProjectData, ProjectStatus, Projects } from 'app/alerts/alerts.model';

@Component({
  selector: 'app-alerts-container',
  templateUrl: './alerts-container.component.html',
  styleUrls: ['./alerts-container.component.css']
})
export class AlertsContainerComponent implements OnInit {

    projects: Projects;
    statusProjects: ProjectStatus[] = [];

  constructor(
        private alertService: AlertService,
        private datePipe: DatePipe,
        private snackBar: MatSnackBar,
    ) { }

  ngOnInit() {
    this.loadStatus();
    this.load();
  }

  load(): void {
    const snackBar = this.snackBar.open('Carregando tarefas...')

    this.alertService.getAlerts().subscribe(dataInfo => {
      dataInfo ? this.projects = dataInfo.update_pendency : this.projects = { count: 0, data: []};
      snackBar.dismiss();
    })
  }

  loadStatus(): void {
    this.statusProjects = this.alertService.getStatus();
  }

  updateStatusProject(selectedStatus: ProjectStatus, selectedProject: ProjectData) {
    const payload: EditStatus = {
      id: selectedProject.id,
      status: {
        id: selectedStatus.id
      }
    }

    this.alertService.updateStatusProject(payload).subscribe(data => {
      this.snackBar.open(data.message, '', { duration: 4000 })
      this.load();
    });
  }
}
