export class CostSheetGroup {
    id: number;
    titulo: string;
    percentual: number;
    valor: number;
    cost_sheets: CostSheet[];
    total_previsto: number;
    valor_previsto_realizado_percentual_total: number;
    valor_previsto_realizado_percentual_total_neagtive: boolean;
    total_realizado: number;
    negociacao: Negociacao;
    aprovacao: Aprovacao;
}

export class CostSheet {
    numero: string;
    categoria: string;
    favorecido: Favorecido;
    descricao: string;
    quantidade: number;
    unidade: string;
    valor_previsto: number;
    valor_realizado: number;
    valor_previsto_realizado_percentual: number;
    negociacao: Negociacao;
    solicitante: Solicitante;
    aprovacao: Aprovacao;
    aceite: Aceite;
    nf: string;
    condicao: string[];
    vencimento: Vencimento;
    pagamento: string[];
}

export interface Favorecido {
    id: number;
    nome: string;
}

export interface Negociacao {
    nome_responsavel: string;
    data: Date;
    percentual?: number;
}

export class Solicitante {
    nome: string;
    data: Date;
}

export interface Aprovacao {
    nome_responsavel: string;
    data: Date;
    percentual?: number;
}

export interface Aceite {
    nome_responsavel: string;
    data: Date;
}

export class Vencimento {
    data: Date;
    parcela_atual: number;
    total_parcelas: number;
}