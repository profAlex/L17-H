import { User, UserDocument } from '../../domain/user.entity';
import { Types } from 'mongoose';

// export class UserViewDto {
//     id: string;
//     login: string;
//     email: string;
//     createdAt: string;
//
//     static mapToView(user: UserDocument): UserViewDto {
//         const dto = new UserViewDto();
//
//         dto.email = user.email;
//         dto.login = user.login;
//         dto.id = user._id.toString();
//         dto.createdAt = new Date(user.createdAt).toISOString();
//         //dto.firstName = user.name.firstName;
//         //dto.lastName = user.name.lastName;
//
//         return dto;
//     }
// }

export class UserViewDto {
    id: string;
    login: string;
    email: string;
    createdAt: string;

    constructor(user: User & { _id: Types.ObjectId }) {
        this.email = user.email;
        this.login = user.login;
        this.id = user.id || user._id.toString();
        this.createdAt =
            user.createdAt instanceof Date
                ? user.createdAt.toISOString()
                : new Date(user.createdAt).toISOString();

        // this.firstName = user.name?.firstName;
        // this.lastName = user.name?.lastName;
    }

    static mapToView(user: User & { _id: Types.ObjectId }): UserViewDto {
        return new UserViewDto(user);
    }
}
