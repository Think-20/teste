export class CostSheetResult {
    valor_previsto_realizado_percentual_total_neagtive: boolean;

    total_previsto: number;
    total_realizado: number;
    total_salvo: number;

    percentual_previsto: number;
    percentual_realizado: number;
    percentual_salvo: number;

    negociacao: Partial<Negociacao>;
    aprovacao: Partial<Aprovacao>;
}

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
    negociacao: Partial<Negociacao>;
    aprovacao: Partial<Aprovacao>;
    expanded: boolean;
    showFooter: boolean;

    constructor(
        id?: number,
        titulo?: string,
        percentual?: number,
        valor?: number,
        cost_sheets?: Partial<CostSheet>[],
        total_previsto?: number,
        valor_previsto_realizado_percentual_total?: number,
        valor_previsto_realizado_percentual_total_neagtive?: boolean,
        total_realizado?: number,
        negociacao?: Negociacao,
        aprovacao?: Aprovacao
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
        this.negociacao = negociacao || new Negociacao();
        this.aprovacao = aprovacao || new Aprovacao();
        this.expanded = true;
        this.showFooter = true;
    }
}

export class CostSheet {
    id: number;
    numero: string;
    categoria: string;
    favorecido: Partial<Favorecido>;
    descricao: string;
    quantidade: number;
    unidade: string;
    valor_previsto: number;
    valor_realizado: number;
    valor_previsto_realizado_percentual: number;
    negociacao: Partial<Negociacao>;
    solicitante: Partial<Solicitante>;
    aprovacao: Partial<Aprovacao>;
    aceite: Partial<Aceite>;
    nf: string;
    condicao: string[];
    vencimento: Partial<Vencimento>;
    pagamento: string[];

    data_vencimento: Date;
    data_negociacao: Date;
    data_solicitante: Date;
    data_aprovacao: Date;
    data_aceite: Date;

    parcela_atual: number;
    total_parcelas: number;

    constructor(
        id?: number,
        numero?: string,
        categoria?: string,
        favorecido?: Partial<Favorecido>,
        descricao?: string,
        quantidade?: number,
        unidade?: string,
        valor_previsto?: number,
        valor_realizado?: number,
        valor_previsto_realizado_percentual?: number,
        negociacao?: Partial<Negociacao>,
        solicitante?: Partial<Solicitante>,
        aprovacao?: Partial<Aprovacao>,
        aceite?: Partial<Aceite>,
        nf?: string,
        condicao?: string[],
        vencimento?: Partial<Vencimento>,
        pagamento?: string[]
    ) {
        this.id = id;
        this.numero = numero;
        this.categoria = categoria;
        this.favorecido = favorecido || new Favorecido();
        this.descricao = descricao;
        this.quantidade = quantidade;
        this.unidade = unidade;
        this.valor_previsto = valor_previsto;
        this.valor_realizado = valor_realizado;
        this.valor_previsto_realizado_percentual = valor_previsto_realizado_percentual;
        this.negociacao = negociacao ||  new Negociacao();
        this.solicitante = solicitante || new Solicitante();
        this.aprovacao = aprovacao || new Aprovacao();
        this.aceite = aceite || new Aceite();
        this.nf = nf;
        this.condicao = condicao || [];
        this.vencimento = vencimento || new Vencimento();
        this.pagamento = pagamento || [];
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
    id: number;
    nome: string;
    data: Date;
    percentual?: number;

    constructor(id: number = null, nome: string = null, data: Date = null, percentual: number = null) {
        this.id = id;
        this.nome = nome;
        this.data = data;
        this.percentual = percentual;
    }
}

export class Solicitante {
    id: number;
    nome: string;
    data: Date;

    constructor(id: number = null, nome: string = null, data: Date = null) {
        this.id = id;
        this.nome = nome || "";
        this.data = data;
    }
}

export class Aprovacao {
    id: number;
    nome: string;
    data: Date;
    percentual?: number;

    constructor(id: number = null, nome: string  = null, data: Date  = null, percentual: number  = null) {
        this.id = id;
        this.nome = nome;
        this.data = data;
        this.percentual = percentual;
    }
}

export class Aceite {
    id: number;
    nome: string;
    data: Date;

    constructor(id: number = null, nome: string = null, data: Date  = null, percentual: number = null) {
        this.id = id;
        this.nome = nome;
        this.data = data;
    }
}

export class Vencimento {
    data: Date;
    parcela_atual: number;
    total_parcelas: number;

    constructor(
        data: Date  = null,
        parcela_atual: number  = null,
        total_parcelas: number  = null
    ) {
        this.data = data;
        this.parcela_atual = parcela_atual || 0;
        this.total_parcelas = total_parcelas || 0;
    }
}

export class Atendente {
    id: number;
    nome: string;
}