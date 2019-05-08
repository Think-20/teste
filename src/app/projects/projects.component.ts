import { Component, OnInit, Input } from '@angular/core';
import { Job } from '../jobs/job.model';
import { TaskService } from '../schedule/task.service';
import { Task } from '../schedule/task.model';
import { ActivatedRoute } from '@angular/router';
import { ProjectFileService } from './project-file.service';
import { API } from 'app/app.api';

@Component({
  selector: 'cb-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  @Input() job: Job
  sortedTasks: Task[]
  expandedIndex: number = null

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private projectFileService: ProjectFileService
  ) { }

  ngOnInit() {
    this.sortTasks()
    this.loadTaskFromRoute()
  }

  ngOnChanges() {
    this.sortTasks()
    this.loadTaskFromRoute()
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
