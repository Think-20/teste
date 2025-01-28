import { ExtraItemModel } from './extra-item.model';

export class ExtraModel {
    id?: number;
    description?: string;
    job_id?: number;
    accept_client?: number;
    accept_client_date?: string;
    reason_for_rejection?: string;
    approval?: number;
    approval_date?: string;
    hash?: string;
    obs?: string;
    created_at?: string;
    updated_by?: number;
    updated_at?: string;
    extra_items?: ExtraItemModel[];
}
