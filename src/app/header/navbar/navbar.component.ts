import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'cb-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  @Input() opened: boolean
  @Output() toggleMenuEmitter = new EventEmitter()

  constructor() { }

  ngOnInit() {
  }

  toggleMenu() {
    this.opened = this.opened ? false : true
    this.toggleMenuEmitter.emit()
  }

}
