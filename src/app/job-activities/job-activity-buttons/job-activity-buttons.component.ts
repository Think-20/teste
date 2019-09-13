import { Component, OnInit, Input } from '@angular/core';
import { JobActivity } from '../job-activity.model';

@Component({
  selector: 'cb-job-activity-buttons',
  templateUrl: './job-activity-buttons.component.html',
  styleUrls: ['./job-activity-buttons.component.css']
})
export class JobActivityButtonsComponent implements OnInit {

  @Input() jobActivity: JobActivity;

  constructor() { }

  ngOnInit() {
  }

}
