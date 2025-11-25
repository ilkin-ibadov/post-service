import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types, Document } from 'mongoose';
import { User } from "src/users/users.schema";

export type TodoDocument = HydratedDocument<Todo>;

@Schema()
export class Todo extends Document {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ default: false })
    completed: boolean;

    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    userId: Types.ObjectId
}

export const TodoSchema = SchemaFactory.createForClass(Todo)