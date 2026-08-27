// import of this config module must be on top of imports list
import { configModule } from './config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingModule } from './modules/testing/testing.module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { CoreModule } from './core/core.module';
import { envConfig } from './config_old';
import { AuthorisationModule } from './modules/authorisation/authorisation.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { CqrsModule } from '@nestjs/cqrs';
import { AppConfig } from './core/app.config';
import { SecurityDevicesModule } from './modules/security/security.module';

@Module({
    //все модули должны быть заимпортированы в корневой модуль, либо напрямую, либо по цепочке (через другие модули)
    imports: [
        CqrsModule.forRoot(), // такое объявление делает его глобальным и шину можно инжектить везде
        MongooseModule.forRootAsync({
            inject: [AppConfig],
            useFactory: async (appConfig: AppConfig) => {
                return {
                    uri: appConfig.MONGO_URI,

                };
            },
        }),
        UserAccountsModule,
        TestingModule,
        BloggersPlatformModule,
        AuthorisationModule,
        NotificationsModule,
        configModule,
        CoreModule,
        SecurityDevicesModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        //важен порядок регистрации! Первым сработает DomainHttpExceptionsFilter!
        {
            provide: APP_FILTER,
            useClass: AllHttpExceptionsFilter,
        },
        {
            provide: APP_FILTER,
            useClass: DomainHttpExceptionsFilter,
        },
        AppConfig,
    ],
})
export class AppModule {}
