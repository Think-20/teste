export class CheckInModel {
    job_id: number;
    project_version_id: number;
    memorial_id: number;
    budget_id: number;
    alerts: {
        approval: {
            marked: boolean;
            name: string;
            date: string;
        };
        accept_proposal: {
            marked: boolean;
            name: string;
            date: string;
        };
        accept_production: {
            marked: boolean;
            name: string;
            date: string;
        };
        board_pproval: {
            marked: boolean;
            name: string;
            date: string;
        };
    }












    area: number;
    configuration: string;
    location: string;
    pavilion: string;
    approval_obs: string;
    contacts: {
        clients: {
            id: number;
            name: string;
            department: string;
            email: string;
            cellphone: string;
            landline: string;
            percentage: number;
        } [],
        agents: {
            id: number;
            name: string;
            department: string;
            email: string;
            cellphone: string;
            landline: string;
            percentage: number;
        } [],
        obs: string,
    };
    revenue: {
        agent_id: number;
        obs: string;
    }
}