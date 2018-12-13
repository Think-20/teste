import { DayOfWeek } from "../shared/date/days-of-week";
import { Task } from "./task.model";

export class Chrono {
  day: number
  month: number
  dayOfWeek: DayOfWeek
  tasks: Task[]
  length?: number
}
