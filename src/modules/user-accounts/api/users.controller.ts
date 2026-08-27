import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { UserViewDto } from './view-dto/users.view-dto';
import { UsersService } from '../application/users.service';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UpdateUserInputDto } from './input-dto/update-user.input-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { BasicAuthGuard } from '../../authorisation/guards/basic/basic.auth-guard';
import { IdParamInputDto } from './input-dto/id-param.input-dto';

@ApiTags('Users endpoint')
@Controller('users')
export class UsersController {
    constructor(
        private usersQueryRepository: UsersQueryRepository,
        private usersService: UsersService,
    ) {
        console.log('UsersController created');
    }

    @UseGuards(BasicAuthGuard)
    @ApiParam({ name: 'id' }) //для сваггера
    @Get(':id') //users/232342-sdfssdf-23234323
    async getById(@Param() idParam: IdParamInputDto): Promise<UserViewDto> {
        // можем и чаще так и делаем возвращать Promise из action. Сам NestJS будет дожидаться, когда
        // промис зарезолвится и затем NestJS вернёт результат клиенту
        return this.usersQueryRepository.getByIdOrNotFoundFail(idParam.id);
    }

    @UseGuards(BasicAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get()
    async getAll(
        @Query() query: GetUsersQueryParams,
    ): Promise<PaginatedViewDto<UserViewDto>> {
        return this.usersQueryRepository.getAll(query);
    }

    @HttpCode(HttpStatus.CREATED)
    @UseGuards(BasicAuthGuard)
    @Post()
    async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
        // console.log('<------------TEST HERE1');

        const userId = await this.usersService.createUser(body);

        // console.log('<------------TEST HERE5', userId);

        return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
    }

    @UseGuards(BasicAuthGuard)
    @Put(':id')
    async updateUser(
        @Param() idParam: IdParamInputDto,
        @Body() body: UpdateUserInputDto,
    ): Promise<UserViewDto> {
        const userId = await this.usersService.updateUser(idParam.id, body);

        return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
    }

    @UseGuards(BasicAuthGuard)
    @ApiParam({ name: 'id' }) //для сваггера
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteUser(@Param() idParam: IdParamInputDto): Promise<void> {
        return this.usersService.deleteUser(idParam.id);
    }
}
