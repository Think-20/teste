export class Contact {
    id: number
    name: string
    department: string
    cellphone: number
    email: string;
    obs?: string;

    constructor() {
        this.cellphone = null;
        this.email = null;
        this.obs = null;
    }
}