export class PayloadDto {
    eventId: string;
    type: string;
    occurredAt: string;
    payload: {
        id: string;
        email: string;
        username: string;
        createdAt: string;
    }
}
