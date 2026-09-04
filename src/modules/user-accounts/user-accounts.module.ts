import {Module} from '@nestjs/common';
import {UsersController} from './api/users.controller';
import {UsersService} from './application/users.service';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UserSchema} from './domain/user.entity';
import {UsersCommandRepository} from './infrastructure/users.command-repository';
import {UsersQueryRepository} from './infrastructure/query/users.query-repository';
import {UsersExternalQueryRepository} from './infrastructure/external-query/users.external-query-repository';
import {UsersExternalService} from './application/users.external-service';
import {CryptoService} from "../../core/bcrypt/bcrypt.service";
import { GetAllUsersQueryHandler } from './application/usecases/get-all-users.usecase';
import { GetUserByIdOrNotFoundHandler } from './application/usecases/get-user-by-id.usecase';

@Module({
    imports: [
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    ],
    controllers: [UsersController],
    providers: [
        GetUserByIdOrNotFoundHandler,
        GetAllUsersQueryHandler,
        UsersService,
        UsersCommandRepository,
        UsersQueryRepository,
        UsersExternalQueryRepository,
        UsersExternalService,
        CryptoService,
    ],
    exports: [UsersExternalQueryRepository, UsersExternalService],
})
export class UserAccountsModule {
}
