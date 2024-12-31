import { Employee } from '../employees/employee.model';
import { Place } from '../places/place.model';
import { Job } from '../jobs/job.model';
import { OrganizationModel } from 'app/shared/models/organization.model';

export class Event {
  id: number
  name: string
  edition: string
  note: string
  place: Place
  place_name: string;
  dismantling_date: string
  event_date: string
  installation_date: string
  ini_date: string
  fin_date: string
  ini_hour: string
  fin_hour: string
  ini_date_mounting: string
  fin_date_mounting: string
  ini_hour_mounting: string
  fin_hour_mounting: string
  ini_date_unmounting: string
  fin_date_unmounting: string
  ini_hour_unmounting: string
  fin_hour_unmounting: string
  organizer: string;
  organization_object?: OrganizationModel;
  email: string
  phone: string
  site: string
  plan: string
  regulation: string
  manual: string
  created_at: string
  updated_at: string
  employee_id?: number
  employee: Employee
  jobs?: Job[]
}
