import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { JobStatus } from 'app/job-status/job-status.model';
import { JobActivity } from 'app/job-activities/job-activity.model';
import { Job } from 'app/jobs/job.model';
import { Employee } from 'app/employees/employee.model';
import { Client } from 'app/clients/client.model';
import { JobType } from 'app/job-types/job-type.model';
import { Subscription } from 'rxjs';
import { MatDatepicker } from '@angular/material/datepicker';
import { JobService } from 'app/jobs/job.service';
import { JobActivityService } from 'app/job-activities/job-activity.service';
import { JobStatusService } from 'app/job-status/job-status.service';
import { TaskService } from '../task.service';
import { EmployeeService } from 'app/employees/employee.service';
import { JobTypeService } from 'app/job-types/job-type.service';
import { AuthService } from 'app/login/auth.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isObject } from 'util';
import { Month, MONTHS } from 'app/shared/date/months';
import { ScheduleDate } from '../schedule-date/schedule-date.model';
import { ErrorHandler } from 'app/shared/error-handler.service';
import { Task } from '../task.model';
import { TaskItem } from '../task-item.model';

@Component({
  selector: 'cb-schedule-form',
  templateUrl: './schedule-form.component.html',
  styleUrls: ['./schedule-form.component.css']
})
export class ScheduleFormComponent implements OnInit {
  selectedItems: ScheduleDate[] = []
  items: ScheduleDate[]
  itemsByResponsible: ScheduleDate[] = []
  typeForm: string = 'new'
  filter: boolean = false
  scheduleForm: FormGroup
  searchForm: FormGroup
  job_activities: JobActivity[]
  job_status: JobStatus[]
  jobs: Job[]
  dateSetManually: boolean = false
  params: () => {} = () => { return {} }
  callback: (jobs: Job[]) => void = (jobs) => { }
  isAdmin: boolean = false
  adminMode: boolean
  minDate: Date
  showExtraParams: boolean = true
  paramAttendance: Employee = null
  responsibles: Employee[] = []
  clients: Client[] = []
  availableDates: any = []
  job_types: JobType[] = []
  attendances: Employee[] = []
  creations: Employee[] = []
  url: string = '/jobs/new'
  buttonText: string = 'PRÓXIMO'
  durationErrorMessage: string
  budgetErrorMessage: string
  subscriptions: Subscription = new Subscription
  @ViewChild('availableDatepicker', { static: false }) availableDatepicker: MatDatepicker<Date>
  buttonEnable: boolean = true

  constructor(
    private formBuilder: FormBuilder,
    private jobService: JobService,
    private jobActivityService: JobActivityService,
    private jobStatusService: JobStatusService,
    private taskService: TaskService,
    private employeeService: EmployeeService,
    private jobTypeService: JobTypeService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.typeForm = this.route.snapshot.url[1].path
    this.isAdmin = this.authService.hasDisplay('schedule/new?adminmode')

    this.adminMode = false
    this.createForm()
    this.createValidations()
    this.loadFilterData()
    this.subscribeChangesOnAdminMode()

    this.paramAttendance = this.authService.currentUser().employee.department.description === 'Atendimento'
      ? this.authService.currentUser().employee : null

    if (this.typeForm == 'edit') {
      this.loadTask()
    }
  }

  subscribeChangesOnAdminMode() {
    this.subscriptions.add(
      this.scheduleForm.controls.admin.valueChanges.subscribe((value) => {
        if (value == true) this.createValidations()
        if (value == false) this.destroyValidations()

        this.adminMode = value
      })
    );
  }

  createValidations() {
    this.addValidationBudget()
    this.subscribeChangesOnAdminMode()
    this.subscribeChangesOnActivity()
  }

  destroyValidations() {
    this.subscriptions.unsubscribe()
    this.subscriptions = new Subscription;
    this.subscribeChangesOnAdminMode()
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe()
  }

