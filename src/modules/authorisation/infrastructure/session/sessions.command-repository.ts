import {
    Session,
    SessionDocument,
    SessionModelType,
} from '../../domain/session.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

export type SessionParameters = {
    userId: string;
    deviceId: string;
    expiresAt: Date;
    issuedAt: Date;
};

type SoftDeleteSessionsParams = {
    userId: string;
    sessionId: string;
};

@Injectable()
export class SessionsCommandRepository {
    constructor(
        @InjectModel(Session.name) private SessionModel: SessionModelType,
    ) {}

    async save(session: SessionDocument): Promise<void> {
        await session.save();
    }


    async findSessionBySessionId(
        sessionId: string,
    ): Promise<SessionDocument | null> {
        return this.SessionModel.findOne({
            _id: sessionId,
            deletedAt: null,
        }).exec();
        // Без .exec() Mongoose возвращает так называемый Query (объект-обещание), который ведет себя как Promise,
        // но им не является. Вызов .exec() превращает его в полноценный нативный JavaScript Promise.
        // Это дает более чистые и понятные стек-трейсы ошибок (stack traces), если база данных начнет сбоить,
        // и исключает странные баги с типизацией в некоторых версиях TypeScript.
    }

    async findSessionByDeviceId(
        deviceUUID: string,
    ): Promise<SessionDocument | null> {
        return this.SessionModel.findOne({
            deviceUUID: deviceUUID, // проверьте имя поля в схеме (deviceUUID или deviceId)
            deletedAt: null,
        }).exec();
    }

    // async removeAllButOneSession(
    //     sessionId: string,
    //     userId: string,
    // ): Promise<SessionDocument[] | null> {
    //     const result = await this.SessionModel.find({
    //         userId: userId,
    //         _id: { $ne: sessionId },
    //     }).exec();
    //
    //     // перенести это в соответствующий юзкейс
    //     // sessions.forEach((session: SessionDocument) => {session.makeDeleted()});
    //     // await Promise.all(sessions.map((session) => session.save()));
    //
    //     return result.length ? result : null;
    // }

    // это более ресурсосберегающий вариант removeAllButOneSession выше, операция без вызова отдельного .makeDeleted и .save(), т.н. атомарная
    async softDeleteAllButOneSession({sessionId, userId}: SoftDeleteSessionsParams): Promise<boolean> {
        const result = await this.SessionModel.updateMany(
            {
                userId: userId,
                _id: { $ne: new Types.ObjectId(sessionId) },
                deletedAt: null, // помечаем только те, что еще не были удалены
            },
            {
                $set: { deletedAt: new Date() },
            },
        ).exec();

        return result.modifiedCount > 0;
    }
}
