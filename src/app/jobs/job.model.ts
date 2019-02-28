import { Employee } from '../employees/employee.model';
import { Client } from 'app/clients/client.model';
import { JobType } from 'app/job-types/job-type.model';
import { JobCompetition } from 'app/job-competitions/job-competition.model';
import { JobMainExpectation } from '../job-main-expectation/job-main-expectation.model';
import { JobLevel } from '../job-level/job-level.model';
import { JobHowCome } from '../job-how-come/job-how-come.model';
import { JobStatus } from 'app/job-status/job-status.model';
import { JobActivity } from '../job-activities/job-activity.model';
import { Briefing } from '../briefings/briefing.model';
import { Budget } from '../budgets/budget.model';
import { Task } from '../schedule/task.model';

export class Job {
    id: number
    code?: number
    job_activity_id: number
    job_activity: JobActivity
    internal_creation: number
    client_id?: number
    client?: Client
    not_client?: string
    briefing?: Briefing
    event: string
    deadline: string
    job_type_id: number
    job_type: JobType
    agency_id: number
    agency: Client
    attendance_id: number
    attendance: Employee
    rate: number
    budget_value: number
    budget_id?: number
    budget: Budget
    competition_id: number
    last_provider: string
    competition: JobCompetition
    files: any[]
    main_expectation_id?: number
    main_expectation?: JobMainExpectation
    how_come_id?: number
    how_come?: JobHowCome
    status_id?: number
    status: JobStatus
    levels?: JobLevel
    approval_expectation_rate: number
    created_at: string
    updated_at: string
    status_updated_at: string
    note?: string
    history: string
    task?: Task
    place?: string
    tasks?: Task[]
    available_date_creation?: string
    attendance_responsible?: Employee
    creation_responsible?: Employee
    detailing_responsible?: Employee
    budget_responsible?: Employee
    production_responsible?: Employee
}
