import { NotificationType } from "../notification-type/notification-type.model";
import { Employee } from "../../employees/employee.model";

export class Notification {
  id: number
  type_id?: number
  type?: NotificationType
  notifiable_id?: number
  notifiable_type?: string
  notifiable?: Notifiable
  info?: string
  date: string
  message: string
}

export interface Notifiable {
  id?: number

  getName(): string;
  getEmployee(): Employee | null;
  hasEmployee(): boolean;
}
