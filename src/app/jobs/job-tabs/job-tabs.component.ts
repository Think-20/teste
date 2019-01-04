import { Component, OnInit, Injectable, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Job } from '../job.model';
import { Observable } from 'rxjs/Observable';
import { JobService } from '../job.service';

@Component({
  selector: 'cb-job-tabs',
  templateUrl: './job-tabs.component.html',
  styleUrls: ['./job-tabs.component.css']
})
@Injectable()
export class JobTabsComponent implements OnInit {
  @ViewChild('container') container: ElementRef
  containerWidth: number
  typeForm: string
  job: Job
  isAdmin: boolean
  selectedIndex: number = 0

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
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
        case 'project' :{
          this.selectedIndex = 2
          break
        }
        case 'proposal' :{
          this.selectedIndex = 3
          break
        }
        default :{
          this.selectedIndex = 0
        }
      }
    })

    this.initContainerWidthObservable()
  }

  initContainerWidthObservable() {
    let target = document.querySelector('#containerJobTabs')
    this.containerWidth = target.clientWidth

    /* Melhorar com biblioteca Resize aceitável pelos navegadores */
    Observable.timer(2000, 2000).subscribe(() => {
      if(target.clientWidth == this.containerWidth)
       return

      this.containerWidth = target.clientWidth
      console.log('Atualizando....', this.containerWidth)
    })

    console.log('Iniciando....', this.containerWidth)
  }

  displayNameEvent(job: Job) {
    return this.jobService.displayNameEvent(job)
  }

  showId(job: Job) {
    return this.jobService.showId(job)
  }

  setJob(job: Job) {
    this.job = job
  }

  setIsAdmin(isAdmin) {
    this.isAdmin = isAdmin
  }

}
