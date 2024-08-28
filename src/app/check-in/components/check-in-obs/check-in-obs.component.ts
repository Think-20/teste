import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cb-check-in-obs',
  templateUrl: './check-in-obs.component.html',
  styleUrls: ['./check-in-obs.component.css']
})
export class CheckInObsComponent implements OnInit {

  @Input() borderBottom = false;

  constructor() { }

  ngOnInit() {
  }

}
