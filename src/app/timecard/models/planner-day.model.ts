import { IPlannerHour } from './planner-hour.model';

export interface IPlannerDay {
    date?: string;
    visible?: boolean;
    time_logs?: IPlannerHour[];
}