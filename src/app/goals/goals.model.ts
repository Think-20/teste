export interface YearsMonth {
    year: number, 
    months: Goal[];
}

export interface Goal {
    id?: number,
    month_name: string 
    month: number,
    year: number,
    value_internal: number,
    expected_value_external: number,
    value_external: number,
    expected_value_internal: number,
    message?: string;
}