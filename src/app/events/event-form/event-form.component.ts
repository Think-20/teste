import { Component, OnInit, Injectable, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { Event } from '../event.model';
import { EventService } from '../event.service';
import { AuthService } from '../../login/auth.service';

import { ErrorHandler } from '../../shared/error-handler.service';
import { Patterns } from '../../shared/patterns.model';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import { ObjectValidator } from '../../shared/custom-validators';
import { Location } from '@angular/common';
import { Place } from '../../places/place.model';
import { PlaceService } from '../../places/place.service';
import { isObject } from 'util';

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
  places: Place[]
  eventForm: FormGroup
  contactsArray: FormArray

constructor(
    private placeService: PlaceService,
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

    this.eventForm = this.formBuilder.group({
      description: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]),
      edition: this.formBuilder.control('', [
        Validators.maxLength(20)
      ]),
      note: this.formBuilder.control('', [
        Validators.minLength(3),
        Validators.maxLength(1000)
      ]),
      place: this.formBuilder.control('', [
        Validators.required,
        ObjectValidator
      ]),
      ini_date: this.formBuilder.control('', [
        Validators.required
      ]),
      fin_date: this.formBuilder.control('', [
        Validators.required
      ]),
      ini_hour: this.formBuilder.control('', [
        Validators.required
      ]),
      fin_hour: this.formBuilder.control('', [
        Validators.required
      ]),
    })

    this.listenPlaces()

    if(['edit', 'show'].indexOf(this.typeForm) > -1) {
      this.loadEvent()
    }
  }

  listenPlaces() {
    let snackBarStateCharging
    this.eventForm.controls.place.valueChanges.subscribe((value) => {
      if( isObject(value) ) return false

      snackBarStateCharging = this.snackBar.open('Aguarde...')
      this.placeService.places({ search: value })
        .do(value => {
          snackBarStateCharging.dismiss()
        })
        .debounceTime(500)
        .subscribe((dataInfo) => {
          this.places = <Place[]> dataInfo.pagination.data
        })
    })
  }

  loadEvent() {
    let snackBarStateCharging = this.snackBar.open('Carregando evento...')
    let eventId = parseInt(this.route.snapshot.url[1].path)
    this.eventService.event(eventId).subscribe(event => {
      snackBarStateCharging.dismiss()
      this.event = event

      this.eventForm.controls.description.setValue(this.event.description)
      this.eventForm.controls.edition.setValue(this.event.edition)
      this.eventForm.controls.note.setValue(this.event.note)
      this.eventForm.controls.place.setValue(this.event.place)
      this.eventForm.controls.ini_date.setValue(this.event.ini_date)
      this.eventForm.controls.fin_date.setValue(this.event.fin_date)
      this.eventForm.controls.ini_hour.setValue(this.event.ini_hour)
      this.eventForm.controls.fin_hour.setValue(this.event.fin_hour)

      if(this.typeForm == 'show') {
        this.eventForm.disable()
      }
    })
  }

  displayPlace(place: Place) {
    return place.name
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

