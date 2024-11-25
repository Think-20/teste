import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { Bank } from 'app/banks/bank.model';
import { BankService } from 'app/banks/bank.service';
import { PersonModel } from 'app/shared/models/person.model';
import { PersonService } from 'app/shared/services/person.service';

@Component({
  selector: 'cb-check-in-people',
  templateUrl: './check-in-people.component.html',
  styleUrls: ['./check-in-people.component.css']
})
export class CheckInPeopleComponent implements OnInit {

  form = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    agency: new FormControl(null, [Validators.required]),
    account_number: new FormControl(null, [Validators.required]),
    bank_id: new FormControl(null, [Validators.required]),
    cpf: new FormControl(null, []),
    cnpj: new FormControl(null, []),
  });

  banks: Bank[] = [];

  constructor(
    public dialog: MatDialogRef<CheckInPeopleComponent>,
    private snackBar: MatSnackBar,
    private bankService: BankService,
    private personService: PersonService,
  ) { }

  ngOnInit(): void {
    this.bankService.banks().subscribe(banks => {
      this.banks = banks;
    });
  }

  close(people?: PersonModel): void {
    if (people) {
      this.dialog.close(people);

      return;
    }

    this.dialog.close();
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    let snackBarStateCharging: MatSnackBarRef<SimpleSnackBar>;

    this.personService.save({ ...this.form.value, bank_account_type_id: 1 })
      .do(() => snackBarStateCharging = this.snackBar.open('Salvando...'))
      .subscribe(response => {
        snackBarStateCharging.dismiss();

        if (response.message) {
          snackBarStateCharging = this.snackBar.open(response.message);
          
          setTimeout(() => snackBarStateCharging.dismiss(), 2000);
        }
        
        if (response.object) {
          this.close(response.object);
        }
      });
  }

}
