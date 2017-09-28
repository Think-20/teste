import { State } from './state.model'

export class City {
    id: number
    name: string
    stateId: number
    state?: State
}