import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { Briefing } from '../briefing.model';
import { BriefingService } from '../briefing.service';

import { EmployeeService } from '../../employees/employee.service';
import { JobService } from '../../jobs/job.service';
import { JobTypeService } from '../../job-types/job-type.service';
import { ClientService } from '../../clients/client.service';
import { BriefingCompetitionService } from '../../briefing-competitions/briefing-competition.service';
import { BriefingPresentationService } from '../../briefing-presentations/briefing-presentation.service';
import { BriefingSpecialPresentationService } from '../../briefing-special-presentations/briefing-special-presentation.service';
import { AuthService } from '../../login/auth.service';
import { UploadFileService } from '../../shared/upload-file.service';

import { Employee } from '../../employees/employee.model';
import { Job } from '../../jobs/job.model';
import { JobType } from '../../job-types/job-type.model';
import { Client } from '../../clients/client.model';
import { BriefingCompetition } from '../../briefing-competitions/briefing-competition.model';
import { BriefingPresentation } from 'app/briefing-presentations/briefing-presentation.model';
import { BriefingSpecialPresentation } from 'app/briefing-special-presentations/briefing-special-presentation.model';

import { ErrorHandler } from '../../shared/error-handler.service';
import { Patterns } from '../../shared/patterns.model';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import { Stand } from 'app/stand/stand.model';
import { isUndefined } from 'util';

@Component({
  selector: 'cb-briefing-form',
  templateUrl: './briefing-form.component.html',
  styleUrls: ['./briefing-form.component.css']
})
@Injectable()
export class BriefingFormComponent implements OnInit {

  typeForm: string
  standItemState = 'hidden'
  briefing: Briefing
  jobs: Job[]
  job_types: JobType[]
  clients: Client[]
  exhibitors: Client[]
  agencies: Client[]
  competitions: BriefingCompetition[]
  employees: Employee[]
  attendances: Employee[]
  creations: Employee[]
  presentations: BriefingPresentation[]
  special_presentations: BriefingSpecialPresentation[]
  briefingForm: FormGroup

