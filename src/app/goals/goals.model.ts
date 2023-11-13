export interface YearsMonth {
    year: number, 
    months: Goal[];
}

export interface Goal {
    id?: number,
    month_name: string 
    month: number,
    year: number,
    value: number,
    message?: string;
}