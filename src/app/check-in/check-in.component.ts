import { Component, Input, OnInit } from '@angular/core';
import { Job } from 'app/jobs/job.model';
import { CheckInService } from './check-in.service';
import { CheckInModel } from './check-in.model';

@Component({
  selector: 'cb-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.css']
})
export class CheckInComponent implements OnInit {

  @Input() job: Job = new Job();

  checkInModel: CheckInModel = new CheckInModel();

  constructor(
    private checkInService: CheckInService,
  ) { }

  ngOnInit() {
    this.getCheckInModel();
  }

  private getCheckInModel(): void {
    this.checkInService.get(this.job.id).subscribe({
      next: response => {
        this.checkInModel = response;
      }
    });
  }

}
