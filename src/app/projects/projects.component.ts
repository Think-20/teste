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

  constructor(
    private taskService: TaskService
  ) { }

  ngOnInit() {
    this.sortedTasks = this.job.tasks
    this.sortedTasks = this.sortedTasks.sort((a, b) => {
      return a.available_date < b.available_date ? 1 : -1
    })
  }

}
