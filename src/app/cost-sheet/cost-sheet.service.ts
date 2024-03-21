import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material';
import { API } from 'app/app.api';
import { AuthService } from 'app/login/auth.service';
import { ErrorHandler } from 'app/shared/error-handler.service';
import { Observable, of } from 'rxjs';
import { CostSheet, CostSheetGroup } from './cost-sheet.model';

@Injectable()
export class CostSheetService {
  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) { }


  getCostSheets(): Observable<CostSheetGroup[]> {
    const costSheets: CostSheet[] = [
        {
            numero: "001",
            categoria: "Marcenaria",
            favorecido: {
                id: 1,
                nome: "Erivaldo Souza"
            },
            descricao: "",
            quantidade: 100,
            unidade: "M2",
            valor_previsto: 100000.00,
            valor_realizado: 75000.00,
            valor_previsto_realizado_percentual: 75,
            negociacao: {
                nome_responsavel: "Maurício Souza",
                data: new Date(),
            },
            solicitante: {
                nome: "Ivanildo Alves",
                data: new Date(),
            },
            aprovacao: {
                nome_responsavel: "Pamela Cristina",
                data: new Date(),
            },
            aceite: {
                nome_responsavel: "Carolina Tansela",
                data: new Date(),
            },
            nf: "012",
            condicao: ["á vista"],
            vencimento: {
                data: new Date("2024-12-31"),
                parcela_atual: 1,
                total_parcelas: 4
            },
            pagamento: ["vencido"]
        }
    ]

    const costSheetGroups: CostSheetGroup[] = [
        {
            id: 1,
            percentual: 35,
            titulo: "Mão de Obra",
            valor: 75000.00,
            cost_sheets: [...costSheets, ...costSheets, ...costSheets, ...costSheets],
            aprovacao: {
                nome_responsavel: "Pamela Cristina",
                data: new Date(),
                percentual: 30
            },
            negociacao: {
                nome_responsavel: "Maurício Souza",
                data: new Date(),
                percentual: 25,
            },
            total_previsto: 120000.00,
            total_realizado: 100000.00,
            valor_previsto_realizado_percentual_total: 80,
            valor_previsto_realizado_percentual_total_neagtive: true,
        },
        {
            id: 2,
            percentual: 12,
            titulo: "Insumos",
            valor: 15000.00,
            cost_sheets: [...costSheets, ...costSheets],
            aprovacao: {
                nome_responsavel: "Pamela Cristina",
                data: new Date(),
            },
            negociacao: {
                nome_responsavel: "Maurício Souza",
                data: new Date(),
            },
            total_previsto: 120000.00,
            total_realizado: 100000.00,
            valor_previsto_realizado_percentual_total: 80,
            valor_previsto_realizado_percentual_total_neagtive: true,
        }
    ]

    return of(costSheetGroups)
  }
}