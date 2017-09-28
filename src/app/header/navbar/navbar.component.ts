import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'cb-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  
  @Output() toggleMenuEmitter = new EventEmitter()

  constructor() { }

  ngOnInit() {
  }

  toggleMenu() {
    this.toggleMenuEmitter.emit()
  }

}
