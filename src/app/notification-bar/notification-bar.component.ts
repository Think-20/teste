import { Component, OnInit, EventEmitter, Output } from '@angular/core';
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
  @Output() notificationLoadEmitter: EventEmitter<UserNotification[]> = new EventEmitter()

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
      let userNotifications = <UserNotification[]> dataInfo.pagination.data
      this.appendNotifications(userNotifications)
    })
  }

  appendNotifications(userNotifications: UserNotification[]) {
    let filteredUserNotifications = userNotifications.filter(userNotification => { return userNotification.special == 0})
    if(filteredUserNotifications.length == 0) return;

    this.notificationLoadEmitter.emit(userNotifications)
    this.userNotifications = filteredUserNotifications.concat(this.userNotifications)
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
      this.appendNotifications(userNotifications)
    })
  }

}
