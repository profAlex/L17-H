import { Injectable } from '@nestjs/common';
import { Session, SessionModelType } from '../../../domain/session.entity';
import { InjectModel } from '@nestjs/mongoose';
import { SessionParameters } from '../sessions.command-repository';
import { DeviceViewDto } from '../../../../security/api/view-dto/device.view-dto';
import { FlattenMaps } from 'mongoose';

@Injectable()
export class SessionsQueryRepository {
    constructor(
        @InjectModel(Session.name) private SessionModel: SessionModelType,
    ) {}

    async checkIfSessionExists({
        userId,
        deviceId,
        expiresAt,
        issuedAt,
    }: SessionParameters): Promise<string | null> {
        const session = await this.SessionModel.findOne(
            {
                userId: userId,
                deviceUUID: deviceId,
                expiresAt: expiresAt,
                // expiresAt: { $gt: new Date() },
                issuedAt: issuedAt,
                deletedAt: null,
            },
            { projection: { _id: 1 } },
        ).lean();

        return session ? session._id.toString() : null;
    }

    async getActiveSessionList(userId: string): Promise<FlattenMaps<Session>[]> {
        const currentDate = new Date();
        return this.SessionModel.find({
            userId: userId,
            deletedAt: null,
            expiresAt: { $gt: currentDate },
        })
            .lean<FlattenMaps<Session>[]>()
            .exec();
    }
}
