import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { UserNotification } from '../../notification-bar/user-notification/user-notification.model';

@Component({
  selector: 'cb-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  @Input() opened: boolean
  @Output() toggleMenuEmitter = new EventEmitter()
  notificationQuantity = 0

  constructor() { }

  ngOnInit() {
    let menu = localStorage.getItem('menu')

    if(menu === 'closed') {
      this.toggleMenu()
    }
  }

  toggleMenu() {
    this.opened = this.opened ? false : true
    localStorage.setItem('menu', this.opened ? 'open' : 'closed')
    this.toggleMenuEmitter.emit(this.opened)
  }

  notificationsLoaded(userNotifications: UserNotification[]) {
    console.log('Notificações carregadas... {{' + userNotifications.length + '}}')
  }
}
