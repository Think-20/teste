import { Employee } from '../employees/employee.model';
import { Job } from 'app/jobs/job.model';
import { Client } from 'app/clients/client.model';
import { JobType } from 'app/job-types/job-type.model';
import { BriefingCompetition } from 'app/briefing-competitions/briefing-competition.model';
import { BriefingPresentation } from 'app/briefing-presentations/briefing-presentation.model';
import { BriefingSpecialPresentation } from 'app/briefing-special-presentations/briefing-special-presentation.model';
import { Stand } from 'app/stand/stand.model';
import { BriefingMainExpectation } from '../briefing-main-expectation/briefing-main-expectation.model';
import { BriefingLevel } from '../briefing-level/briefing-level.model';
import { BriefingHowCome } from '../briefing-how-come/briefing-how-come.model';

export class Briefing {
    id: number
    code?: number
    job_id: number
    job: Job
    client_id?: number
    client?: Client
    not_client?: string
    event: string
    deadline: string
    job_type_id: number
    job_type: JobType
    agency_id: number
    agency: Client
    attendance_id: number
    attendance: Employee
    creation_id: number
    creation: Employee
    rate: number
    budget: number
    estimated_time: number
    competition_id: number
    last_provider: string
    competition: BriefingCompetition
    files: any[]
    main_expectation_id?: number
    main_expectation?: BriefingMainExpectation
    how_come_id?: number
    how_come?: BriefingHowCome
    available_date: string
    presentations?: BriefingPresentation
    levels?: BriefingLevel
    approval_expectation_rate: number
    stand?: Stand
    created_at: string
    updated_at: string
}
