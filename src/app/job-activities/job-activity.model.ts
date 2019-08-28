export class JobActivity {
    id: number
    description: string
    no_params: number
    redirect_after_save: string
    initial: number
    fixed_duration: number
    min_duration: number
    max_duration: number
    max_budget_value_per_day: number
    max_duration_value_per_day: number
    modify_id: number
    option_id: number
    modify: JobActivity
    option: JobActivity
}
