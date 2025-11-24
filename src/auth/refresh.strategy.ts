import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";
import { Request } from "express";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private usersService: UsersService) {
        super({
            secretOrKey: process.env.JWT_REFRESH_SECRET as string,
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            passReqToCallback: true
        })
    }

    // Checks if user for given tokens is deleted
    async validate(req: Request, payload: any) {
        const refreshToken = req.body.refreshToken

        if (!refreshToken) {
            throw new UnauthorizedException("Refresh token is missing")
        }

        const user = await this.usersService.findById(payload.id)

        if (!user || !user.refreshToken) {
            throw new UnauthorizedException("Invalid refresh token")
        }

        return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            refreshToken
        }
    }

}