import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();

        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) throw new UnauthorizedException();

        try {
            const payload = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET!);
            req.user = payload;
            return true;
        } catch (err) {
            throw new UnauthorizedException();
        }
    }
}
