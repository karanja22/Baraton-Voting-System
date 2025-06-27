import { PositionInterface } from "./position.interface";

export interface CreateElectionInterface {
    title: string;
    start_date: string;
    end_date: string;
    has_positions?: boolean;
    type?: 'SEC' | 'DELEGATE' | 'GENERAL';
    positions?: PositionInputInterface[];
}


export interface UpdateElectionInterface extends Partial<CreateElectionInterface> {
    status?: string;
}


export interface PositionInputInterface {
    name: string;
    isVicePosition?: boolean;
}

export interface ElectionInterface {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    status: 'pending' | 'ongoing' | 'completed';
    has_positions: boolean;
    positions: PositionInterface[];
    type: 'SEC' | 'DELEGATE' | 'GENERAL';
    created_at: string;
    updated_at: string;
}

export type ElectionType = 'SEC' | 'DELEGATE' | 'GENERAL';