  subscribeChangesOnActivity() {
    this.subscriptions.add(
      this.scheduleForm.controls.job_activity.valueChanges.subscribe((jobActivity: JobActivity) => {
        this.showExtraParams = jobActivity.no_params === 0;

        let durationControl = this.scheduleForm.controls.duration
        durationControl.clearValidators()

        if (jobActivity.min_duration == 0
          && jobActivity.max_duration == 0
          && jobActivity.fixed_duration == 0) return;

        this.durationErrorMessage = 'Duração válida para a atividade selecionada:'
        this.durationErrorMessage += ' de ' + jobActivity.min_duration + ' a ' + jobActivity.max_duration
        this.durationErrorMessage += ' dia(s)'

        if (jobActivity.min_duration != 0 || jobActivity.max_duration != 0) {
          durationControl.setValidators([
            Validators.min(jobActivity.min_duration),
            Validators.max(jobActivity.max_duration)
          ])

          this.durationErrorMessage = 'Duração válida para a atividade selecionada:'
          this.durationErrorMessage += ' de ' + jobActivity.min_duration + ' a ' + jobActivity.max_duration
          this.durationErrorMessage += ' dia(s)'
        }

        if (jobActivity.fixed_duration != 0) {
          durationControl.setValidators([
            Validators.min(jobActivity.fixed_duration),
            Validators.max(jobActivity.fixed_duration)
          ])

          this.durationErrorMessage = 'Duração válida para a atividade selecionada:'
          this.durationErrorMessage += ' pré-definida em ' + jobActivity.fixed_duration
          this.durationErrorMessage += ' dia(s)'
        }

        durationControl.updateValueAndValidity()
      })
    );
  }

  loadFilterData() {
    this.jobStatusService.jobStatus().subscribe(jobStatus => {
      this.job_status = jobStatus
    })

    this.jobActivityService.jobActivities().subscribe(jobActivities => {
      this.job_activities = this.typeForm == 'new'
        ? jobActivities.filter((jobActivity) => jobActivity.initial == 1) : jobActivities
    })

    this.jobTypeService.jobTypes().subscribe(job_types => this.job_types = job_types)

    this.employeeService.canInsertClients().subscribe((attendances) => {
      this.attendances = attendances
    })

    this.employeeService.employees().subscribe(dataInfo => {
      let employees = dataInfo.pagination.data
      this.creations = employees.filter(employee => {
        return employee.department.description === 'Criação'
      })
    })
  }

  loadTask() {
    let taskId = parseInt(this.route.snapshot.url[2].path)
    let snack = this.snackBar.open('Carregando informações...')

    this.taskService.task(taskId).subscribe(task => {
      snack.dismiss()
      this.scheduleForm.controls.id.setValue(task.id)
      this.scheduleForm.controls.job_activity.setValue(task.job_activity)
      this.scheduleForm.controls.job_activity.disable()
      this.scheduleForm.controls.budget_value.setValue(task.job.budget_value)
      this.scheduleForm.controls.budget_value.disable()
      this.scheduleForm.controls.duration.setValue(task.duration)
      this.scheduleForm.controls.available_date.setValue(new Date(task.items[0].date + "T00:00:00"))
      this.scheduleForm.controls.deadline.setValue(new Date(task.job.deadline + "T00:00:00"))
      this.scheduleForm.controls.deadline.disable()
    })
  }

  createForm() {
    this.scheduleForm = this.formBuilder.group({
      id: this.formBuilder.control(''),
      admin: this.formBuilder.control(''),
      job_activity: this.formBuilder.control('', [Validators.required]),
      duration: this.formBuilder.control('', [Validators.required]),
      available_date: this.formBuilder.control('', [Validators.required]),
      deadline: this.formBuilder.control('', [Validators.required]),
      budget_value: this.formBuilder.control('', [Validators.required]),
      responsible: this.formBuilder.control('', [Validators.required]),
      job: this.formBuilder.control('')
    })

    this.searchForm = this.formBuilder.group({
      attendance: this.formBuilder.control({ value: '', disabled: !this.isAdmin }),
      creation: this.formBuilder.control(''),
      job_type: this.formBuilder.control(''),
      client: this.formBuilder.control(''),
      status: this.formBuilder.control('')
    })

    if (this.paramAttendance != null) {
      this.searchForm.controls.attendance.setValue(this.paramAttendance)
      this.searchForm.controls.attendance.disable()
    }
  }

