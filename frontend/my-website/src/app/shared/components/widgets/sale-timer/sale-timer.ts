import { Component, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-sale-timer',
  imports: [TranslateModule],
  templateUrl: './sale-timer.html',
  styleUrl: './sale-timer.scss',
})
export class SaleTimer {
  readonly startDate = input<string | null>();
  readonly endDate = input<string | null>();
  readonly title = input<string | null>();

  public remainingTime: TimeLeft | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null; // Store the interval reference

  ngOnInit() {
    this.startTimer();
  }

  ngOnChanges() {
    this.startTimer(); // Re-start timer if inputs change
  }

  ngOnDestroy() {
    this.stopTimer(); // Clear interval on component destruction
  }

  private startTimer() {
    const startDate = this.startDate();
    const endDate = this.endDate();
    if (startDate && endDate) {
      new Date(startDate).getTime();
      new Date(endDate).getTime();
      new Date().getTime();

      // if (now > startDateTime && endDateTime > now) {
      this.updateTimer(); // Initial call to display the remaining time immediately.

      // Update the timer every second
      this.timerInterval = setInterval(() => {
        this.updateTimer();
      }, 1000);
      // }
    }
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private updateTimer() {
    const startDate = this.startDate();
    const endDate = this.endDate();
    if (startDate && endDate) {
      const startDateTime = new Date(startDate).getTime();
      const endDateTime = new Date(endDate).getTime();
      const now = new Date().getTime();

      let targetDate = endDateTime; // Assume the target date is the end date

      if (now < startDateTime) {
        targetDate = startDateTime;
      } else if (now >= endDateTime) {
        this.remainingTime = {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
        this.stopTimer(); // Stop timer if end date is reached
        return;
      }

      this.calculateTimeDifference(targetDate);
    }
  }

  private calculateTimeDifference(targetDate: number) {
    const now = new Date().getTime();
    const timeDiff = targetDate - now;

    this.remainingTime = {
      days: Math.floor(timeDiff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((timeDiff % (1000 * 60)) / 1000),
    };
  }
}
