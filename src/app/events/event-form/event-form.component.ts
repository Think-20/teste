import { Component, OnInit, Injectable, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { Event } from '../event.model';
import { EventService } from '../event.service';

import { CityService } from '../../address/city.service';
import { StateService } from '../../address/state.service';
import { EmployeeService } from '../../employees/employee.service';
import { AuthService } from '../../login/auth.service';
import { Employee } from '../../employees/employee.model';
import { City } from '../../address/city.model';
import { State } from '../../address/state.model';
import { Contact } from '../../contacts/contact.model';

import { ErrorHandler } from '../../shared/error-handler.service';
import { Patterns } from '../../shared/patterns.model';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import { ObjectValidator } from '../../shared/custom-validators';
import { Location } from '@angular/common';

@Component({
  selector: 'cb-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css'],
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
      ]))),
    ])
  ]
})
@Injectable()
export class EventFormComponent implements OnInit {

  @Input('mode') typeForm: string
  @Input('withHeader') withHeader: boolean = true
  rowAppearedState = 'ready'
  event: Event
  cities: Observable<City[]>
  states: Observable<State[]>
  employees: Employee[]
  eventForm: FormGroup
  contactsArray: FormArray

constructor(
    private stateService: StateService,
    private cityService: CityService,
    private employeeService: EmployeeService,
    private eventService: EventService,
    private authService: AuthService,
    private location: Location,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    let snackBarStateCharging
    this.typeForm = this.route.snapshot.url[0].path

    let stateControl: FormControl = this.formBuilder.control('', [Validators.required, ObjectValidator])
    let cityControl: FormControl = this.formBuilder.control('', [Validators.required, ObjectValidator])
    let eventTypeControl: FormControl = this.formBuilder.control('', [Validators.required])
    let comissionControl: FormControl = this.formBuilder.control('', [Validators.required])
    let eventStatusControl: FormControl = this.formBuilder.control('', [Validators.required])
    let employeeControl: FormControl = this.formBuilder.control('', [Validators.required])

    this.eventForm = this.formBuilder.group({
      name: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]),
      fantasy_name: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]),
      site: this.formBuilder.control('', [
        Validators.minLength(7),
      ]),
      event_type: eventTypeControl,
      comission: comissionControl,
      event_status: eventStatusControl,
      employee: employeeControl,
      rate: this.formBuilder.control(''),
      cnpj: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(14)
      ]),
      ie: this.formBuilder.control(''),
      mainphone: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(10)
      ]),
      secundaryphone: this.formBuilder.control('', [
        Validators.minLength(10)
      ]),
      note: this.formBuilder.control(''),
      external: this.formBuilder.control(''),
      external_toggle: this.formBuilder.control(''),
      street: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]),
      number: this.formBuilder.control('', [
        Validators.maxLength(11)
      ]),
      neighborhood: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30)
      ]),
      complement: this.formBuilder.control('', [
        Validators.maxLength(255)
      ]),
      cep: this.formBuilder.control('', [
        Validators.required
      ]),
      city: cityControl,
      state: stateControl,
      contacts: this.formBuilder.array([])
    })

    this.eventForm.controls.external_toggle.valueChanges.subscribe(() => {
      this.toggleExternal()
    })

    if(this.typeForm === 'edit') {
      this.loadEvent()
    }

    stateControl.valueChanges
      .do(stateName => {
         snackBarStateCharging = this.snackBar.open('Aguarde...')
      })
      .debounceTime(500)
      .subscribe(stateName => {
        this.states = this.stateService.states(stateName)
        Observable.timer(500).subscribe(timer => snackBarStateCharging.dismiss())
      })

    cityControl.valueChanges
      .do(stateName => {
         snackBarStateCharging = this.snackBar.open('Aguarde...')
      })
      .debounceTime(500)
      .subscribe(cityName => {
        let stateId = stateControl.value.id || stateControl.value
        this.cities = this.cityService.cities(stateId, cityName)
        Observable.timer(500).subscribe(timer => snackBarStateCharging.dismiss())
      })
  }

  toggleExternal() {
    if(this.eventForm.controls.external_toggle.value) {
      this.eventForm.controls.external.setValue(1)
      this.eventForm.controls.cnpj.clearValidators()
      this.eventForm.controls.cnpj.disable()
    } else {
      this.eventForm.controls.external.setValue(0)
      this.eventForm.controls.cnpj.clearValidators()
      this.eventForm.controls.cnpj.setValidators([
        Validators.required,
        Validators.minLength(14)
      ])
      this.eventForm.controls.cnpj.enable()
      this.eventForm.controls.cnpj.updateValueAndValidity()
    }
  }

  loadEvent() {
    let snackBarStateCharging = this.snackBar.open('Carregando evente...')
    let eventId = parseInt(this.route.snapshot.url[1].path)
    this.eventService.event(eventId).subscribe(event => {
      snackBarStateCharging.dismiss()
      this.event = event

      this.eventForm.controls.name.setValue(this.event.name)
      this.eventForm.controls.fantasy_name.setValue(this.event.fantasy_name)
      this.eventForm.controls.cnpj.setValue(this.event.cnpj)
      this.eventForm.controls.external_toggle.setValue(this.event.external == 1 ? true : false)
      this.eventForm.controls.mainphone.setValue(this.event.mainphone)
      this.eventForm.controls.secundaryphone.setValue(this.event.secundaryphone)
      this.eventForm.controls.employee.setValue(this.event.employee)
      this.eventForm.controls.site.setValue(this.event.site)
      this.eventForm.controls.note.setValue(this.event.note)
      this.eventForm.controls.rate.setValue(this.event.rate)
      this.eventForm.controls.cep.setValue(this.event.cep)
      this.eventForm.controls.street.setValue(this.event.street)
      this.eventForm.controls.number.setValue(this.event.number)
      this.eventForm.controls.neighborhood.setValue(this.event.neighborhood)
      this.eventForm.controls.city.setValue(this.event.city)
      this.eventForm.controls.state.setValue(this.event.city.state)
      this.eventForm.controls.complement.setValue(this.event.complement)

      this.eventForm.controls.contacts.setValue([])

      for(let contact of event.contacts) {
        this.addContact(contact)
      }
    })
  }

  get contacts() { return this.eventForm.get('contacts'); }

  compareEmployee(employee1: Employee, employee2: Employee) {
    return employee1.id === employee2.id
  }

  addContact(contact?: Contact) {
    const contacts = <FormArray>this.eventForm.controls['contacts']

    contacts.push(this.formBuilder.group({
      id: this.formBuilder.control(contact ? contact.id : '' || ''),
      name: this.formBuilder.control(contact ? contact.name : '' || '', [
        Validators.required,
        Validators.minLength(3)
      ]),
      department: this.formBuilder.control(contact ? contact.department : '' || '', [
        Validators.required,
        Validators.minLength(3)
      ]),
      email: this.formBuilder.control(contact ? contact.email : '', [
        Validators.required,
        Validators.pattern(Patterns.email),
        Validators.maxLength(80)
      ]),
      cellphone: this.formBuilder.control(contact ? contact.cellphone : '' || '', [
        Validators.minLength(10),
        Validators.pattern(Patterns.phone)
      ])
    }))
  }

  deleteContact(i) {
    const contacts = <FormArray>this.eventForm.controls['contacts']
    if(contacts.length > 1) contacts.removeAt(i)
  }

  displayState(state: State) {
    return state.code
  }

  displayEmployee(employee: Employee) {
    return employee.name
  }

  displayCity(city: City) {
    return city.name
  }

  getContactsControls(eventForm: FormGroup) {
    return (<FormArray>this.eventForm.get('contacts')).controls
  }

  save(event: Event) {
    if(ErrorHandler.formIsInvalid(this.eventForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    this.eventService.save(event).subscribe(data => {
      let snackbar = this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if(data.status) {
        snackbar.afterDismissed().subscribe(() => {
          this.location.back()
        })
      }
    })
  }

  edit(event: Event, eventId: number) {
    if(ErrorHandler.formIsInvalid(this.eventForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    event.id = eventId

    this.eventService.edit(event).subscribe(data => {
      if(data.status) {
        this.router.navigateByUrl('/events')
      } else {
        this.snackBar.open(data.message, '', {
          duration: data.status ? 1000 : 5000
        })
      }
    })
  }
}

