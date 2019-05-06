import { Employee } from "../employees/employee.model";
import { JobActivity } from "../job-activities/job-activity.model";
import { Job } from "../jobs/job.model";
import { TaskItem } from "./task-item.model";
import { ProjectFile } from "../projects/project-file.model";
import { Budget } from "../budgets/budget.model";
import { SpecificationFile } from "app/specification/specification-file.model";

export class Task {
  id: number
  available_date: string
  responsible_id: number
  responsible?: Employee
  duration: number
  job_activity_id: number
  job_activity?: JobActivity
  job_id: number
  job?: Job
  reopened?: number
  items?: TaskItem[]
  project_files?: ProjectFile[]
  specification_files?: SpecificationFile[]
  budget?: Budget
  project_file_done?: number
  task_id?: number
  task?: Task
}
