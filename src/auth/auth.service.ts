import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt"
import { JwtService } from "@nestjs/jwt";
import { Role } from "src/common/enums/role.enum";

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwt: JwtService) { }

    // Generate access and refresh tokens
    async generateTokens(user: any) {
        const payload: any = { id: String(user._id), role: user.role }

        const accessToken = await this.jwt.signAsync(payload, {
            secret: process.env.JWT_SECRET as string,
            expiresIn: 15 * 60 * 1000
        })

        const refreshToken = await this.jwt.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET as string,
            expiresIn: 7 * 24 * 60 * 60 * 1000
        })

        return { accessToken, refreshToken }
    }

    // Update refresh token
    async updateRefreshToken(userId: string, refreshToken: string) {
        const hashed = await bcrypt.hash(refreshToken, 10)
        await this.usersService.update(userId, { refreshToken: hashed })
    }

    // Register
    async register(dto: RegisterDto) {
        dto.password = await bcrypt.hash(dto.password, 10)

        const user = await this.usersService.create({
            ...dto,
            role: Role.USER
        })

        const tokens = await this.generateTokens(user)

        await this.updateRefreshToken(String(user._id), tokens.refreshToken)

        return tokens
    }

    // Login
    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmailRaw(dto.email)
        if (!user) throw new UnauthorizedException("User not found")

        const valid = await bcrypt.compare(dto.password, user.password)
        if (!valid) throw new UnauthorizedException("Invalid credentials")

        const tokens = await this.generateTokens(user)
        await this.updateRefreshToken(String(user._id), tokens.refreshToken)

        return tokens
    }

    async refresh(user: any) {
        const { id, refreshToken: incomingToken } = user

        const dbUser = await this.usersService.findById(id)

        if (!dbUser || !dbUser.refreshToken) {
            throw new UnauthorizedException("Refresh token not found")
        }

        const tokenMatches = await bcrypt.compare(
            incomingToken, dbUser.refreshToken
        )

        if (!tokenMatches) {
            throw new UnauthorizedException("Refresh token is invalid")
        }

        const tokens = await this.generateTokens(dbUser)
        await this.updateRefreshToken(id, tokens.refreshToken)

        return tokens
    }
}
