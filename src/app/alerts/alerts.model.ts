export interface Projects {
    count: number
    data: Project[]
  }
  
  export interface Project {
    id: number
    code: number
    days_without_update: number
    job_activity: string
    job_type: string
    client: string
    event: string
    deadline: string
    creation_responsible?: string
    status: string
  }