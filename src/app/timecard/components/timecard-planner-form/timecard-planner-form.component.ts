import { DatePipe } from '@angular/common';
import { TimecardService } from './../../timecard.service';
import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from 'app/login/auth.service';
import { IPlannerLog } from 'app/timecard/models/planner-log.model';
import { distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { TimecardPlace } from 'app/timecard/timecard-place/timecard-place.model';
import { Subject } from 'rxjs';
import { MatSelect } from '@angular/material';

@Component({
  selector: 'cb-timecard-planner-form',
  templateUrl: './timecard-planner-form.component.html',
  styleUrls: ['./timecard-planner-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimecardPlannerFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() places: TimecardPlace[] = [];
  @Input() date: Date;
  @Input() log: IPlannerLog;

  @Output() changeLog = new EventEmitter<IPlannerLog>();

  isDiretoria = false;

  categories = [
    {
      'name': 'Operacional',
      'subcategories': [
        'Auxilio produção',
        'Check in',
        'Compilação de informações de briefing',
        'Cronograma',
        'Deslocamento',
        'Documentação',
        'E-mail',
        'Memorial descritivo',
        'Pesquisa de mercado',
        'Prestação de contas',
        'Redes sociais',
        'Sistema',
        'Tarefas adm',
        'Validação de Projetos'
      ]
    },
    {
      'name': 'Reuniões',
      'subcategories': [
        'Jurídica',
        'Reunião Briefing',
        'Reunião Diretoria',
        'Reunião Geral',
        'Reunião de Apresentação de projetos',
        'Reunião de Criação',
        'Reunião de Orçamento',
        'Reunião de produção'
      ]
    },
    {
      'name': 'Visitas',
      'subcategories': [
        'Entrega de Evento',
        'Eventos do mercado',
        'Montagem',
        'Prospecções de clientes Novos',
        'Relacionamento com cientes',
        'Tecnica'
      ]
    }
  ];

  subcategories: string[] = [];

  public get modality() : string {
    const modalityId = this.form.controls.modality_id;
    
    if (!modalityId || !modalityId.value) {
      return null;
    }

    const modality = this.places.find(x => x.id === modalityId.value);

    if (!modality) {
      return null;
    }

    return modality.description;
  }
  

  form = new FormGroup({
    category: new FormControl(null, []),
    subcategory: new FormControl(null, []),
    modality_id: new FormControl(null, []),
    description: new FormControl(null, []),
  });

  onDestroy$ = new Subject<boolean>();

  constructor(
    private datePipe: DatePipe,
    private authService: AuthService,
    private timecardService: TimecardService,
  ) { }

  ngOnInit() {
    const currentUser = this.authService.currentUser();

    this.isDiretoria = currentUser.employee.department_id === 1;
  }

  ngAfterViewInit(): void {
    this.observeChangeInForm();

    this.observeChangeInCategory();
  }

  private observeChangeInForm(): void{
    this.form.valueChanges
      .debounceTime(1000)
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.save();
      });
  }

  private observeChangeInCategory(): void {
    this.form.controls.category.valueChanges
      .pipe(
        tap(category => this.categoryChangeSideEffect(category)),
        takeUntil(this.onDestroy$),
      )
      .subscribe();
  }
  
  private categoryChangeSideEffect(category: string | null): void {
    this.form.controls.subcategory.patchValue(null);

    this.loadSubcategoriesByCategory(category).then();
  }

  private loadSubcategoriesByCategory(category: string | null): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!category) {
        this.subcategories = [];

        return resolve();
      }
      
      const categoryObject = this.categories.find(c => c.name === category);

      if (!categoryObject) {
        this.subcategories = [];

        return resolve();
      }

      this.subcategories = [...categoryObject.subcategories];

      return resolve();
    });
  }

  loadSubcategoriesByCategoryAndOpen(category: string | null, subcategorySelect: MatSelect): void {
    this.loadSubcategoriesByCategory(category).then(() => {
      if (!this.isDiretoria) {
        setTimeout(() => subcategorySelect.open());
      }
    });
  }

  save = () => {
    if (this.isDiretoria || this.form.invalid) {
      return;
    }

    const log: IPlannerLog = {
      date: this.datePipe.transform(this.date, 'yyyy-MM-dd HH:mm'),
      category: this.form.value.category,
      subcategory: this.form.value.subcategory,
      modality_id: this.form.value.modality_id || null,
      description: this.form.value.description,
    };

    if (this.log.id) {
      log.id = this.log.id;
    }

    (this.log.id
      ? this.timecardService.putLog(log)
      : this.timecardService.postLog(log))
      .subscribe({
        next: response => {
          this.log = { ...response.object };

          this.changeLog.emit(this.log);
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