  toggleDate(item: ScheduleDate, pos: number): boolean {
    if (item.status == 'false' && !this.adminMode) return;

    let i = -1

    this.selectedItems.forEach((selectedItem, index) => {
      if (selectedItem.date == item.date) i = index
    })

    if (i != -1) {
      if (this.adminMode) {
        this.selectedItems[i].selected = false
        this.selectedItems.splice(i, 1)
      } else if (this.checkValidDuration()) {
        /*
        * Desagrupar todos os itens quando clicar
        */
        while (this.selectedItems.length > 0) {
          this.selectedItems[0].selected = false
          this.selectedItems.splice(0, 1)
        }
      }
    } else {
      if (!this.checkValidDuration() || this.adminMode) {
        this.selectedItems.push(item)
        this.selectedItems[(this.selectedItems.length - 1)].selected = true
      }
      /*
       * Agrupar todos os itens quando clicar
       */
      while (this.checkValidDuration() === false) {
        pos++;
        this.toggleDate(this.itemsByResponsible[pos], pos);
      }
    }
  }

  hasSelectedItem(item: ScheduleDate) {
    return this.selectedItems.some(i => i.date == item.date && i.responsible_id == item.responsible_id)
  }

  loadJobs(params) {
    let snackbar = this.snackBar.open('Carregando jobs...')
    this.jobService.jobs(params).subscribe(dataInfo => {
      snackbar.dismiss()
      let jobs = <Job[]>dataInfo.pagination.data
      this.callback(jobs)
    })
  }

  getBudgetValidators(): ValidatorFn[] {
    let days = this.scheduleForm.controls.duration.value
    let validators: ValidatorFn[] = []
    validators.push(Validators.required)

    if (days <= 1) {
      validators.push(Validators.min(0))
      validators.push(Validators.max(70000))
      this.budgetErrorMessage = 'O valor deve estar entre 0,00 e 70.000,00 para até 1 dia'
    } else if (days <= 2) {
      validators.push(Validators.min(70000.01))
      validators.push(Validators.max(150000))
      this.budgetErrorMessage = 'O valor deve estar entre 70.000,00 e 150.000,00 para até 2 dias'
    } else if (days <= 3) {
      validators.push(Validators.min(150000.01))
      validators.push(Validators.max(240000))
      this.budgetErrorMessage = 'O valor deve estar entre 150.000,00 e 240.000,00 para até 3 dias'
    } else if (days <= 4) {
      validators.push(Validators.min(240000.01))
      validators.push(Validators.max(340000))
      this.budgetErrorMessage = 'O valor deve estar entre 240.000,00 e 340.000,00 para até 4 dias'
    } else if (days <= 5) {
      validators.push(Validators.min(340000.01))
      validators.push(Validators.max(450000))
      this.budgetErrorMessage = 'O valor deve estar entre 340.000,00 e 450.000,00 para até 5 dias'
    } else if (days > 5) {
      validators.push(Validators.min(450000.01))
      this.budgetErrorMessage = 'O valor deve ser maior que 450.000,00 para mais de 5 dias'
    }

    return validators
  }

