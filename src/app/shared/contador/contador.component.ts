import { Component } from '@angular/core';

@Component({
  selector: 'cb-contador',
  templateUrl: './contador.component.html',
  styleUrls: ['./contador.component.css']
})
export class ContadorComponent {
  currentHour: number = 0;
  currentMinute: number = 0;
  currentSecond: number = 0;
  maxHour: number = 18;
  intervalId: any;

  startCounter(date: Date): void {
    const ms = new Date().getTime() - date.getTime();

    this.currentHour = Math.floor(ms / (1000 * 60 * 60));

    this.currentMinute = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    this.currentSecond = Math.floor((ms % (1000 * 60)) / 1000);

    clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      this.incrementTime();
    }, 1000);
  }

  private incrementTime(): void {
    if (this.currentHour >= this.maxHour) {
      clearInterval(this.intervalId);

      this.currentHour = this.maxHour;

      this.currentMinute = 0;

      this.currentSecond = 0;

      return;
    }

    this.currentSecond++;

    if (this.currentSecond === 60) {
      this.currentSecond = 0;
      this.currentMinute++;
    }

    if (this.currentMinute === 60) {
      this.currentMinute = 0;
      this.currentHour++;
    }
  }
}
