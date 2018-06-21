import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Briefing } from 'app/briefings/briefing.model';
import { BriefingService } from 'app/briefings/briefing.service';
import { Job } from 'app/jobs/job.model';

@Component({
  selector: 'cb-briefing-select',
  templateUrl: './briefing-select.component.html',
  styleUrls: ['./briefing-select.component.css']
})
export class BriefingSelectComponent implements OnInit {

  briefings: Briefing[] = []
  searching: boolean = false

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<BriefingSelectComponent>,
    private briefingService: BriefingService
  ) { }

  ngOnInit() {
    let params = { status: null, paginate: false }
    let job = this.data.job as Job

    if(job.description == 'Orçamento') {
      params.status = 3;
    }

    this.searching = true
    this.briefingService.briefings(params).subscribe((response) => {
      this.searching = false
      this.briefings = response.data
    })
  }

  selectLine(briefing: Briefing) {
    this.dialogRef.close(briefing);
  }
}
