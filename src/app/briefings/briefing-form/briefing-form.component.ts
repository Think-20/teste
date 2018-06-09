import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { Briefing } from '../briefing.model';
import { BriefingService } from '../briefing.service';

import { EmployeeService } from '../../employees/employee.service';
import { ClientService } from '../../clients/client.service';
import { AuthService } from '../../login/auth.service';
import { UploadFileService } from '../../shared/upload-file.service';

import { Employee } from '../../employees/employee.model';
import { Job } from '../../jobs/job.model';
import { JobType } from '../../job-types/job-type.model';
import { Client } from '../../clients/client.model';
import { BriefingCompetition } from '../../briefing-competitions/briefing-competition.model';
import { BriefingPresentation } from 'app/briefing-presentations/briefing-presentation.model';

import { ErrorHandler } from '../../shared/error-handler.service';
import { Patterns } from '../../shared/patterns.model';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import { Stand } from 'app/stand/stand.model';
import { isUndefined, isObject } from 'util';
import { BriefingMainExpectation } from 'app/briefing-main-expectation/briefing-main-expectation.model';
import { BriefingLevel } from 'app/briefing-level/briefing-level.model';
import { BriefingHowCome } from 'app/briefing-how-come/briefing-how-come.model';
import { Router } from '@angular/router';

@Component({
  selector: 'cb-briefing-form',
  templateUrl: './briefing-form.component.html',
  styleUrls: ['./briefing-form.component.css']
})
@Injectable()
export class BriefingFormComponent implements OnInit {
  availableDateParam: string
  typeForm: string
  standItemState = 'hidden'
  briefing: Briefing
  jobs: Job[]
  job_types: JobType[]
  clients: Client[]
  main_expectations: BriefingMainExpectation[]
  agencies: Client[]
  levels: BriefingLevel[]
  how_comes: BriefingHowCome[]
  competitions: BriefingCompetition[]
  employees: Employee[]
  paramAttendance: Employee = null
  attendances: Employee[]
  creations: Employee[]
  presentations: BriefingPresentation[]
  briefingForm: FormGroup
  isAdmin: boolean = false
  @ViewChild('creation') creationSelect

  constructor(
    private clientService: ClientService,
    private uploadFileService: UploadFileService,
    private employeeService: EmployeeService,
    private briefingService: BriefingService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  toggleCreation() {
    if(!this.isAdmin) {
      this.creationSelect.close()
    }
  }

  ngOnInit() {
    let snackBarStateCharging
    this.typeForm = this.route.snapshot.url[0].path
    this.availableDateParam = this.typeForm == 'new' ? this.route.snapshot.params['available_date'] : ''

    this.paramAttendance = this.authService.currentUser().employee.department.description === 'Atendimento'
    ? this.authService.currentUser().employee : null

    this.isAdmin = this.authService.hasAccess('briefing/save')

    this.briefingForm = this.formBuilder.group({
      id: this.formBuilder.control({value: '', disabled: true}),
      job: this.formBuilder.control('', [Validators.required]),
      main_expectation: this.formBuilder.control('', [Validators.required]),
      client: this.formBuilder.control(''),
      event: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(150)
      ]),
      last_provider: this.formBuilder.control('', [
        Validators.minLength(3),
        Validators.maxLength(100)
      ]),
      not_client: this.formBuilder.control(''),
      budget: this.formBuilder.control('', [
        Validators.required,
        Validators.maxLength(13)
      ]),
      deadline: this.formBuilder.control('', [Validators.required]),
      available_date: this.formBuilder.control('', [Validators.required]),
      estimated_time: this.formBuilder.control('', [Validators.required]),
      how_come: this.formBuilder.control('', [Validators.required]),
      job_type: this.formBuilder.control('', [Validators.required]),
      agency: this.formBuilder.control(''),
      attendance: this.formBuilder.control('', [Validators.required]),
      creation: this.formBuilder.control('', [Validators.required]),
      rate: this.formBuilder.control(''),
      stand: this.formBuilder.group({}),
      presentations: this.formBuilder.control('', [Validators.required]),
      levels: this.formBuilder.control('', [Validators.required]),
      competition: this.formBuilder.control('', [Validators.required]),
      files: this.formBuilder.array([]),
      approval_expectation_rate: this.formBuilder.control('', [Validators.required]),
      think_history: this.formBuilder.control('')
    })

    this.briefingForm.get('client').valueChanges
    .do(clientName => {
        snackBarStateCharging = this.snackBar.open('Aguarde...')
    })
    .debounceTime(500)
    .subscribe(clientName => {
      if(clientName == '' || isObject(clientName)) {
        snackBarStateCharging.dismiss()
        return;
      }

      this.clientService.clients({search: clientName, attendance: this.paramAttendance}).subscribe((dataInfo) => {
        this.clients = dataInfo.pagination.data.filter((client) => {
          return client.type.description !== 'Agência'
        })
      })
      Observable.timer(500).subscribe(timer => snackBarStateCharging.dismiss())
    })

