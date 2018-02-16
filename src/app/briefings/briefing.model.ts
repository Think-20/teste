import { Employee } from '../employees/employee.model';
import { Job } from 'app/jobs/job.model';
import { Client } from 'app/clients/client.model';
import { JobType } from 'app/job-types/job-type.model';
import { BriefingCompetition } from 'app/briefing-competitions/briefing-competition.model';
import { BriefingPresentation } from 'app/briefing-presentations/briefing-presentation.model';
import { BriefingSpecialPresentation } from 'app/briefing-special-presentations/briefing-special-presentation.model';
import { Stand } from 'app/stand/stand.model';


export class Briefing {
    id: number
    code?: number
    job_id: number
    job: Job
    exhibitor_id: number
    exhibitor: Client
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
    area: number
    budget: number
    rate: number
    competition_id: number
    competition: BriefingCompetition
    latest_mounts_file: string
    colors_file: string
    guide_file: string
    presentation_id: number
    presentation: BriefingPresentation
    special_presentation_id: number
    special_presentation: BriefingSpecialPresentation
    approval_expectation_rate: number
    stand: Stand
    created_at: string
    updated_at: string
}
