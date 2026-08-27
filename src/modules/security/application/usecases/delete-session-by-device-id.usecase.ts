import { ICommandHandler, Command, CommandHandler } from '@nestjs/cqrs';
import { SessionsCommandRepository } from '../../../authorisation/infrastructure/session/sessions.command-repository';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';

export class DeleteSessionByDeviceId extends Command<void> {
    constructor(
        public readonly userId: string,
        public readonly deviceUUID: string,
    ) {
        super();
    }
}

@CommandHandler(DeleteSessionByDeviceId)
export class DeleteSessionByDeviceIdHandler implements ICommandHandler<DeleteSessionByDeviceId> {
    constructor(
        private readonly sessionsCommandRepository: SessionsCommandRepository,
    ) {}

    async execute({
        userId,
        deviceUUID,
    }: DeleteSessionByDeviceId): Promise<void> {
        const session =
            await this.sessionsCommandRepository.findSessionByDeviceId(
                deviceUUID,
            );

        if (!session) {
            throw new NotFoundException(`Session with deviceUUID ${deviceUUID} not found`);
        }

        if (userId !== session.userId) {
            throw new ForbiddenException(
                `Cannot delete session which doesn't belong to user: ${userId}`,
            );
        }

        session.makeDeleted();
        await this.sessionsCommandRepository.save(session);
    }
}