  addValidationBudget() {
    this.subscriptions.add(
      this.scheduleForm.controls.duration.valueChanges.subscribe(() => {
        this.scheduleForm.controls.budget_value.setValidators(this.getBudgetValidators())
        this.scheduleForm.controls.budget_value.updateValueAndValidity()
      })
    )
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

  getAvailableDates() {
    this.items = []
    this.itemsByResponsible = []
    this.selectedItems = []
    this.scheduleForm.controls.responsible.setValue('')

    let availableDate = this.scheduleForm.controls.available_date.value
    let jobActivity = this.scheduleForm.controls.job_activity.value

    if (isObject(jobActivity) && jobActivity.no_params == 1) {
      let snackbar = this.snackBar.open('Carregando responsáveis...')
      this.taskService.responsiblesByActivity(jobActivity.id).subscribe((responsibles) => {
        this.responsibles = responsibles
        snackbar.dismiss()
      })
      return
    }

    if (!isObject(jobActivity) || availableDate == '') {
      this.snackBar.open('Escolha o tipo de atividade e uma data inicial para carregar as datas', '', { duration: 3000 })
      return
    }

    let snack = this.snackBar.open('Buscando as datas disponíveis para agenda, a partir de 30 dias da data escolhida')
    this.taskService.getAvailableDates({
      initialDate: this.datePipe.transform(availableDate, 'yyyy-MM-dd'),
      job_activity: jobActivity
    }).subscribe((data) => {
      this.items = data.items
      this.responsibles = data.responsibles

      snack.dismiss()
      snack = this.snackBar.open('Selecione um responsável para abrir as opções', '', { duration: 3000 })
    })
  }

  filterItemsByResponsible() {
    this.itemsByResponsible = []
    this.selectedItems = []

    let responsible = <Employee>this.scheduleForm.controls.responsible.value
    this.itemsByResponsible = this.items.filter((item) => {
      return responsible.id == item.responsible_id
    })
  }

  checkValidation() {
    return this.checkValidDuration()
  }

  checkValidDuration() {
    return this.selectedItems.length == parseInt(this.scheduleForm.controls.duration.value)
      || this.adminMode
  }

  go() {
    if (ErrorHandler.formIsInvalid(this.scheduleForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    let task = this.scheduleForm.getRawValue() as Task
    let jobActivity = <JobActivity>this.scheduleForm.controls.job_activity.value
    let url = jobActivity.redirect_after_save != null ? jobActivity.redirect_after_save : '/jobs/new'

    this.jobService.data = new Job
    this.jobService.data.task = task
    this.jobService.data.task.items = this.transformInTaskItems()
    this.jobService.data.budget_value = this.scheduleForm.controls.budget_value.value
    this.jobService.data.deadline = this.scheduleForm.controls.deadline.value
    this.jobService.data.job_activity = task.job_activity

    this.router.navigateByUrl(url)
  }

  sumDuration() {
    return this.selectedItems
      .map(selectedItem => this.calculateAvailableDuration(selectedItem.duration))
      .reduce((prev, next) => prev + next, 0)
  }

  calculateAvailableDuration(duration: number): number {
    return (1 - duration)
  }

  transformInTaskItems(): TaskItem[] {
    return this.selectedItems.map(selectedItem => {
      let taskItem = new TaskItem;
      taskItem.date = selectedItem.date
      taskItem.duration = selectedItem.duration
      taskItem.budget_value = selectedItem.budget_value
      return taskItem;
    }).sort((a, b) => {
      return a.date > b.date ? 1 : -1;
    });
  }


  edit() {
    if (ErrorHandler.formIsInvalid(this.scheduleForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    let task = this.scheduleForm.getRawValue() as Task
    let url = '/jobs/edit'

    this.jobService.data = new Job
    this.jobService.data.task = task
    this.jobService.data.task.items = this.transformInTaskItems()
    this.jobService.data.budget_value = this.scheduleForm.controls.budget_value.value
    this.jobService.data.deadline = this.scheduleForm.controls.deadline.value
    this.jobService.data.job_activity = task.job_activity

    this.taskService.edit(task).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      }).afterDismissed().subscribe(() => {
        this.router.navigateByUrl('/schedule?date=' + task.items[0].date)
      })
    })
  }

}
