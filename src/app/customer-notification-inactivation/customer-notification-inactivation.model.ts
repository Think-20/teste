export interface InactiveTime {
    id: number,
    type: string,
    notification_time: number,
    inactive_time: number,  
    message?: string;

    description?: string;
}

export enum EClientType {
    Expositor = "expositor",
    Agencia = "agency",
  }