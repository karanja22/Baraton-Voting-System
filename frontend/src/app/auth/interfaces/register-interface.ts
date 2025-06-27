import { Role } from "../enums/role.enum";

export interface RegisterInterface {
    email: string;
    identifier: string;
    password: string;
    role?: Role;
}
