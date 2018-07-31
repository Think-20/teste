import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar, MatCalendarHeader, MatDatepicker } from '@angular/material';
import { JobActivity } from 'app/job-activities/job-activity.model';
import { JobService } from 'app/jobs/job.service';
import { BriefingService } from 'app/briefings/briefing.service';
import { BudgetService } from 'app/budgets/budget.service';
import { ErrorHandler } from 'app/shared/error-handler.service';
import { Task } from '../task.model';
import { TaskService } from '../task.service';
import { Job } from '../../jobs/job.model';
import { Employee } from '../../employees/employee.model';
import { JobActivityService } from '../../job-activities/job-activity.service';
import { AuthService } from '../../login/auth.service';


@Component({
  selector: 'cb-schedule-form',
  templateUrl: './schedule-form.component.html',
  styleUrls: ['./schedule-form.component.css'],
  animations: [
    trigger('rowAppeared', [
      state('ready', style({opacity: 1})),
      transition('void => ready', animate('300ms 0s ease-in', keyframes([
        style({opacity: 0, transform: 'translateX(-30px)', offset: 0}),
        style({opacity: 0.8, transform: 'translateX(10px)', offset: 0.8}),
        style({opacity: 1, transform: 'translateX(0px)', offset: 1})
      ]))),
      transition('ready => void', animate('300ms 0s ease-out', keyframes([
        style({opacity: 1, transform: 'translateX(0px)', offset: 0}),
        style({opacity: 0.8, transform: 'translateX(-10px)', offset: 0.2}),
        style({opacity: 0, transform: 'translateX(30px)', offset: 1})
      ])))
    ])
  ]
})
export class ScheduleFormComponent implements OnInit {

  hasPreviousActivity: boolean = false
  scheduleForm: FormGroup
  job_activities: JobActivity[]
  jobs: Job[]
  dateSetManually: boolean = false
  isAdmin: boolean = false
  responsibles: Employee[]
  availableDates: any = []
  nextDateMessage: string = ''
  url: string = '/jobs/new'
  buttonText: string = 'PRÓXIMO'
  budgetValueMessage: string
  @ViewChild('responsible') responsibleSelect
  @ViewChild('availableDatepicker') availableDatepicker: MatDatepicker<Date>

  constructor(
    private formBuilder: FormBuilder,
    private jobService: JobService,
    private jobActivityService: JobActivityService,
    private taskService: TaskService,
    private briefingService: BriefingService,
    private budgetService: BudgetService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.isAdmin = this.authService.hasAccess('task/save')
    this.createForm()
    this.recoveryParams()
    this.createJobActivities()
    this.addListenerInJobActivity()
    this.addListenerForAvailableDate()
    this.addValidationBudget()
  }

  changeMonth(date: Date) {
    this.getAvailableDates(date)
  }

  getAvailableDates(date: Date) {
    this.availableDatepicker.close()
    let snack = this.snackBar.open('Aguarde enquanto carregamos as datas disponíveis')
    this.taskService.getAvailableDates({
      iniDate: date.getFullYear() + '-' + (date.getMonth() + 1) + '-01',
      finDate: date.getFullYear() + '-' + (date.getMonth() + 1) + '-31',
      job_activity: this.scheduleForm.controls.job_activity.value,
      duration: this.scheduleForm.controls.duration.value
    }).subscribe(dates => {
      this.availableDates = dates
      snack.dismiss()
      this.availableDatepicker.open()
      let date = new Date(this.availableDates[0]['date']['date'])
      this.scheduleForm.controls.available_date.setValue(date.toISOString())
    })
  }

  filterAvailableDates = (calendarDate: Date): boolean => {
    let response: boolean = false

    this.availableDates.forEach(date => {
      let myDate = new Date(date.date.date)

      if(myDate.getFullYear() == calendarDate.getFullYear()
      && myDate.getMonth() == calendarDate.getMonth()
      && myDate.getDate() == calendarDate.getDate()) {
        response = true
      }

    });

    return response
  }

  recoveryParams() {
    if( ! this.isAdmin ) {
      return
    }

    this.route.queryParams.filter(params => params.date).subscribe(params => {
      if(params.date == null) {
        return
      }

      this.scheduleForm.controls.available_date.setValue(params.date)
      this.dateSetManually = true
    })
  }

  toggleResponsible() {
    ! this.isAdmin ? this.responsibleSelect.close() : null
  }

  createForm() {
    this.scheduleForm = this.formBuilder.group({
      job_activity: this.formBuilder.control('', [Validators.required]),
      duration: this.formBuilder.control('', [Validators.required]),
      available_date: this.formBuilder.control('', [Validators.required]),
      deadline: this.formBuilder.control('', [Validators.required]),
      budget_value: this.formBuilder.control('', [Validators.required]),
      responsible: this.formBuilder.control('', [Validators.required]),
      job: this.formBuilder.control('')
    })
  }

