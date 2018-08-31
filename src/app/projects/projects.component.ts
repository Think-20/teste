import { Component, OnInit, Input } from '@angular/core';
import { Job } from '../jobs/job.model';

@Component({
  selector: 'cb-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  @Input() job: Job

  constructor() { }

  ngOnInit() {
  }

}
