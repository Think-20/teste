import { Stand } from "../stand/stand.model";
import { Employee } from "../employees/employee.model";
import { BriefingPresentation } from "../briefing-presentations/briefing-presentation.model";
import { JobActivityInterface } from "../jobs/job-activity.interface";

export class Briefing implements JobActivityInterface {
  id: number
  stand?: Stand
  available_date: string
  responsible_id: number
  responsible?: Employee
  estimated_time: number
  presentations?: BriefingPresentation
}
