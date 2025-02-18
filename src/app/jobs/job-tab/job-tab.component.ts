import { Component, Input } from '@angular/core';
import { EJobTabStatus } from '../job-tab-status.enum';

@Component({
  selector: 'cb-job-tab',
  templateUrl: './job-tab.component.html',
  styleUrls: ['./job-tab.component.scss']
})
export class JobTabComponent {
  @Input() tab: string;
  @Input() status: EJobTabStatus;

  eJobTabStatus = EJobTabStatus;
}
