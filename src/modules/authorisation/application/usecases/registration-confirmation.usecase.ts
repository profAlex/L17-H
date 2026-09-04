import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersCommandRepository } from '../../../user-accounts/infrastructure/users.command-repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class ConfirmRegistrationCommand extends Command<void> {
    constructor(public readonly code: string) {
        super();
    }
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationHandler implements ICommandHandler<ConfirmRegistrationCommand> {
    constructor(
        private readonly usersCommandRepository: UsersCommandRepository,
    ) {}

    async execute({ code }: ConfirmRegistrationCommand): Promise<void> {
        const userToBeConfirmed =
            await this.usersCommandRepository.SQLfindUserByConfirmationCode(
                code,
            );

        if (!userToBeConfirmed) {
            throw new DomainException({
                code: DomainExceptionCode.ConfirmationCodeExpired,
                message:
                    'Email confirmation code is wrong, outdated or not found.',
                extensions: [
                    {
                        message:
                            'Email confirmation code is wrong, outdated or not found.',
                        key: 'code',
                    },
                ],
            });
        }

        userToBeConfirmed.confirmEmail();

        await this.usersCommandRepository.SQLsave(userToBeConfirmed);
    }
}
