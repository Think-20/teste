import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Job } from '../job.model';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'cb-job-tabs',
  templateUrl: './job-tabs.component.html',
  styleUrls: ['./job-tabs.component.css']
})
export class JobTabsComponent implements OnInit {
  typeForm: string
  job: Job
  isAdmin: boolean
  selectedIndex: number = 0

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.typeForm = this.route.snapshot.url[0].path
    this.route.queryParams.subscribe((params) => {
      let next = params['tab']

      switch(next) {
        case 'briefing' :{
          this.selectedIndex = 1
          break
        }
        case 'budget' :{
          this.selectedIndex = 2
          break
        }
        default :{
          this.selectedIndex = 0
        }
      }
    })

  }

  setJob(job: Job) {
    this.job = job
  }

  setIsAdmin(isAdmin) {
    this.isAdmin = isAdmin
  }

}
