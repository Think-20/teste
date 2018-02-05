import { Briefing } from '../briefings/briefing.model';
import { StandConfiguration } from '../stand-configurations/stand-configuration.model';
import { StandGenre } from '../stand-genres/stand-genre.model';


export class Stand {
    id: number
    briefing_id: number
    briefing: Briefing
    configuration_id: number
    configuration: StandConfiguration
    place: string
    plan: string
    regulation: string
    column: number
    street_number: string
    genre_id: number
    genre: StandGenre
    reference: string
    closed_area_percent: number
    note: string
}
