import { Client } from 'app/clients/client.model';

export class OrganizationModel {
    id?: number;
    name?: string;
    client_id?: number;
    client_object?: Client;
    address?: string;
    address_number?: string;
    city?: string;
    site?: string;
};