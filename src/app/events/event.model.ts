import { City } from '../address/city.model';
import { Employee } from '../employees/employee.model';
import { Contact } from '../contacts/contact.model';
import { Place } from '../places/place.model';

export class Event {
  id: number
  description: string
  edition: string
  note: string
  place: Place
  ini_date: string
  fin_date: string
  ini_hour: string
  fin_hour: string
  created_at: string
  updated_at: string
}
