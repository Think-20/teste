import { AuthService } from 'app/login/auth.service';
import { CheckInNotificationService } from "./../../../shared/services/check-in-notification.service";
import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ProjectStatus, Projects } from "app/alerts/alerts.model";
import { Router } from "@angular/router";
import { MatDialogRef } from "@angular/material";

@Component({
  selector: "app-alerts-check-in",
  templateUrl: "./alerts-check-in.component.html",
  styleUrls: ["./alerts-check-in.component.css"],
})
export class AlertsCheckInComponent implements OnInit {
  projects: Projects;
  statusProjects: ProjectStatus[] = [];

  atendimento = false;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    public dialog: MatDialogRef<AlertsCheckInComponent>,
    private checkInNotificationService: CheckInNotificationService
  ) {
    this.atendimento = this.authService.currentUser().employee.department_id === 4
  }

  ngOnInit() {
    this.load();
  }

  load(): void {
    const snackBar = this.snackBar.open("Carregando tarefas...");

    this.checkInNotificationService.get().subscribe((dataInfo) => {
      dataInfo
        ? (this.projects = dataInfo.update_pendency)
        : (this.projects = { count: 0, data: [] });

      if (dataInfo.update_pendency.count === 0) {
        return setTimeout(() => {
          this.router.navigate(["/home"]);
        }, 2000);
      }

      snackBar.dismiss();
    });
  }

  navigateToCheckIn(id: number) {
    this.router.navigate(['/jobs/edit', id], { queryParams: { tab: 'check-in' } });

    this.dialog.close();
  }
}
