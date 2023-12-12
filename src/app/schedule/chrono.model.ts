import { DayOfWeek } from '../shared/date/days-of-week';
import { TaskItem } from "./task-item.model";

export class Chrono {
  day: number
  month: number
  year: number
  dayOfWeek: DayOfWeek
  items: TaskItem[]
  length?: number
  meta?: ScheduleGoal
}

export class ScheduleGoal {
  date: string
  anual: Goal
  mes: Goal
}

class Goal {
  porcentagemReais: number;
  atualReais: number;
  metaReais: number;
  porcentagemJobs: number;
  atualJobs: number;
  metaJobs: number;
}