    this.briefingForm.get('agency').valueChanges
    .do(name => {
        snackBarStateCharging = this.snackBar.open('Aguarde...')
    })
    .debounceTime(500)
    .subscribe(name => {
      if(isObject(name)) {
        this.enableNotClient()
        snackBarStateCharging.dismiss()
        return;
      }

      if(name == '') {
        this.disableNotClient()
        snackBarStateCharging.dismiss()
        return;
      }

      this.clientService.clients({search: name, attendance: this.paramAttendance}).subscribe((dataInfo) => {
        this.agencies = dataInfo.pagination.data.filter((client) => {
          return client.type.description === 'Agência'
        })
      })
      Observable.timer(500).subscribe(timer => snackBarStateCharging.dismiss())
    })

    snackBarStateCharging = this.snackBar.open('Aguarde...')

    this.briefingService.loadFormData().subscribe(response => {
      let data = response.data
      this.jobs = data.jobs
      this.job_types = data.job_types
      this.creations = data.creations

      if(this.availableDateParam == undefined) {
        this.briefingForm.controls.creation.setValue(data.creation)
        this.briefingForm.controls.available_date.setValue(data.available_date)
        this.addListenerEstimatedTime()

        snackBarStateCharging.dismiss()
        snackBarStateCharging = this.snackBar.open('Considerando que o tempo de produção seja 1 dia, ' + data.creation.name + ' foi selecionado.', '', {
          duration: 2000
        })

      } else {
        snackBarStateCharging.dismiss()
        this.briefingForm.controls.available_date.setValue(this.availableDateParam)
      }

      this.attendances = data.attendances
      this.competitions = data.competitions
      this.presentations = data.presentations
      this.main_expectations = data.main_expectations
      this.levels = data.levels
      this.how_comes = data.how_comes

      if(this.typeForm === 'edit') {
        this.loadBriefing()
      } else if(this.typeForm === 'show') {
        this.loadBriefing()
        this.briefingForm.disable()
      } else {
        this.employeeService.canInsertClients().subscribe(employees => {
          this.attendances = employees
          this.briefingForm.get('attendance').setValue(this.attendances.filter((employee) => {
            return employee.name == this.authService.currentUser().employee.name
          }).pop())
        })
        this.briefingForm.controls.not_client.disable()
      }
    })
  }

  addListenerEstimatedTime() {
    let snackBarStateCharging

    this.briefingForm.get('estimated_time').valueChanges
    .debounceTime(1000)
    .subscribe(nextEstimatedTime => {
      snackBarStateCharging = this.snackBar.open('Aguarde...')
      this.briefingService.recalculateNextDate(nextEstimatedTime).subscribe((response) => {
        let data = response.data
        snackBarStateCharging.dismiss()
        /*
        let date = new Date(data.available_date)
        let formatedDate = ''

        if(date.getDate() < 10) {
          formatedDate += '0' + date.getDate() + '/'
        } else {
          formatedDate += date.getDate() + '/'
        }

        if((date.getMonth() + 1) < 10) {
          formatedDate += '0' + (date.getMonth() + 1) + '/'
        } else {
          formatedDate += (date.getMonth() + 1) + '/'
        }

        formatedDate += date.getFullYear()
        */

        this.briefingForm.controls.creation.setValue(data.creation)
        this.briefingForm.controls.available_date.setValue(data.available_date)

        snackBarStateCharging = this.snackBar.open('Considerando a mudança no tempo de produção, ' + data.creation.name + ' foi selecionado e a próxima data foi alterada.', '', {
          duration: 2000
        })
      })
      Observable.timer(500).subscribe(timer => snackBarStateCharging.dismiss())
    })
  }

  enableNotClient() {
    if(this.typeForm == 'show') {
      return
    }

    this.briefingForm.controls.not_client.enable()
    this.briefingForm.controls.not_client.setValidators([
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100)
    ])
    this.briefingForm.controls.client.disable()
    this.briefingForm.controls.client.clearValidators()
  }

  disableNotClient() {
    if(this.typeForm == 'show') {
      return
    }

    this.briefingForm.controls.not_client.disable()
    this.briefingForm.controls.not_client.clearValidators()
    this.briefingForm.controls.client.enable()
    this.briefingForm.controls.client.setValidators([
      Validators.required
    ])
  }

  uploadFile(inputFile: HTMLInputElement) {
    let filenames: string[] = []
    this.uploadFileService.uploadFile(inputFile).subscribe((data) => {
      filenames = data.names

      filenames.forEach((filename) => {
        this.addFile(filename)
      })
    })
  }

  previewFile(briefing: Briefing, filename: string, type: string) {
    this.briefingService.previewFile(briefing, type, filename)
  }

  download(briefing: Briefing, filename: string, type: String) {
    this.briefingService.download(briefing, type, filename).subscribe((blob) => {
      let fileUrl = URL.createObjectURL(blob)
      //window.open(fileUrl, '_blank')
      let anchor = document.createElement("a");
      anchor.download = filename;
      anchor.href = fileUrl;
      anchor.target = '_blank'
      anchor.click();
    })
  }

  loadBriefing() {
    let snackBarStateCharging = this.snackBar.open('Carregando briefing...')
    let briefingId = parseInt(this.route.snapshot.url[1].path)
    this.briefingService.briefing(briefingId).subscribe(briefing => {
      this.briefing = briefing

      this.briefingForm.controls.id.setValue(briefing.id)
      this.briefingForm.controls.job_type.disable()
      this.briefingForm.controls.job.setValue(briefing.job)
      this.briefingForm.controls.event.setValue(briefing.event)
      this.briefingForm.controls.deadline.setValue(briefing.deadline)
      this.briefingForm.controls.job_type.setValue(briefing.job_type)
      this.briefingForm.controls.agency.setValue(briefing.agency)

      if(briefing.agency != null) {
        this.enableNotClient()
        this.briefingForm.controls.not_client.setValue(briefing.not_client)
      } else {
        this.disableNotClient()        
        this.briefingForm.controls.client.setValue(briefing.client)
      }

      this.briefingForm.controls.attendance.setValue(briefing.attendance)
      this.briefingForm.controls.creation.setValue(briefing.creation)
      this.briefingForm.controls.rate.setValue(briefing.rate)
      this.briefingForm.controls.available_date.setValue(briefing.available_date)
      this.briefingForm.controls.last_provider.setValue(briefing.last_provider)
      this.briefingForm.controls.levels.setValue(briefing.levels)
      this.briefingForm.controls.main_expectation.setValue(briefing.main_expectation)
      this.briefingForm.controls.how_come.setValue(briefing.how_come)
      this.briefingForm.controls.competition.setValue(briefing.competition)
      this.briefingForm.controls.budget.setValue(briefing.budget)
      this.briefingForm.controls.presentations.setValue(briefing.presentations)
      this.briefingForm.controls.approval_expectation_rate.setValue(briefing.approval_expectation_rate)
      snackBarStateCharging.dismiss()

      this.briefingForm.controls.files = this.formBuilder.array([])

      for(var i = 0; i < briefing.files.length; i++) {
        this.addFile(briefing.files[i].filename)
      }
    })
  }

  compareJob(job1: Employee, job2: Employee) {
    return job1.id === job2.id
  }

  compareEmployee(employee1: Employee, employee2: Employee) {
    return employee1.id === employee2.id
  }

  compareJobType(job1: JobType, job2: JobType) {
    return job1.id === job2.id
  }

  compareAttendance(var1: Employee, var2: Employee) {
    return var1.id === var2.id
  }

  compareCreation(var1: Employee, var2: Employee) {
    return var1.id === var2.id
  }

  compareCompetition(var1: BriefingCompetition, var2: BriefingCompetition) {
    return var1.id === var2.id
  }

  comparePresentation(var1: BriefingPresentation, var2: BriefingPresentation) {
    return var1.id === var2.id
  }

  compareMainExpectation(var1: BriefingMainExpectation, var2: BriefingMainExpectation) {
    return var1.id === var2.id
  }

  compareLevel(var1: BriefingLevel, var2: BriefingLevel) {
    return var1.id === var2.id
  }

  compareHowCome(var1: BriefingHowCome, var2: BriefingHowCome) {
    return var1.id === var2.id
  }

  compareColumn(var1: any, var2: any) {
    return var1.id === var2.id
  }

  displayClient(client: Client) {
    return client.fantasy_name
  }

  displayAgency(agency: Client) {
    return agency.fantasy_name
  }

  addFile(file?: string) {
    const files = <FormArray>this.briefingForm.controls['files']

    files.push(this.formBuilder.group({
      name: this.formBuilder.control({value : (file ? file : ''), disabled: (this.typeForm === 'show' ? true : false)}),
    }))
  }

  deleteFile(i) {
    const files = <FormArray>this.briefingForm.controls['files']
    files.removeAt(i)
  }

  getFilesControls() {
    return (<FormArray>this.briefingForm.get('files')).controls
  }

  save() {
    this.briefingForm.updateValueAndValidity()
    let briefing = this.briefingForm.value

    if(ErrorHandler.formIsInvalid(this.briefingForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    this.briefingService.save(briefing).subscribe(data => {
      let snack = this.snackBar.open(data.message, '', {
        duration: 5000
      })

      snack.afterDismissed().subscribe(() => {
        if(data.status) {
          this.router.navigateByUrl('/schedule')
        }
      })
    })
  }

  edit() {
    this.briefingForm.updateValueAndValidity()
    let briefing = this.briefingForm.value
    briefing.id = this.briefing.id

    if(ErrorHandler.formIsInvalid(this.briefingForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    this.briefingService.edit(briefing).subscribe(data => {
      this.snackBar.open(data.message, '', {
        duration: data.status ? 1000 : 5000
      }).afterDismissed().subscribe(observer => {
        if(data.status) {
          this.router.navigateByUrl('/schedule')
        }
      })
    })
  }
}