  constructor(
    private jobService: JobService,
    private jobTypeService: JobTypeService,
    private clientService: ClientService,
    private uploadFileService: UploadFileService,
    private employeeService: EmployeeService,
    private competitionService: BriefingCompetitionService,
    private presentationService: BriefingPresentationService,
    private specialPresentationService: BriefingSpecialPresentationService,
    private briefingService: BriefingService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    let snackBarStateCharging
    this.typeForm = this.route.snapshot.url[0].path

    this.briefingForm = this.formBuilder.group({
      id: this.formBuilder.control({value: '', disabled: true}),
      job: this.formBuilder.control('', [Validators.required]),
      exhibitor: this.formBuilder.control('', [Validators.required]),
      event: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(150)
      ]),
      deadline: this.formBuilder.control('', [Validators.required]),
      job_type: this.formBuilder.control('', [Validators.required]),
      agency: this.formBuilder.control('', [Validators.required]),
      attendance: this.formBuilder.control('', [Validators.required]),
      creation: this.formBuilder.control('', [Validators.required]),
      area: this.formBuilder.control('', [
        Validators.required,
        Validators.pattern(Patterns.float),
        Validators.maxLength(10),
      ]),
      budget: this.formBuilder.control('', [
        Validators.required,
        Validators.pattern(Patterns.float),
        Validators.maxLength(13),
      ]),
      area_budget: this.formBuilder.control(''),
      rate: this.formBuilder.control(''),
      stand: this.formBuilder.group({}),
      competition: this.formBuilder.control('', [Validators.required]),
      latest_mounts_file: this.formBuilder.control('', [Validators.required]),
      colors_file: this.formBuilder.control('', [Validators.required]),
      guide_file: this.formBuilder.control('', [Validators.required]),
      presentation: this.formBuilder.control('', [Validators.required]),
      special_presentation: this.formBuilder.control('', [Validators.required]),
      approval_expectation_rate: this.formBuilder.control(''),
      think_history: this.formBuilder.control('')
    })

    this.briefingForm.get('exhibitor').valueChanges
    .do(exhibitorName => {
        snackBarStateCharging = this.snackBar.open('Aguarde...')
    })
    .debounceTime(500)
    .subscribe(exhibitorName => {
      this.clientService.clients(exhibitorName).subscribe((pagination) => {
        this.exhibitors = pagination.data.filter((client) => {
          return client.type.description === 'Expositor'
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
      this.clientService.clients(name).subscribe((pagination) => {
        this.agencies = pagination.data.filter((client) => {
          return client.type.description === 'Agência'
        })
      })
      Observable.timer(500).subscribe(timer => snackBarStateCharging.dismiss())
    })

    this.briefingForm.get('area').valueChanges.subscribe(() => {
      this.updateAreaBudget();
    })

    this.briefingForm.get('budget').valueChanges.subscribe(() => {
      this.updateAreaBudget();
    })

    snackBarStateCharging = this.snackBar.open('Aguarde...')

    this.briefingService.loadFormData().subscribe(response => {
      let data = response.data
      this.jobs = data.jobs
      this.job_types = data.job_types
      this.creations = data.creations
      this.attendances = data.attendances
      this.competitions = data.competitions
      this.presentations = data.presentations
      this.special_presentations = data.special_presentations
      snackBarStateCharging.dismiss()

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
      }
    })
  }

  updateAreaBudget() {
    let area = parseFloat(String(this.briefingForm.get('area').value).replace(',', '.'))
    let budget = parseFloat(String(this.briefingForm.get('budget').value).replace(',', '.'))
    let area_budget = (isNaN(area) || isNaN(budget)) ? '' : String((budget / area).toFixed(2)).replace('.', ',')

    this.briefingForm.get('area_budget').setValue(area_budget)
  }

  uploadFile(key: string, inputFile: HTMLInputElement) {
    this.uploadFileService.uploadFile(this.briefingForm, key, inputFile)
  }

  previewFile(briefing: Briefing, type: string,  file: string) {
    this.briefingService.previewFile(briefing, type, file)
  }

  download(briefing: Briefing, filename: string, type: String, file: String) {
    this.briefingService.download(briefing, type, file).subscribe((blob) => {
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
      this.briefingForm.controls.exhibitor.setValue(briefing.exhibitor)
      this.briefingForm.controls.event.setValue(briefing.event)
      this.briefingForm.controls.deadline.setValue(briefing.deadline)
      this.briefingForm.controls.job_type.setValue(briefing.job_type)
      this.briefingForm.controls.agency.setValue(briefing.agency)
      this.briefingForm.controls.attendance.setValue(briefing.attendance)

      this.briefingForm.controls.creation.setValue(briefing.creation)
      this.briefingForm.controls.area.setValue(briefing.area.toString().replace('.',','))
      this.briefingForm.controls.budget.setValue(briefing.budget.toString().replace('.',','))
      this.updateAreaBudget()
      this.briefingForm.controls.rate.setValue(briefing.rate)
      this.briefingForm.controls.competition.setValue(briefing.competition)
      this.briefingForm.controls.latest_mounts_file.setValue(briefing.latest_mounts_file)
      this.briefingForm.controls.colors_file.setValue(briefing.colors_file)
      this.briefingForm.controls.guide_file.setValue(briefing.guide_file)
      this.briefingForm.controls.presentation.setValue(briefing.presentation)
      this.briefingForm.controls.special_presentation.setValue(briefing.special_presentation)
      this.briefingForm.controls.approval_expectation_rate.setValue(briefing.approval_expectation_rate)
      snackBarStateCharging.dismiss()
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

  compareSpecialPresentation(var1: BriefingSpecialPresentation, var2: BriefingSpecialPresentation) {
    return var1.id === var2.id
  }

  compareColumn(var1: any, var2: any) {
    return var1.id === var2.id
  }

  displayExhibitor(exhibitor: Client) {
    return exhibitor.fantasy_name
  }

  displayAgency(agency: Client) {
    return agency.fantasy_name
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
      this.snackBar.open(data.message, '', {
        duration: 5000
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
        this.loadBriefing()
      })
    })
  }
}

