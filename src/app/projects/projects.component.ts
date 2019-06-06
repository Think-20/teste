import { Component, OnInit, Input } from '@angular/core';
import { Job } from '../jobs/job.model';
import { TaskService } from '../schedule/task.service';
import { Task } from '../schedule/task.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectFileService } from './project-file.service';
import { API } from 'app/app.api';
import { EmployeeService } from 'app/employees/employee.service';
import { AuthService } from 'app/login/auth.service';
import { MatSnackBar } from '@angular/material';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'cb-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  @Input() job: Job
  actionText: string
  actionUrl: string
  sortedTasks: Task[]
  isAttendance: boolean = null
  expandedIndex: number = null

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar,
    private datePipe: DatePipe,
    private authService: AuthService,
    private taskService: TaskService,
    private employeeService: EmployeeService,
    private projectFileService: ProjectFileService
  ) { }

  ngOnInit() {
    this.sortTasks()
    this.loadTaskFromRoute()

    let snack = this.snack.open('Carregando botões...')
    this.employeeService.canInsertClients().subscribe(employees => {
      snack.dismiss()
      this.isAttendance = false

      employees.forEach(element => {
        if(element.id === this.authService.currentUser().employee_id)
        {
          this.isAttendance = true
        }
      });
    })
  }

  ngOnChanges() {
    this.sortTasks()
    this.loadTaskFromRoute()
  }

  getText() {
    return this.isAttendance ? 'PRÓXIMO' : 'IR PARA AGENDA'
  }

  getRoute(task: Task) {
    return this.isAttendance ? `/jobs/edit/${this.job.id}?tab=specification`
      : '/schedule?date=' + this.datePipe.transform(task.available_date, 'yyyy-MM-dd')
  }

  navigateTo(url) {
    return this.router.navigateByUrl(url)
  }

  showButtonSpecification(task: Task) {
    if(task.project_files.length == 0
    || task.specification_files.length > 0)
      return false

    return true
  }

  loadTaskFromRoute() {
    this.route.queryParams.subscribe((params) => {
      let taskId = params['taskId']
      this.sortedTasks.forEach((task, index) => {
        if(task.id == taskId) {
          this.expandedIndex = index
        }
      })
    })
  }

  sortTasks() {
    this.sortedTasks = this.job.tasks.filter((task) => {
      return ['Continuação', 'Detalhamento', 'Memorial descritivo', 'Orçamento'].indexOf(task.job_activity.description) == -1
    })
    this.sortedTasks = this.sortedTasks.sort((a, b) => {
      return a.available_date < b.available_date ? 1 : -1
    })
    this.sortedTasks.forEach((task, index) => {
      if(task.project_files.length > 0 && this.expandedIndex == null) {
        this.expandedIndex = index
      }
    })
  }

  downloadAll() {
    let url = this.projectFileService.downloadAllUrl(this.job.task)
    window.open(`${API}/${url}`, '_blank')
  }

}
