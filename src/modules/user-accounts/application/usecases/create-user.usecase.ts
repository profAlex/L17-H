import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsCommandRepository } from '../../../authorisation/infrastructure/session/sessions.command-repository';
import { UsersCommandRepository } from '../../infrastructure/users.command-repository';
import { CreateUserDto } from '../../dto/create-user.dto';
import { CryptoService } from '../../../../core/bcrypt/bcrypt.service';
import { InternalServerErrorException } from '@nestjs/common';
import { UUIDGeneratorUtil } from '../../../../core/uuid-generation/uuid.service';
import { SQLUser } from '../../domain/sql-user.entitry';

export class CreateUser extends Command<string> {
    constructor(
        public readonly dto: CreateUserDto,
        // public readonly req: Request,
    ) {
        super();
    }
}

@CommandHandler(CreateUser)
export class CreateUserHandler implements ICommandHandler<CreateUser> {
    constructor(
        private usersCommandRepository: UsersCommandRepository,
        private cryptoService: CryptoService,
    ) {}

    async execute({dto}: CreateUser): Promise<string> {
        const passwordHash = await this.cryptoService.generateHash(dto.password);

        if (!passwordHash) {
            throw new InternalServerErrorException("Couldn't generate hash");
        }

        const confirmationCode = UUIDGeneratorUtil.generateUUID();

        // 1. Создаем чистую доменную сущность (без Mongoose и без DI)
        const newUser = SQLUser.createInstance({
            login: dto.login,
            email: dto.email,
            passwordHash: passwordHash,
            confirmationCode: confirmationCode,
        });

        // 2. Сохраняем в PostgreSQL через Command-репозиторий
        await this.usersCommandRepository.save(newUser);

        // 3. Возвращаем UUID созданного пользователя
        return newUser.id;
    }
}