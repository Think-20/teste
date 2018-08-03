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
import { DatePipe } from '@angular/common';
import { JobStatusService } from '../../job-status/job-status.service';
import { JobStatus } from '../../job-status/job-status.model';


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
  job_status: JobStatus[]
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
    private jobStatusService: JobStatusService,
    private taskService: TaskService,
    private briefingService: BriefingService,
    private budgetService: BudgetService,
    private authService: AuthService,
    private router: Router,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.isAdmin = this.authService.hasAccess('task/save')
    this.createForm()
    this.recoveryParams()
    this.loadJobStatus()
    this.loadJobActivities()
    this.addEvents()
  }

  addEvents() {
    this.scheduleForm.controls.job_activity.valueChanges.subscribe(status => {
      let jobActivity = this.scheduleForm.controls.job_activity.value as JobActivity
      this.calculateNextDate()
      this.setButtons()

      if(jobActivity.description == 'Modificação')
        this.addModificationEvents()
      else if(jobActivity.description == 'Orçamento')
        this.addBudgetEvents()
      else if(jobActivity.description == 'Detalhamento')
        this.addDetailingEvents()
      else this.addOtherEvents()
    })
    this.scheduleForm.controls.duration.valueChanges.subscribe(status => {
      this.addValidationBudget()
      this.calculateNextDate()
    })
    this.addValidationBudget()
  }

  changeMonth(date: Date) {
    this.getAvailableDates(date, true)
  }

  addModificationEvents() {
    this.scheduleForm.controls.responsible.disable()
    this.scheduleForm.controls.budget_value.disable()
    this.nextDateMessage = 'Escolha primeiro o job, para verificarmos o responsável e a data disponível.'

    let types = ['Projeto', 'Modificação', 'Outsider', 'Opção']
    this.jobService.jobs({
      job_activities: this.job_activities.filter(jobActivity => {
        return types.indexOf(jobActivity.description) > -1
      }).map(jobActivity => {
        return jobActivity.id
      })
    }).subscribe(data => {
      this.jobs = data.data
    })

    this.scheduleForm.controls.job.valueChanges.subscribe(job => {
      let responsible
      this.nextDateMessage = ''
      this.scheduleForm.controls.responsible.setValue('')
      this.scheduleForm.controls.available_date.setValue('')
      this.scheduleForm.controls.budget_value.setValue(job.budget_value)
      this.responsibles = [job.creation_responsible]
      this.scheduleForm.controls.responsible.setValue(job.creation_responsible)
      this.getAvailableDates(new Date(), false, this.responsibles[0])
    })
  }

  addBudgetEvents() {
    this.scheduleForm.controls.responsible.enable()
    this.scheduleForm.controls.budget_value.disable()
  }

  addDetailingEvents() {
    this.scheduleForm.controls.responsible.enable()
    this.scheduleForm.controls.budget_value.enable()

    let types = ['Projeto', 'Modificação', 'Outsider', 'Opção']
    this.jobService.jobs({
      status: this.job_status.find(jobStatus => { return jobStatus.description == 'Aprovado' }).id
    }).subscribe(data => {
      this.jobs = <Job[]> data.data
      let jobActivity = this.job_activities.find(jobActivity => {
        return jobActivity.description == 'Detalhamento'
      })
      this.jobs = this.jobs.filter(job => {
        let detailed = false
        job.tasks.forEach(task => {
          if(task.job_activity.id == jobActivity.id) {
            detailed = true
          }
        })
        return ! detailed
      })
    })
  }

  addOtherEvents() {
    this.scheduleForm.controls.responsible.enable()
    this.scheduleForm.controls.budget_value.enable()
    this.jobService.jobs().subscribe(data => {
      this.jobs = data.data
    })
  }

  getAvailableDates(date: Date, open: boolean = false, onlyEmployee: Employee = null) {
    this.availableDatepicker.close()
    let snack = this.snackBar.open('Aguarde enquanto carregamos as datas disponíveis')
    this.taskService.getAvailableDates({
      iniDate: date.getFullYear() + '-' + (date.getMonth() + 1) + '-01',
      finDate: date.getFullYear() + '-' + (date.getMonth() + 1) + '-31',
      job_activity: this.scheduleForm.controls.job_activity.value,
      duration: this.scheduleForm.controls.duration.value,
      only_employee: onlyEmployee
    }).subscribe(dates => {
      this.availableDates = dates
      snack.dismiss()

      if(open)
        this.availableDatepicker.open()

      let date = new Date(this.availableDates[0]['date']['date'])
      this.scheduleForm.controls.available_date.setValue(date.toISOString())
    })
  }

  filterAvailableDates = (calendarDate: Date): boolean => {
    let response: boolean = false

    if( this.isAdmin ) {
      return true
    }

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

      this.availableDates = [{date: {date: params.date + "T00:00:00"}}]
      this.scheduleForm.controls.available_date.setValue(params.date + "T00:00:00")
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

  loadJobActivities() {
    this.jobActivityService.jobActivities().subscribe(jobActivities => {
      this.job_activities = jobActivities
    })
  }

  loadJobStatus() {
    this.jobStatusService.jobStatus().subscribe(jobStatus => {
      this.job_status = jobStatus
    })
  }

  setJob(job: Job) {
    this.scheduleForm.controls.job.setValue(job)
  }

  setButtons() {
      let jobActivity = this.scheduleForm.controls.job_activity.value as JobActivity
      if (jobActivity.description == 'Projeto'
      || jobActivity.description == 'Orçamento'
      || jobActivity.description == 'Outsider') {
        this.setJob(null)
        this.buttonText = 'PRÓXIMO'
        this.hasPreviousActivity = false
        return
      }

      this.buttonText = 'AGENDAR'
      this.hasPreviousActivity = true
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
    this.scheduleForm.controls.budget_value.updateValueAndValidity()
  }

  calculateNextDate() {
    let controls = this.scheduleForm.controls
    if (controls.job_activity.status != 'VALID'
    || controls.duration.status != 'VALID'
    || controls.job_activity.value.description == 'Modificação') {
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

    let task = this.scheduleForm.getRawValue() as Task

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
            this.router.navigate([this.url], {
              queryParams: {
                date: this.datePipe.transform(task.available_date, 'yyyy-MM-dd')
              }
            })
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
