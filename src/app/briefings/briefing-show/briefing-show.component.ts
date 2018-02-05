import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { BriefingService } from '../briefing.service';
import { Briefing } from '../briefing.model';

@Component({
  selector: 'cb-briefing-show',
  templateUrl: './briefing-show.component.html',
  styleUrls: ['./briefing-show.component.css']
})
export class BriefingShowComponent implements OnInit {

  briefing: Briefing

  constructor(
    private route: ActivatedRoute,
    private briefingService: BriefingService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    let snackBar
    let briefingId = this.route.snapshot.params['id']
    snackBar = this.snackBar.open('Carregando briefing...')

    this.briefingService.briefing(briefingId)
    .subscribe(briefing => {
      this.briefing = briefing
      snackBar.dismiss()
    })
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

}
