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
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { Pagination } from '../../shared/pagination.model';
import { ClientService } from '../../clients/client.service';
import { Client } from '../../clients/client.model';
import { JobType } from '../../job-types/job-type.model';
import { JobTypeService } from '../../job-types/job-type.service';
import { EmployeeService } from '../../employees/employee.service';


@Component({
  selector: 'cb-schedule-form',
  templateUrl: './schedule-form.component.html',
  styleUrls: ['./schedule-form.component.css'],
  animations: [
    trigger('rowAppeared', [
      state('ready', style({ opacity: 1 })),
      transition('void => ready', animate('300ms 0s ease-in', keyframes([
        style({ opacity: 0, transform: 'translateX(-30px)', offset: 0 }),
        style({ opacity: 0.8, transform: 'translateX(10px)', offset: 0.8 }),
        style({ opacity: 1, transform: 'translateX(0px)', offset: 1 })
      ]))),
      transition('ready => void', animate('300ms 0s ease-out', keyframes([
        style({ opacity: 1, transform: 'translateX(0px)', offset: 0 }),
        style({ opacity: 0.8, transform: 'translateX(-10px)', offset: 0.2 }),
        style({ opacity: 0, transform: 'translateX(30px)', offset: 1 })
      ])))
    ])
  ]
})
export class ScheduleFormComponent implements OnInit {

  typeForm: string = 'new'
  hasPreviousActivity: boolean = false
  filter: boolean = false
  scheduleForm: FormGroup
  searchForm: FormGroup
  job_activities: JobActivity[]
  job_status: JobStatus[]
  jobs: Job[]
  dateSetManually: boolean = false
  params: () => {} = () => { return {} }
  callback: (jobs: Job[]) => void = (jobs) => {}
  isAdmin: boolean = false
  paramAttendance: Employee = null
  responsibles: Employee[] = []
  clients: Client[] = []
  availableDates: any = []
  job_types: JobType[] = []
  attendances: Employee[] = []
  creations: Employee[] = []
  nextDateMessage: string = ''
  url: string = '/jobs/new'
  buttonText: string = 'PRÓXIMO'
  budgetValueMessage: string
  subscriptions: Subscription[] = []
  @ViewChild('availableDatepicker') availableDatepicker: MatDatepicker<Date>
  buttonEnable: boolean = true

  constructor(
    private formBuilder: FormBuilder,
    private jobService: JobService,
    private jobActivityService: JobActivityService,
    private jobStatusService: JobStatusService,
    private taskService: TaskService,
    private briefingService: BriefingService,
    private employeeService: EmployeeService,
    private jobTypeService: JobTypeService,
    private clientService: ClientService,
    private budgetService: BudgetService,
    private authService: AuthService,
    private router: Router,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.typeForm = this.route.snapshot.url[1].path
    this.isAdmin = this.authService.hasAccess('task/save')

    this.createForm()
    this.loadJobStatus()
    this.loadJobActivities()
    this.loadFilterData()

    this.paramAttendance = this.authService.currentUser().employee.department.description === 'Atendimento'
    ? this.authService.currentUser().employee : null

    if (this.typeForm == 'edit') {
      this.loadTask()
    } else {
      this.recoveryParams()
      this.addEvents()
    }
  }

  loadFilterData() {
    this.jobTypeService.jobTypes().subscribe(job_types => this.job_types = job_types)

    this.employeeService.canInsertClients().subscribe((attendances) => {
      this.attendances = attendances
    })

    this.employeeService.employees().subscribe(employees => {
      this.creations = employees.filter(employee => {
        return employee.department.description === 'Criação'
      })
    })
  }

  loadTask() {
    let date = new Date()
    let taskId = parseInt(this.route.snapshot.url[2].path)
    this.nextDateMessage = ''

    let snack = this.snackBar.open('Carregando informações...')
    this.taskService.task(taskId).subscribe(task => {
      this.taskService.getNextAvailableDate(this.datePipe.transform(date, 'yyyy-MM-dd'), 1, task.job_activity).subscribe((data) => {
        this.responsibles = data.responsibles
        this.scheduleForm.controls.responsible.setValue(task.responsible)
        snack.dismiss()
      })

      this.scheduleForm.controls.id.setValue(task.id)
      this.scheduleForm.controls.job_activity.setValue(task.job_activity)
      this.scheduleForm.controls.job_activity.disable()
      this.scheduleForm.controls.budget_value.setValue(task.job.budget_value)
      this.scheduleForm.controls.budget_value.disable()
      this.scheduleForm.controls.duration.setValue(task.duration)
      this.scheduleForm.controls.available_date.setValue(new Date(task.available_date + "T00:00:00"))
      this.scheduleForm.controls.deadline.setValue(new Date(task.job.deadline + "T00:00:00"))
      this.scheduleForm.controls.deadline.disable()
    })
  }

