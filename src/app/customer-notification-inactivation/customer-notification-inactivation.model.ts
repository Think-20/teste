export interface InactiveTime {
    id: number,
    type: string,
    notification_time: number,
    inactive_time: number,  
    message?: string;
}

export enum EClientType {
    Agencia = 1,
    Expositor = 2,
    Autonomo = 3,
  }