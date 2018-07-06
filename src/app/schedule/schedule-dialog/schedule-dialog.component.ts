import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { JobActivity } from 'app/job-activities/job-activity.model';
import { JobService } from 'app/jobs/job.service';
import { BriefingService } from 'app/briefings/briefing.service';
import { BudgetService } from 'app/budgets/budget.service';

@Component({
  selector: 'cb-schedule-dialog',
  templateUrl: './schedule-dialog.component.html',
  styleUrls: ['./schedule-dialog.component.css']
})
export class ScheduleDialogComponent implements OnInit {

  hasPreviousActivity: boolean = false
  scheduleForm: FormGroup
  job_activities: JobActivity[]
  date: string
  nextDateMessage: string = ''
  url = ['/jobs/new', '']

  constructor(
    private formBuilder: FormBuilder,
    private jobService: JobService,
    private briefingService: BriefingService,
    private budgetService: BudgetService
  ) { }

  ngOnInit() {
    this.createForm()
    this.createJobActivities()
    this.addListenerInJobActivity()
    this.addListenerInForm()
  }

  createForm() {
    this.scheduleForm = this.formBuilder.group({
      job_activity: this.formBuilder.control('', [Validators.required]),
      duration: this.formBuilder.control('', [Validators.required]),
      job: this.formBuilder.control('')
    })
  }

  createJobActivities() {
    this.job_activities = []
    this.job_activities.push({id: 1, description: 'Projeto'})
    this.job_activities.push({id: 2, description: 'Orçamento'})
    this.job_activities.push({id: 3, description: 'Modificação'})
    this.job_activities.push({id: 4, description: 'Detalhamento'})
    this.job_activities.push({id: 5, description: 'Outsider'})
    this.job_activities.push({id: 6, description: 'Opção'})
  }

  addListenerInJobActivity() {
    this.scheduleForm.controls.job_activity.valueChanges.subscribe(job_activity => {
      let jobActivity = job_activity as JobActivity
      if(jobActivity.description == 'Projeto' || jobActivity.description == 'Orçamento') {
        this.hasPreviousActivity = false
        return
      }
      this.hasPreviousActivity = true
    })
  }

  addListenerInForm() {
    this.scheduleForm.statusChanges.subscribe(status => {
      if(status != 'VALID') {
        return
      }

      this.calculateNextDate()
    })
  }

  calculateNextDate() {
    let jobActivity = this.scheduleForm.controls.job_activity
      ? this.scheduleForm.controls.job_activity.value
      : new JobActivity()

    switch(jobActivity.description) {
      case 'Projeto' : {
        this.calculateNextDateProject()
        break
      }
      case 'Orçamento' : {
        this.calculateNextDateBudget()
        break
      }
      default : {
        this.date = null
        this.nextDateMessage = 'Funcionalidade para esse tipo de atividade ainda não desenvolvida.'
      }
    }
  }

  calculateNextDateProject() {
    this.nextDateMessage = 'Aguarde...'
    this.briefingService.recalculateNextDate(this.scheduleForm.controls.duration.value).subscribe((response) => {
      let data = response.data
      this.date = response.data.available_date      
      this.nextDateMessage = 'Lembre-se, você pode mover as suas agendas.'
    })
  }

  calculateNextDateBudget() {
    this.nextDateMessage = 'Aguarde...'
    this.briefingService.loadFormData().subscribe((response) => {
      let data = response.data
      this.date = response.data.available_date      
      this.nextDateMessage = 'Lembre-se, você pode mover as suas agendas.'
    })
  }

}