  createJobActivities() {
    this.jobActivityService.jobActivities().subscribe(jobActivities => {
      this.job_activities = jobActivities
    })
  }

  setJob(job: Job) {
    this.scheduleForm.controls.job.setValue(job)
  }

  addListenerInJobActivity() {
    this.scheduleForm.controls.job_activity.valueChanges.subscribe(job_activity => {
      let jobActivity = job_activity as JobActivity
      if (jobActivity.description == 'Projeto'
      || jobActivity.description == 'Orçamento'
      || jobActivity.description == 'Outsider') {
        this.setJob(null)
        this.buttonText = 'PRÓXIMO'
        this.hasPreviousActivity = false
        return
      }
      this.jobService.jobs().subscribe(data => {
        this.jobs = data.data
      })
      this.buttonText = 'AGENDAR'
      this.hasPreviousActivity = true
    })
  }

  addValidationBudget() {
    let days = this.scheduleForm.controls.duration.value
    let validators: ValidatorFn[] = []
    validators.push(Validators.required)

    if(days <= 1) {
      validators.push(Validators.min(0))
      validators.push(Validators.max(70000))
      this.budgetValueMessage = 'O valor deve estar entre 0,00 e 70.000,00 para até 1 dia'
    } else if(days <= 2) {
      validators.push(Validators.min(70000.01))
      validators.push(Validators.max(150000))
      this.budgetValueMessage = 'O valor deve estar entre 70.000,00 e 150.000,00 para até 2 dias'
    } else if(days <= 3) {
      validators.push(Validators.min(150000.01))
      validators.push(Validators.max(240000))
      this.budgetValueMessage = 'O valor deve estar entre 150.000,00 e 240.000,00 para até 3 dias'
    } else if(days <= 4) {
      validators.push(Validators.min(240000.01))
      validators.push(Validators.max(340000))
      this.budgetValueMessage = 'O valor deve estar entre 240.000,00 e 340.000,00 para até 4 dias'
    } else if(days <= 5) {
      validators.push(Validators.min(340000.01))
      validators.push(Validators.max(450000))
      this.budgetValueMessage = 'O valor deve estar entre 340.000,00 e 450.000,00 para até 5 dias'
    } else if(days > 5) {
      validators.push(Validators.min(450000.01))
      this.budgetValueMessage = 'O valor deve ser maior que 450.000,00 para mais de 5 dias'
    }

    this.scheduleForm.controls.budget_value.setValidators(validators)
  }

  addListenerForAvailableDate() {
    this.scheduleForm.controls.job_activity.valueChanges.subscribe(status => {
      this.calculateNextDate()
    })
    this.scheduleForm.controls.duration.valueChanges.subscribe(status => {
      this.addValidationBudget()
      this.calculateNextDate()
    })
  }

  calculateNextDate() {
    let controls = this.scheduleForm.controls
    if (controls.job_activity.status != 'VALID' || controls.duration.status != 'VALID') {
      return
    }

    let now = new Date()
    let dateString = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()
    let estimatedTime = this.scheduleForm.controls.duration.value
    let jobActivity = this.scheduleForm.controls.job_activity.value
    this.nextDateMessage = 'Aguarde...'
    this.taskService.getNextAvailableDate(dateString, estimatedTime, jobActivity).subscribe((data) => {
      this.responsibles = data.responsibles
      this.scheduleForm.controls.responsible.setValue(data.responsible)

      if( ! this.dateSetManually) {
        let date = new Date(data.available_date + "T00:00:00")
        this.getAvailableDates(date)
      }
      this.nextDateMessage = 'Lembre-se, você pode mover as suas agendas para liberar a data.'
    })
  }

  toggleCreation() {
    this.responsibleSelect.close()
  }

  compareResponsible(var1: Employee, var2: Employee) {
    return var1.id === var2.id
  }

  compareJobActivity(job1: JobActivity, job2: JobActivity) {
    return job1.id === job2.id
  }

  go() {
    if (ErrorHandler.formIsInvalid(this.scheduleForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    let task = this.scheduleForm.value as Task

    if (task.job_activity.description == 'Projeto'
    || task.job_activity.description == 'Orçamento'
    || task.job_activity.description == 'Outsider') {
      this.jobService.data = new Job
      this.jobService.data.task = task
      this.jobService.data.budget_value = this.scheduleForm.controls.budget_value.value
      this.jobService.data.deadline = this.scheduleForm.controls.deadline.value
      this.jobService.data.job_activity = task.job_activity
      this.url = '/jobs/new'
      this.router.navigateByUrl(this.url)
    } else {
      this.url = '/schedule'
      this.taskService.save(task).subscribe(data => {
        if (data.status) {
          let snack = this.snackBar.open('Salvo com sucesso, redirecionando para o cronograma.', '', {
            duration: 3000
          })
          snack.afterDismissed().subscribe(() => {
            this.router.navigateByUrl(this.url)
          })
        } else {
          this.snackBar.open(data.message, '', {
            duration: 5000
          })
        }
      })
    }
  }

}