  clearEvents() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })
  }

  addEvents() {
    this.scheduleForm.controls.job_activity.valueChanges.subscribe(status => {
      this.getAvailableDates(new Date())
      let jobActivity = this.scheduleForm.controls.job_activity.value as JobActivity
      this.setButtons()

      if (jobActivity.description == 'Modificação')
        this.addModificationEvents()
      else if (jobActivity.description == 'Orçamento')
        this.addBudgetEvents()
      else if (jobActivity.description == 'Detalhamento')
        this.addDetailingEvents()
      else if (jobActivity.description == 'Continuação')
        this.addContinuationEvents()
      else if (jobActivity.description == 'Opção')
        this.addOptionEvents()
      else if (jobActivity.description == 'Outsider')
        this.addOutsiderEvents()
      else this.addOtherEvents()
    })

    this.scheduleForm.controls.budget_value.valueChanges
      .pipe(debounceTime(500))
      .subscribe(value => {
        let job_activity = this.scheduleForm.controls.job_activity.value.description

        if (value > 450000 &&  job_activity != 'Outsider') {
          this.scheduleForm.controls.job_activity.setValue(this.job_activities.find(jobActivity => {
            return jobActivity.description == 'Outsider'
          }))
        } else if(value < 450000 && job_activity == 'Outsider') {
          this.scheduleForm.controls.job_activity.setValue(this.job_activities.find(jobActivity => {
            return jobActivity.description == 'Projeto'
          }))
        }
      })

    this.scheduleForm.controls.duration.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(value => {
        if (value >= 5) {
          this.scheduleForm.controls.job_activity.setValue(this.job_activities.find(jobActivity => {
            return jobActivity.description == 'Outsider'
          }))
        }
        this.addValidationBudget()
        this.calculateNextDate()
      })

    this.scheduleForm.controls.available_date.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(value => {
        if(this.isAdmin) {
          return
        }

        this.availableDates.forEach(row => {
          if(row.date == this.datePipe.transform(value, 'yyyy-MM-dd')) this.responsibles = row.available_responsibles
        })

        if(this.scheduleForm.controls.job_activity.value.description != 'Modificação')
          this.scheduleForm.controls.responsible.setValue(this.responsibles.length > 0 ? this.responsibles[0] : '')
      })

    this.addValidationBudget()
  }

  enableSearchForm() {
    this.searchForm.enable()

    if(this.paramAttendance != null) {
      this.searchForm.controls.attendance.setValue(this.paramAttendance)
      this.searchForm.controls.attendance.disable()
    }
  }

  changeMonth(date: Date) {
    this.getAvailableDates(date)
  }

  addModificationEvents() {
    this.clearEvents()
    if( ! this.dateSetManually) {
      this.scheduleForm.controls.responsible.disable()
    }

    this.scheduleForm.controls.budget_value.disable()
    this.nextDateMessage = 'Escolha primeiro o job, para verificarmos o responsável e a data disponível.'

    let snackbar
    let controls = this.searchForm.controls
    let types = ['Projeto', 'Modificação', 'Outsider', 'Opção']

    this.params = () => {
      return {
        paginate: false,
        clientName: controls.client.value,
        status: controls.status.value != undefined ? controls.status.value.id : null,
        attendance: controls.attendance.value,
        creation: controls.creation.value,
        job_type: controls.job_type.value,
        job_activities: this.job_activities.filter(jobActivity => {
            return types.indexOf(jobActivity.description) > -1
          }).map(jobActivity => {
            return jobActivity.id
          })
      }
    }

    this.callback = (jobs: Job[]) => {
      this.jobs = jobs
    }

    this.loadJobs()

    this.subscriptions.push(this.scheduleForm.controls.job.valueChanges.subscribe(job => {
      let responsible
      this.nextDateMessage = ''
      this.scheduleForm.controls.budget_value.setValue(job.budget_value)

      if( ! this.dateSetManually) {
        this.scheduleForm.controls.responsible.setValue('')
        this.responsibles = [job.creation_responsible]
        this.scheduleForm.controls.available_date.setValue('')
        this.scheduleForm.controls.responsible.setValue(job.creation_responsible)
        this.getAvailableDates(new Date(), this.responsibles[0])
      }
    }))
  }

  addOptionEvents() {
    this.clearEvents()
    if( ! this.dateSetManually) {
      this.scheduleForm.controls.responsible.disable()
    }

    this.scheduleForm.controls.budget_value.disable()
    this.nextDateMessage = 'Escolha primeiro o job, para verificarmos o responsável e a data disponível.'

    let snackbar
    let controls = this.searchForm.controls
    let types = ['Projeto', 'Outsider']

    this.params = () => {
      return {
        paginate: false,
        clientName: controls.client.value,
        status: controls.status.value != undefined ? controls.status.value.id : null,
        attendance: controls.attendance.value,
        creation: controls.creation.value,
        job_type: controls.job_type.value,
        job_activities: this.job_activities.filter(jobActivity => {
            return types.indexOf(jobActivity.description) > -1
          }).map(jobActivity => {
            return jobActivity.id
          })
      }
    }

    this.callback = (jobs: Job[]) => {
      this.jobs = jobs
    }

    this.loadJobs()

    this.subscriptions.push(this.scheduleForm.controls.job.valueChanges.subscribe(job => {
      let responsible
      this.nextDateMessage = ''
      this.scheduleForm.controls.budget_value.setValue(job.budget_value)

      if( ! this.dateSetManually) {
        this.scheduleForm.controls.responsible.setValue('')
        this.responsibles = [job.creation_responsible]
        this.scheduleForm.controls.available_date.setValue('')
        this.scheduleForm.controls.responsible.setValue(job.creation_responsible)
        this.getAvailableDates(new Date(), this.responsibles[0])
      }
    }))
  }

  addBudgetEvents() {
    this.clearEvents()

    this.scheduleForm.controls.responsible.enable()
    this.scheduleForm.controls.budget_value.disable()
  }

  addDetailingEvents() {
    this.clearEvents()
    this.enableSearchForm()

    this.scheduleForm.controls.responsible.enable()
    this.scheduleForm.controls.budget_value.disable()

    let controls = this.searchForm.controls
    controls.status.setValue(this.job_status.find(jobStatus => { return jobStatus.description == 'Aprovado' }))
    controls.status.disable()

    let snackbar
    let types = ['Projeto', 'Modificação', 'Outsider', 'Opção']

    this.params = () => {
      return {
        paginate: false,
        clientName: controls.client.value,
        status: controls.status.value != undefined ? controls.status.value.id : null,
        attendance: controls.attendance.value,
        creation: controls.creation.value,
        job_type: controls.job_type.value
      }
    }

    this.callback = (jobs: Job[]) => {
      this.jobs = jobs
      let jobActivity = this.job_activities.find(jobActivity => {
        return jobActivity.description == 'Detalhamento'
      })
      this.jobs = this.jobs.filter(job => {
        let detailed = false
        job.tasks.forEach(task => {
          if (task.job_activity.id == jobActivity.id) {
            detailed = true
          }
        })
        return !detailed
      })
    }

    this.loadJobs()
  }

  addOutsiderEvents() {
    this.clearEvents()
    this.enableSearchForm()

    this.scheduleForm.controls.responsible.enable()
    this.scheduleForm.controls.budget_value.enable()
    this.scheduleForm.controls.budget_value.setValue(450000.01)

    let snackbar
    let controls = this.searchForm.controls

    this.params = () => {
      return {
        paginate: false,
        clientName: controls.client.value,
        status: controls.status.value != undefined ? controls.status.value.id : null,
        attendance: controls.attendance.value,
        creation: controls.creation.value,
        job_type: controls.job_type.value
      }
    }

    this.callback = (jobs: Job[]) => {
      this.jobs = jobs
    }

    this.loadJobs()
  }

  addOtherEvents() {
    this.clearEvents()
    this.enableSearchForm()

    this.scheduleForm.controls.responsible.enable()
    this.scheduleForm.controls.budget_value.enable()

    let snackbar
    let controls = this.searchForm.controls

    this.params = () => {
      return {
        paginate: false,
        clientName: controls.client.value,
        status: controls.status.value != undefined ? controls.status.value.id : null,
        attendance: controls.attendance.value,
        creation: controls.creation.value,
        job_type: controls.job_type.value
      }
    }

    this.callback = (jobs: Job[]) => {
      this.jobs = jobs
    }

    this.loadJobs()
  }

  addContinuationEvents() {
    this.clearEvents()
    this.enableSearchForm()

    this.scheduleForm.controls.responsible.enable()
    this.scheduleForm.controls.budget_value.disable()

    let snackbar
    let controls = this.searchForm.controls

    this.params = () => {
      return {
        paginate: false,
        clientName: controls.client.value,
        status: controls.status.value != undefined ? controls.status.value.id : null,
        attendance: controls.attendance.value,
        creation: controls.creation.value,
        job_type: controls.job_type.value
      }
    }

    this.callback = (jobs: Job[]) => {
      this.jobs = jobs
    }


    this.loadJobs()
  }

  getAvailableDates(date: Date, onlyEmployee: Employee = null) {
    let open = this.availableDatepicker.opened
    let finDate = new Date(date.getFullYear(), date.getMonth(), 31)
    finDate.setDate(finDate.getDate() + 30)
    this.availableDatepicker.close()
    let snack = this.snackBar.open('Aguarde enquanto carregamos as datas disponíveis')
    this.taskService.getAvailableDates({
      iniDate: date.getFullYear() + '-' + (date.getMonth() + 1) + '-01',
      finDate: finDate.getFullYear() + '-' + (finDate.getMonth() + 1) + '-31',
      job_activity: this.scheduleForm.controls.job_activity.value,
      duration: this.scheduleForm.controls.duration.value,
      only_employee: onlyEmployee
    }).subscribe(data => {
      this.availableDates = data.dates
      snack.dismiss()

      if (open)
        this.availableDatepicker.open()

      if( ! this.isAdmin ) {
        let date = new Date(this.availableDates[0]['date'] + "T00:00:00")
        this.scheduleForm.controls.available_date.setValue(date.toISOString())
        this.responsibles = this.availableDates[0]['available_responsibles']
        this.scheduleForm.controls.responsible.setValue(this.availableDates[0]['available_responsibles'][0])
      } else {
        this.responsibles = data.responsibles

        if(this.scheduleForm.controls.job_activity.value.description != 'Modificação')
        this.scheduleForm.controls.responsible.setValue(this.availableDates[0]['available_responsibles'][0])
      }
    })
  }

  filterAvailableDates = (calendarDate: Date): boolean => {
    let response: boolean = false

    if (this.isAdmin) {
      return true
    }

    this.availableDates.forEach(row => {
      let myDate = new Date(row.date + "T00:00:00")

      if (myDate.getFullYear() == calendarDate.getFullYear()
        && myDate.getMonth() == calendarDate.getMonth()
        && myDate.getDate() == calendarDate.getDate()) {
        response = true
      }

    });

    return response
  }

  recoveryParams() {
    if (!this.isAdmin) {
      return
    }

    this.route.queryParams.filter(params => params.date).subscribe(params => {
      if (params.date == null) {
        return
      }

      this.availableDates = [{ date: { date: params.date + "T00:00:00" } }]
      this.scheduleForm.controls.available_date.setValue(params.date + "T00:00:00")
      this.dateSetManually = true
    })
  }

  createForm() {
    this.scheduleForm = this.formBuilder.group({
      id: this.formBuilder.control(''),
      job_activity: this.formBuilder.control('', [Validators.required]),
      duration: this.formBuilder.control('', [Validators.required]),
      available_date: this.formBuilder.control('', [Validators.required]),
      deadline: this.formBuilder.control('', [Validators.required]),
      budget_value: this.formBuilder.control('', [Validators.required]),
      responsible: this.formBuilder.control('', [Validators.required]),
      job: this.formBuilder.control('')
    })

    this.searchForm = this.formBuilder.group({
      attendance: this.formBuilder.control({value: '', disabled: !this.isAdmin}),
      creation: this.formBuilder.control(''),
      job_type: this.formBuilder.control(''),
      client: this.formBuilder.control(''),
      status: this.formBuilder.control('')
    })

    if(this.paramAttendance != null) {
      this.searchForm.controls.attendance.setValue(this.paramAttendance)
      this.searchForm.controls.attendance.disable()
    }

    this.searchForm.controls.client.valueChanges
    .pipe(distinctUntilChanged(), debounceTime(500))
    .subscribe(clientName => {
      this.clientService.clients({ search: clientName, attendance: this.paramAttendance }).subscribe((dataInfo) => {
        this.clients = dataInfo.pagination.data
      })
    })

    this.searchForm.valueChanges
    .pipe(distinctUntilChanged())
    .subscribe((value) => {
      let flag = false

      for(let key in value) {
        if(value[key] != '') flag = true
      }

      if(flag)
      this.loadJobs()
    })
  }

  loadJobs() {
    let params = this.params()
    let snackbar = this.snackBar.open('Carregando jobs...')
    this.jobService.jobs(params).subscribe(data => {
      snackbar.dismiss()
      let jobs = <Job[]> data.data
      this.callback(jobs)
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
    if(this.isAdmin) return

    let days = this.scheduleForm.controls.duration.value
    let validators: ValidatorFn[] = []
    validators.push(Validators.required)

    if (days <= 1) {
      validators.push(Validators.min(0))
      validators.push(Validators.max(70000))
      this.budgetValueMessage = 'O valor deve estar entre 0,00 e 70.000,00 para até 1 dia'
    } else if (days <= 2) {
      validators.push(Validators.min(70000.01))
      validators.push(Validators.max(150000))
      this.budgetValueMessage = 'O valor deve estar entre 70.000,00 e 150.000,00 para até 2 dias'
    } else if (days <= 3) {
      validators.push(Validators.min(150000.01))
      validators.push(Validators.max(240000))
      this.budgetValueMessage = 'O valor deve estar entre 150.000,00 e 240.000,00 para até 3 dias'
    } else if (days <= 4) {
      validators.push(Validators.min(240000.01))
      validators.push(Validators.max(340000))
      this.budgetValueMessage = 'O valor deve estar entre 240.000,00 e 340.000,00 para até 4 dias'
    } else if (days <= 5) {
      validators.push(Validators.min(340000.01))
      validators.push(Validators.max(450000))
      this.budgetValueMessage = 'O valor deve estar entre 340.000,00 e 450.000,00 para até 5 dias'
    } else if (days > 5) {
      validators.push(Validators.min(450000.01))
      this.budgetValueMessage = 'O valor deve ser maior que 450.000,00 para mais de 5 dias'
    }

    this.scheduleForm.controls.budget_value.setValidators(validators)
    this.scheduleForm.controls.budget_value.updateValueAndValidity()
  }

  calculateNextDate() {
    let controls = this.scheduleForm.controls
    if (controls.job_activity.status != 'VALID'
      || controls.duration.status != 'VALID') {
      return
    }

    let now = new Date()
    let dateString = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()
    let estimatedTime = this.scheduleForm.controls.duration.value
    let jobActivity = this.scheduleForm.controls.job_activity.value
    this.nextDateMessage = 'Aguarde...'
    this.taskService.getNextAvailableDate(dateString, estimatedTime, jobActivity).subscribe((data) => {
      if( ! this.isAdmin ) {
        this.responsibles = data.available_responsibles
        this.scheduleForm.controls.responsible.setValue(data.available_responsibles[0])
      } else {
        this.responsibles = data.responsibles

        if(this.scheduleForm.controls.job_activity.value.description != 'Modificação')
        this.scheduleForm.controls.responsible.setValue(data.available_responsibles[0])
      }

      if (!this.dateSetManually) {
        let date = new Date(data.available_date + "T00:00:00")
        this.getAvailableDates(date)
      }
      this.nextDateMessage = 'Lembre-se, você pode mover as suas agendas para liberar a data.'
    })
  }

  compareResponsible(var1: Employee, var2: Employee) {
    return var1.id === var2.id
  }

  compareJobActivity(job1: JobActivity, job2: JobActivity) {
    return job1.id === job2.id
  }

  compareAttendance(var1: Employee, var2: Employee) {
    return var1.id === var2.id
  }

  compareStatus(var1: JobStatus, var2: JobStatus) {
    return var1.id === var2.id
  }

  compareJobType(var1: JobType, var2: JobType) {
    return var1.id === var2.id
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
      this.buttonEnable = false

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

        this.buttonEnable = true
      })
    }
  }

  edit() {
    if( ! this.buttonEnable) return

    if (ErrorHandler.formIsInvalid(this.scheduleForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    let task = this.scheduleForm.getRawValue() as Task
    this.url = '/schedule'
    this.buttonEnable = false

    this.taskService.edit(task).subscribe(data => {
      if (data.status) {
        let snack = this.snackBar.open('Editado com sucesso, redirecionando para o cronograma.', '', {
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

      this.buttonEnable = true
    })
  }

}
