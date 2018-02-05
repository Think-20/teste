import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { BriefingService } from '../briefing.service';
import { Briefing } from '../briefing.model';

@Component({
  selector: 'cb-briefing-list',
  templateUrl: './briefing-list.component.html',
  styleUrls: ['./briefing-list.component.css'],
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
@Injectable()
export class BriefingListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  search: FormControl
  briefings: Briefing[] = []
  searching = false

  constructor(
    private fb: FormBuilder,
    private briefingService: BriefingService,
    private snackBar: MatSnackBar
  ) { }

  total(briefings: Briefing[]) {
    return briefings.length
  }

  ngOnInit() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search
    })

    this.searching = true
    let snackBar = this.snackBar.open('Carregando briefings...')

    this.briefingService.briefings().subscribe(briefings => {
      this.searching = false
      this.briefings = briefings
      snackBar.dismiss()
    })

    this.search.valueChanges
      .do(() => this.searching = true)
      .debounceTime(500)
      .subscribe(value => {
        this.briefingService.briefings(value).subscribe(searchBriefings => {
          this.searching = false
          this.briefings = searchBriefings
        })
    })
  }

  delete(briefing: Briefing) {
    this.briefingService.delete(briefing.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if(data.status) {
        this.briefings.splice(this.briefings.indexOf(briefing), 1)
      }
    })
  }

}
