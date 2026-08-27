import {Module} from "@nestjs/common";
import {AuthController} from "./api/auth.controller";
import {JwtModule} from "@nestjs/jwt";
import {envConfig} from "../../config_old";
import {NotificationsModule} from "../notifications/notifications.module";
import {UserAccountsModule} from "../user-accounts/user-accounts.module";
import {CryptoService} from "../../core/bcrypt/bcrypt.service";
import {AuthService} from "./application/auth.service";
import {LocalStrategy} from "./guards/local/local.strategy";
import {JwtStrategy} from "./guards/bearer/jwt.strategy";
import {UsersService} from "../user-accounts/application/users.service";
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "../user-accounts/domain/user.entity";
import {UsersRepository} from "../user-accounts/infrastructure/users.repository";
import {UsersQueryRepository} from "../user-accounts/infrastructure/query/users.query-repository";
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../core/app.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtTokenProvider } from './application/jwt-token-provider/jwt-token-provider.service';
import { Session, SessionSchema } from './domain/session.entity';
import { LoginUserHandler } from './application/usecases/login-user.usecase';
import { SessionsCommandRepository } from './infrastructure/session/sessions.command-repository';
import { SessionsQueryRepository } from './infrastructure/session/query/sessions.query-repository';
import { RefreshTokenHandler } from './application/usecases/refresh-token.usecase';
import { LogoutHandler } from './application/usecases/logout.usecase';
import { BasicAuthStrategy } from './guards/basic/basic.strategy';
import { JwtRefreshAuthGuard } from './guards/refresh-token/refresh-token.auth-guard';
import { JwtRefreshTokenStrategy } from './guards/refresh-token/refresh-token.strategy';

@Module({
    imports: [
    //     JwtModule.register({
    //     secret: process.env.ACCESS_TOKEN_SECRET,
    //     signOptions: {expiresIn: '60m'}
    // }),
        JwtModule.registerAsync({
            // Если AppConfig не импортирован глобально как модуль,
            // его нужно раскомментировать здесь в imports:
            // imports: [AppConfig], // но это только для модулей, классы передаются в раздел providers
            inject: [AppConfig],
            useFactory: async (appConfig: AppConfig) => ({
                // secret: appConfig.ACCESS_TOKEN_SECRET,
                // signOptions: { expiresIn: `${appConfig.ACCESS_TOKEN_LIFETIME}s` },
            }),
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: Session.name, schema: SessionSchema }]),
        NotificationsModule,
        UserAccountsModule,
        ThrottlerModule.forRootAsync({
            inject: [AppConfig],
            useFactory: (appConfig: AppConfig) => [
                {
                    ttl: appConfig.THROTTLE_TTL, //  in milliseconds
                    limit: appConfig.THROTTLE_LIMIT,
                },
            ],
        }),
    ],
    controllers: [AuthController,
        // SecurityDevicesController
        ],
    providers: [
        LoginUserHandler,
        RefreshTokenHandler,
        LogoutHandler,
        SessionsCommandRepository,
        SessionsQueryRepository,
        AuthService,
        // SecurityDevicesQueryRepository,
        LocalStrategy, // Паспортная стратегия для логина
        JwtStrategy,   // Паспортная стратегия для гвардов
        BasicAuthStrategy,
        JwtRefreshTokenStrategy,
        CryptoService,
        UsersService,
        UsersRepository,
        UsersQueryRepository,
        // AppConfig, // зарегистрировали этот класс в отдельном глобальном модуле CoreConfig
        JwtTokenProvider,
    ],
    exports: [],
})

export class AuthorisationModule {
}