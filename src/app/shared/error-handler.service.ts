import { FormGroup, FormControl, FormArray, AbstractControl } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/throw';

export class ErrorHandler {
    static capture(error: any) {
        let errorMessage: string = ErrorHandler.message(error)
        //console.log(errorMessage)
        return Observable.throw(errorMessage)
    }

    static message(error: any): string {
        let errorMessage: string

        if(error instanceof HttpResponse) {
            errorMessage = `Erro ${error.status} ao acessar a URL ${error.url} - ${error.statusText}`

            if(error.url === null) {
                errorMessage = 'Erro: servidor não encontrado.'
            } else if((error as any).text() != '') {
                try {
                    let data = JSON.parse((error as any).text())
                    if(error.status == 404) {
                      errorMessage = 'Arquivo não encontrado'
                    } else {
                      errorMessage = `Erro ${error.status} - ${data.message}`
                    }
                } catch(e) {
                  errorMessage = `Erro ${error.status} ao comunicar com o servidor.`
                }
            }
        } else {
          errorMessage = 'Não foi obtida nenhuma informação.'
        }

        return errorMessage
    }

    static formIsInvalid(form: FormGroup) {
        if(form.valid) {
          return false
        }

        Object.keys(form.controls).forEach((key) => {
            if(ErrorHandler.containsForm(form.get(key))) {
              return
            }
            if(!form.get(key).invalid) {
              return
            }
            (<FormControl>form.get(key)).markAsTouched()
            //console.log((<FormControl>form.get(key)), key)
        })

        return true
    }

    static formArrayIsInvalid(formArray: FormArray) {

    }

    static containsForm(field: any) {
        if((field instanceof FormArray)) {
          let formArray = <FormArray>field
          for(let i = 0; i < formArray.length; i++) {
              let formGroup = <FormGroup>formArray.controls[i]
              ErrorHandler.formIsInvalid(formGroup)
          }
          return true
        } else if((field instanceof FormGroup)) {
          let formGroup = <FormGroup>field
          ErrorHandler.formIsInvalid(formGroup)
          return true
        }
        return false
    }
}
