import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_ACCESS_SECRET || 'supersecretkey',
        });
    }


    async validate(payload: any) {
        return {
            id: payload.identifier,
            email: payload.email,
            role: payload.role,
            departmentId: payload.departmentId,
        };
    }
}
