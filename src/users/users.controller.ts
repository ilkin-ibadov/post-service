import { Body, Param, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { UserResponseDto } from "./dto/user-response.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { ApiParam } from "@nestjs/swagger";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private service: UsersService) { }

    @Roles(Role.ADMIN)
    @Get()
    getAllUsers(): Promise<UserResponseDto[]> {
        return this.service.getAllUsers()
    }

    @Roles(Role.ADMIN)
    @ApiParam({
        name: 'email',
        required: true,
        type: String,
        description: 'Email of the user to retrieve'
    })
    @Get(':email')
    findByEmail(@Param('email') email: string): Promise<UserResponseDto> {
        return this.service.findByEmail(email)
    }

    @Roles(Role.ADMIN || Role.USER)
    @Post('new')
    create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
        return this.service.create(dto)
    }

    @Roles(Role.ADMIN || Role.USER)
    @Post('update')
    update(@Body() dto: UpdateUserDto, @Param('id') id: string,): Promise<UserResponseDto> {
        return this.service.update(id, dto)
    }
}