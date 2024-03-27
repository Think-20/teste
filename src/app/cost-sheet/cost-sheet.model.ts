export class CostSheetGroup {
    id: number;
    titulo: string;
    percentual: number;
    valor: number;
    cost_sheets: Partial<CostSheet>[];
    total_previsto: number;
    valor_previsto_realizado_percentual_total: number;
    valor_previsto_realizado_percentual_total_neagtive: boolean;
    total_realizado: number;
    negociacao: Negociacao;
    aprovacao: Aprovacao;
    expanded: boolean;
    showFooter: boolean;

    constructor(
        id: number | null = null,
        titulo: string | null = null,
        percentual: number | null = null,
        valor: number | null = null,
        cost_sheets: Partial<CostSheet>[] | null = null,
        total_previsto: number | null = null,
        valor_previsto_realizado_percentual_total: number | null = null,
        valor_previsto_realizado_percentual_total_neagtive: boolean | null = null,
        total_realizado: number | null = null,
        negociacao: Negociacao | null = new Negociacao(),
        aprovacao: Aprovacao | null = new Aprovacao()
    ) {
        this.id = id;
        this.titulo = titulo;
        this.percentual = percentual;
        this.valor = valor;
        this.cost_sheets = cost_sheets;
        this.total_previsto = total_previsto;
        this.valor_previsto_realizado_percentual_total = valor_previsto_realizado_percentual_total;
        this.valor_previsto_realizado_percentual_total_neagtive = valor_previsto_realizado_percentual_total_neagtive;
        this.total_realizado = total_realizado;
        this.negociacao = negociacao;
        this.aprovacao = aprovacao;
        this.expanded = true;
        this.showFooter = true;
    }
}

export class CostSheet {
    id: number;
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

    constructor(
        id: number | null = null,
        numero: string | null = null,
        categoria: string | null = null,
        favorecido: Favorecido | null = new Favorecido(),
        descricao: string | null = null,
        quantidade: number | null = null,
        unidade: string | null = null,
        valor_previsto: number | null = null,
        valor_realizado: number | null = null,
        valor_previsto_realizado_percentual: number | null = null,
        negociacao: Negociacao | null = new Negociacao(),
        solicitante: Solicitante | null = new Solicitante(),
        aprovacao: Aprovacao | null = new Aprovacao(),
        aceite: Aceite | null = new Aceite(),
        nf: string | null = null,
        condicao: string[] | null = null,
        vencimento: Vencimento | null = new Vencimento(),
        pagamento: string[] | null = null
    ) {
        this.id = id;
        this.numero = numero;
        this.categoria = categoria;
        this.favorecido = favorecido;
        this.descricao = descricao;
        this.quantidade = quantidade;
        this.unidade = unidade;
        this.valor_previsto = valor_previsto;
        this.valor_realizado = valor_realizado;
        this.valor_previsto_realizado_percentual = valor_previsto_realizado_percentual;
        this.negociacao = negociacao;
        this.solicitante = solicitante;
        this.aprovacao = aprovacao;
        this.aceite = aceite;
        this.nf = nf;
        this.condicao = condicao;
        this.vencimento = vencimento;
        this.pagamento = pagamento;
    }
}

export class Favorecido {
    id: number;
    nome: string;

    constructor(id: number | null = null, nome: string | null = null) {
        this.id = id;
        this.nome = nome;
    }
}

export class Negociacao {
    nome_responsavel: string;
    data: Date;
    percentual?: number;

    constructor(nome_responsavel: string | null = null, data: Date | null = null, percentual: number | null = null) {
        this.nome_responsavel = nome_responsavel;
        this.data = data;
        this.percentual = percentual;
    }
}

export class Solicitante {
    nome: string;
    data: Date;

    constructor(nome: string | null = null, data: Date | null = null) {
        this.nome = nome || "";
        this.data = data;
    }
}

export class Aprovacao {
    nome_responsavel: string;
    data: Date;
    percentual?: number;

    constructor(nome_responsavel: string | null = null, data: Date | null = null, percentual: number | null = null) {
        this.nome_responsavel = nome_responsavel;
        this.data = data;
        this.percentual = percentual;
    }
}

export class Aceite {
    nome_responsavel: string;
    data: Date;

    constructor(nome_responsavel: string | null = null, data: Date | null = null, percentual: number | null = null) {
        this.nome_responsavel = nome_responsavel;
        this.data = data;
    }
}

export class Vencimento {
    data: Date;
    parcela_atual: number;
    total_parcelas: number;

    constructor(
        data: Date | null = null,
        parcela_atual: number | null = null,
        total_parcelas: number | null = null
    ) {
        this.data = data;
        this.parcela_atual = parcela_atual || 0;
        this.total_parcelas = total_parcelas || 0;
    }
}