import { AbstractControl } from "@angular/forms";
import { Client } from "../clients/client.model";

export function ObjectValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = control.value

  if((value.id == undefined && value != '')) {
    return { 'validClient' : true }
  }

  return null
}
