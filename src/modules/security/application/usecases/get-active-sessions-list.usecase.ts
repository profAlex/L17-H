import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { SessionsQueryRepository } from '../../../authorisation/infrastructure/session/query/sessions.query-repository';
import { DeviceViewDto } from '../../api/view-dto/device.view-dto';
import { Session } from '../../../authorisation/domain/session.entity';


export class GetActiveSessionsList extends Query<DeviceViewDto[]> {
    constructor(
        public readonly userId: string,
    ) {
        super();
    }
}

@QueryHandler(GetActiveSessionsList)
export class GetActiveSessionsListHandler implements IQueryHandler<GetActiveSessionsList> {
    constructor(
        private sessionsQueryRepository: SessionsQueryRepository,

    ) {}

    async execute({ userId }: GetActiveSessionsList): Promise<DeviceViewDto[]> {
        const result = await this.sessionsQueryRepository.getActiveSessionList(userId);

        return result.map((session: Session) => {return DeviceViewDto.mapToView(session)}); // Метод .forEach() предназначен для выполнения побочных эффектов (вывести в консоль, записать в файл, отправить HTTP-запрос) для каждого элемента. У него нет возвращаемого значения: инструкции return внутри .forEach() просто игнорируются.
    }
}


