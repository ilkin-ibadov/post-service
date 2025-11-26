import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./users.schema"
import { Model } from "mongoose"
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private model: Model<User>) { }

    private toUserResponseDto(user: UserDocument): UserResponseDto {
        return {
            _id: user._id.toString(),
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    private toUserListDto(users: UserDocument[]): UserResponseDto[] {
        return users.map(u => this.toUserResponseDto(u));
    }

    async create(dto: CreateUserDto) {
        const user = await this.model.create(dto);
        return this.toUserResponseDto(user)
    }

    async findByEmail(email: string) {
        const user = await this.model.findOne({ email }).exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.toUserResponseDto(user);
    }

    async findByEmailRaw(email: string): Promise<UserDocument | null> {
        const user = await this.model.findOne({ email })
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async getAllUsers() {
        const users = await this.model.find().select('-password -refreshToken').exec();
        if (!users || users.length === 0) {
            throw new NotFoundException('No users not found');
        }

        return this.toUserListDto(users);
    }

    async findById(id: string): Promise<UserDocument | null> {
        const user = await this.model.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
        const updated = await this.model
            .findOneAndUpdate({ _id: id }, dto, { new: true })
            .exec(); // turns Query into Promise<Document | null>

        if (!updated) {
            throw new NotFoundException('User not found');
        }

        return this.toUserResponseDto(updated);
    }
}