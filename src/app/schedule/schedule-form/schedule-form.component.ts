import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { JobActivity } from 'app/job-activities/job-activity.model';
import { JobService } from 'app/jobs/job.service';
import { BriefingService } from 'app/briefings/briefing.service';
import { BudgetService } from 'app/budgets/budget.service';

@Component({
  selector: 'cb-schedule-form',
  templateUrl: './schedule-form.component.html',
  styleUrls: ['./schedule-form.component.css']
})
export class ScheduleFormComponent implements OnInit {

  hasPreviousActivity: boolean = false
  scheduleForm: FormGroup
  job_activities: JobActivity[]
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
      available_date: this.formBuilder.control('', [Validators.required]),
      deadline: this.formBuilder.control('', [Validators.required]),
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
      if(this.scheduleForm.controls.job_activity.status != 'VALID'
      || this.scheduleForm.controls.duration.status != 'VALID')
      {
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
        this.scheduleForm.controls.available_date.setValue(null)
        this.nextDateMessage = 'Funcionalidade para esse tipo de atividade ainda não desenvolvida.'
      }
    }
  }

  calculateNextDateProject() {
    let now = new Date()
    let dateString = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()
    let estimatedTime = this.scheduleForm.controls.duration.value
    this.nextDateMessage = 'Aguarde...'
    this.briefingService.getNextAvailableDate(dateString, estimatedTime).subscribe((data) => {
      this.scheduleForm.controls.available_date.setValue(data.available_date)
      this.nextDateMessage = 'Lembre-se, você pode mover as suas agendas.'
    })
  }

  calculateNextDateBudget() {
    let now = new Date()
    let dateString = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()
    let estimatedTime = this.scheduleForm.controls.duration.value
    this.nextDateMessage = 'Aguarde...'
    this.budgetService.getNextAvailableDate(dateString, estimatedTime).subscribe((data) => {
      this.scheduleForm.controls.available_date.setValue(data.available_date)
      this.nextDateMessage = 'Lembre-se, você pode mover as suas agendas.'
    })
  }

}
