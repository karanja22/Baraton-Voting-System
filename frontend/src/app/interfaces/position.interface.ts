// src/app/interfaces/position.interface.ts

export interface PositionInterface {
    id: number;
    name: string;
    election?: {
        id: number;
        title: string;
        type: 'SEC' | 'DELEGATE' | 'GENERAL';
        start_date: string;
        end_date: string;
        status: string;
        has_positions: boolean;
    };
    school?: {
        id: number;
        name: string;
    };
    isVicePosition?: boolean;
}
