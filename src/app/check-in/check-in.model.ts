import { EventModel } from 'app/shared/models/event.model';

export class CheckInModel {
    id?: number;
    job_id: number;
    project?: number;
    memorial?: number;
    budget?: number;
    approval: boolean;
    approval_employee_id: number;
    approval_date: string;
    accept_proposal: boolean;
    accept_proposal_employee_id: number;
    accept_proposal_date: string;
    accept_production: boolean;
    accept_production_employee_id: number;
    accept_production_date: string;
    board_approval: boolean;
    board_approval_employee_id: number;
    board_approval_date: string;
    area?: number;
    config?: string;
    location?: string;
    pavilion?: string;
    organization_id?: number;
    organization_login?: string;
    organization_password?: string;
    organization_changed_by?: number;
    organization_changed_in?: string | Date;
    promoter_name?: string;
    promoter_login?: string;
    promoter_password?: string;
    promoter_changed_by?: number;
    promoter_changed_in?: string | Date;
    event_id?: EventModel;
    event_changed_by?: number;
    event_changed_in?: string | Date;
    approval_note?: string = null;
    contacts?: {
        clients?: {
            id: number;
            name: string;
            department: string;
            email: string;
            cellphone: string;
            landline: string;
            percentage: number;
        } [];
        agencies?: {
            id: number;
            name: string;
            department: string;
            email: string;
            cellphone: string;
            landline: string;
            percentage: number;
        } [];
    };
    contact_obs?: string = null;
    billing_client_id?: number;
    costumer_service_employee: null;
    costumer_service_comission: null;
    costumer_service_employee2: null;
    costumer_service_comission2: null;
    creation_employee: null;
    creation_comission: null;
    creation_employee2: null;
    creation_comission2: null;
    production_manager_employee: null;
    production_manager_comission: null;
    production_manager_employee2: null;
    production_manager_comission2: null;
    budget_employee: null;
    budget_comission: null;
    budget_employee2: null;
    budget_comission2: null;
    detailing_employee: null;
    detailing_comission: null;
    detailing_employee2: null;
    detailing_comission2: null;
    production_employee: null;
    production_comission: null;
    production_employee2: null;
    production_comission2: null;
    billing_obs: string;
    bv_customer_service: number;
    billing_amount?: {
        billing_amount: number;
        value_base_for_calculation: number;
        bv: number;
        bv_customer_service: string;
        taxes: number;
        equipment: number;
        logistics: number;
        credentials_fees: number;
        insurance: number;
        others: number;
        discount: number;
        final_contract_value: number;
        payments?: {
            id: number;
            description: string;
            percentage: number;
            value: number;
            date: string;
            settlement_date: string;
            state: string;
        } [];
        approved_by: string;
        approved_at: string;
        discount_interest: number;
        total_amount_received: number;
        obs: string;
    };
    extras?: {
        total_amount_extras: number;
        items: {
            id: number;
            description: string;
            value: number;
            requester: number;
            budget: number;
        } [];
        extra_commissions: {
            id: number;
            approval_date: string;
            extra_commission: string;
            billing_employee_id: number;
            date: string;
            due_date: string;
            settlement_date: string;
        } [];
        approved_by: string;
        approved_at: string;
        discount_interest: number;
        total_amount_extras_received: number;
        obs: string;
    };
    billing_amount_obs?: string;
    extras_obs?: string;

    constructor() {
        this.approval_note = null;
        this.contact_obs = null;
        this.billing_obs = null;
        this.billing_amount_obs = null;
        this.extras_obs = null;
    }
}
