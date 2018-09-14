import { Component, OnInit, Input } from '@angular/core';
import { UserNotification } from '../user-notification/user-notification.model';
import { NotificationType } from '../notification-type/notification-type.model';
import { Notification } from '../notification/notification.model';
import { Router } from '@angular/router';
import { TaskService } from '../../schedule/task.service';
import { MatSnackBar } from '@angular/material';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'cb-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.css']
})
export class NotificationItemComponent implements OnInit {

  @Input() printNew: boolean = false
  @Input() userNotification: UserNotification

  constructor(
    private router: Router,
    private datePipe: DatePipe,
    private snackbar: MatSnackBar,
    private taskService: TaskService
  ) { }

  ngOnInit() {
  }

  goTo(notification: Notification) {
    let url
    switch(notification.type.description) {
      case 'Cadastro de cliente': {
        url = '/clients/show/' + notification.info
        break
      }
      case 'Alteração de cliente': {
        url = '/clients/show/' + notification.info
        break
      }
      case 'Deleção de cliente': {
        url = '/clients/list'
        break
      }
      case 'Cadastro de job': {
        url = '/jobs/show/' + notification.info
        break
      }
      case 'Alteração de job': {
        url = '/jobs/show/' + notification.info
        break
      }
      case 'Deleção de job': {
        url = '/jobs/list'
        break
      }
      case 'Aprovação de job': {
        url = '/jobs/show/' + notification.info
        break
      }
      case 'Sinalização de job': {
        url = '/jobs/show/' + notification.info
        break
      }
      case 'Cadastro de tarefa': {
        return this.goToTask(notification.info)
      }
      case 'Alteração de tarefa': {
        return this.goToTask(notification.info)
      }
      case 'Movimentação de tarefa': {
        return this.goToTask(notification.info)
      }
      case 'Deleção de tarefa': {
        url = '/schedule'
        break
      }
    }

    this.router.navigateByUrl(url)
  }

  goToTask(taskId) {
    let snackbar = this.snackbar.open('Aguarde...')
    this.taskService.task(taskId).subscribe((task) => {
      snackbar.dismiss()
      if(task) {
        this.router.navigate([`/schedule`], {
          queryParams: { date: this.datePipe.transform(task.available_date, 'yyyy-MM-dd') }
        })
      } else {
        this.snackbar.open('A tarefa que você busca não existe.', '', {
          duration: 3000
        })
      }
    })
  }

  getUserBackground() {
    return `'url(/assets/images/users/${this.userNotification.user_id}.jpg)'`
  }

}
