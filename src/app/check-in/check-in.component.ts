import { Component, Input, OnInit } from '@angular/core';
import { Job } from 'app/jobs/job.model';

@Component({
  selector: 'cb-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.css']
})
export class CheckInComponent implements OnInit {

  @Input() job: Job;

  constructor() { }

  ngOnInit() {
  }

}
