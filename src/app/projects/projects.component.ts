import { Component, OnInit, Input } from '@angular/core';
import { Job } from '../jobs/job.model';
import { TaskService } from '../schedule/task.service';
import { Task } from '../schedule/task.model';

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
    private taskService: TaskService
  ) { }

  ngOnInit() {
    this.sortedTasks = this.job.tasks.filter((task) => {
      return ['Continuação', 'Detalhamento'].indexOf(task.job_activity.description) == -1
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
