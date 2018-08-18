import { Component, OnInit } from '@angular/core';
import { UserNotification } from './user-notification/user-notification.model';
import { UserNotificationService } from './user-notification/user-notification.service';

import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs';

@Component({
  selector: 'cb-notification-bar',
  templateUrl: './notification-bar.component.html',
  styleUrls: ['./notification-bar.component.css']
})
export class NotificationBarComponent implements OnInit {

  userNotifications: UserNotification[] = []
  timerSubscription: Subscription

  constructor(
    private userNotificationService: UserNotificationService
  ) { }

  ngOnInit() {
    this.loadRecents()
    this.listenInit()
  }

  ngOnDestroy() {
    this.timerSubscription.unsubscribe()
  }

  loadRecents() {
    this.userNotificationService.recents().subscribe(dataInfo => {
      this.userNotifications = dataInfo.pagination.data
    })
  }
  
  getUserBackground(userNotification: UserNotification) {
    return `'url(/assets/images/users/${userNotification.user_id}.jpg)'`
  }

  listenInit() {
    let interval = 60 * 1000
    this.timerSubscription = Observable.timer(5000, interval).subscribe(() => {
      this.listenNotifications()
    })
  }

  listenNotifications() {
    this.userNotificationService.listen().subscribe((userNotifications) => {
      if(userNotifications.length == 0) return;
      this.userNotifications = userNotifications.concat(this.userNotifications)
    })
  }

}
