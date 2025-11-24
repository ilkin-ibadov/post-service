import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";

interface AccessJwtPayload {
    id: string;
    role: string;
    email: string;
    iat?: number;
    exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private usersService: UsersService) {
        super({
            secretOrKey: process.env.JWT_SECRET as string,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }

    // Checks if user for given tokens is deleted
    async validate(payload: AccessJwtPayload) {
        const user = await this.usersService.findById(payload.id)

        if (!user) {
            throw new UnauthorizedException("User no longer exists")
        }

        return {
            id: user._id.toString(),
            email: user.email,
            role: user.role
        }
    }

}