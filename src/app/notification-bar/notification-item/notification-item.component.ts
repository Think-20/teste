import { Component, OnInit, Input } from '@angular/core';
import { UserNotification } from '../user-notification/user-notification.model';

@Component({
  selector: 'cb-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.css']
})
export class NotificationItemComponent implements OnInit {

  @Input() printNew: boolean = false
  @Input() userNotification: UserNotification

  constructor() { }

  ngOnInit() {
  }

  getUserBackground() {
    return `'url(/assets/images/users/${this.userNotification.user_id}.jpg)'`
  }

}
