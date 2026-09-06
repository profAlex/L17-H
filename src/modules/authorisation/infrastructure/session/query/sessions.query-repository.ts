import { Injectable } from '@nestjs/common';
import { Session, SessionModelType } from '../../../domain/session.entity';
import { InjectModel } from '@nestjs/mongoose';
import { SessionParameters } from '../sessions.command-repository';
import { DeviceViewDto, SQLDeviceViewDto } from '../../../../security/api/view-dto/device.view-dto';
import { FlattenMaps } from 'mongoose';
import { DataSource } from 'typeorm';

@Injectable()
export class SessionsQueryRepository {
    constructor(
        @InjectModel(Session.name) private SessionModel: SessionModelType,
        private readonly dataSource: DataSource,
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

    async SQLgetActiveSessionList(userId: string): Promise<SQLDeviceViewDto[]> {
        const query = `
            SELECT
                device_ip,
                device_name,
                issued_at,
                device_uuid
            FROM public."user_sessions"
            WHERE user_id = $1 AND deleted_at IS NULL;
        `;

        const resultRows = await this.dataSource.query<{
            device_ip: string;
            device_name: string;
            issued_at: Date | string;
            device_uuid: string;
        }[]>(query, [userId]);

        return resultRows.map((session) => SQLDeviceViewDto.mapToView(session));
    }
}
