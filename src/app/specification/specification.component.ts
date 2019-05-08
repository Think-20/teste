import { Component, OnInit, Input } from '@angular/core';
import { Job } from '../jobs/job.model';
import { TaskService } from '../schedule/task.service';
import { Task } from '../schedule/task.model';
import { ActivatedRoute } from '@angular/router';
import { SpecificationFileService } from './specification-file.service';
import { StringHelper } from 'app/shared/string-helper.model';

@Component({
  selector: 'cb-specification',
  templateUrl: './specification.component.html',
  styleUrls: ['./specification.component.css']
})
export class SpecificationComponent implements OnInit {

  @Input() job: Job
  sortedTasks: Task[]
  expandedIndex: number = null

  constructor(
    private route: ActivatedRoute,
    private specificationFileService: SpecificationFileService,
    private taskService: TaskService
  ) { }

  ngOnInit() {
    this.sortTasks()
    this.loadTaskFromRoute()
  }

  ngOnChanges() {
    this.sortTasks()
    this.loadTaskFromRoute()
  }

  description(task: Task) {
    let text = ''

    if(task.specification_files.length == 0) return text

    if(task.job_activity.description == 'Projeto')
      text = '- Memorial descritivo'
    else if(task.reopened > 0) {
      text = '- Memorial ' + StringHelper.padChar(task.reopened)
    }

    return text
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
      return ['Continuação', 'Detalhamento', 'Memorial descritivo'].indexOf(task.job_activity.description) == -1
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



}
