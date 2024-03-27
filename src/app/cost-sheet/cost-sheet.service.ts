import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material';
import { API } from 'app/app.api';
import { AuthService } from 'app/login/auth.service';
import { ErrorHandler } from 'app/shared/error-handler.service';
import { Observable, of } from 'rxjs';
import { CostSheet, CostSheetGroup, CostSheetResult } from './cost-sheet.model';

@Injectable()
export class CostSheetService {
  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) { }


  getCostSheets(): Observable<{costSheetGroups: Partial<CostSheetGroup>[], costSheetResult: CostSheetResult}> {
    const costSheets: Partial<CostSheet>[] = [
        {
            id: 1,
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

    const costSheet = new CostSheet();
    const costSheets2: Partial<CostSheet>[] = [
        {  ...costSheet, numero: "001", categoria: "Mkt" },
        {  ...costSheet, numero: "002", categoria: "Frete" },
        {  ...costSheet, numero: "003", categoria: "Logistica" },
        {  ...costSheet, numero: "004", categoria: "VP" },
        {  ...costSheet, numero: "005", categoria: "Taxas" },
    ]

    const costSheets3: Partial<CostSheet>[] = [
        {  ...costSheet, numero: "001", categoria: "impos" },
        {  ...costSheet, numero: "002", categoria: "Bvs" },
        {  ...costSheet, numero: "003", categoria: "Equipamentos" },
    ]

    const costSheets4: Partial<CostSheet>[] = [
        {  ...costSheet, numero: "001", categoria: "Vidros" },
        {  ...costSheet, numero: "002", categoria: "Balcões" },
        {  ...costSheet, numero: "003", categoria: "Luninárias" },
        {  ...costSheet, numero: "004", categoria: "Pisos" },
    ]

    const costSheetGroup = new CostSheetGroup();

    const costSheetGroups: Partial<CostSheetGroup>[] = [
        {
            ...costSheetGroup,
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
            expanded: true,
        },
        {
            ...costSheetGroup,
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
            expanded: true,
        },
        {
            ...costSheetGroup,
            id: 3,
            titulo: "Operacional",
            cost_sheets: [...costSheets2],
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
            expanded: true,
            showFooter: false
        },
        {
            ...costSheetGroup,
            id: 4,
            titulo: "Impostos",
            cost_sheets: [...costSheets3],
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
            expanded: true,
            showFooter: false
        },
        {
            ...costSheetGroup,
            id: 5,
            titulo: "Estoque",
            cost_sheets: [...costSheets4],
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
            expanded: true,
            showFooter: false
        },
    ]

    const costSheetResult: CostSheetResult = {
        aprovacao: {
            nome_responsavel: "Pamela Cristina",
            data: new Date(),
        },
        negociacao: {
            nome_responsavel: "Maurício Souza",
            data: new Date(),
        },
        percentual_previsto: 20,
        percentual_realizado: 25,
        percentual_salvo: 25,
        total_previsto: 20000.00,
        total_realizado: 25000.00,
        total_salvo: 5000.00,
        valor_previsto_realizado_percentual_total_neagtive: false,
    }

    return of( { costSheetGroups: costSheetGroups, costSheetResult: costSheetResult } )
  }
}