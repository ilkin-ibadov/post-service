import { Controller, Post, Body, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service"
import { AuthGuard } from "@nestjs/passport";
import { LoginDto } from "./dto/login.dto"
import { RegisterDto } from "./dto/register.dto"
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
    constructor(private auth: AuthService) { }

    @Post("register")
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto)
    }

    @Post("login")
    login(@Body() dto: LoginDto) {
        return this.auth.login(dto)
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard("jwt-refresh"))
    @Post("refresh")
    refresh(@Body() dto: RefreshTokenDto, @Req() req) {
        return this.auth.refresh(req.user)
    }
}
