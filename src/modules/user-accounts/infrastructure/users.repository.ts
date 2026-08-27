import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import {DomainException} from "../../../core/exceptions/domain-exceptions";
import {DomainExceptionCode} from "../../../core/exceptions/domain-exception-codes";

@Injectable()
export class UsersRepository {
  //инжектирование модели через DI
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(user: UserDocument) {
    // console.log("<----------------TEST HERE 5");

    await user.save();
    // console.log("<----------------TEST HERE 6");

  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({_id: id, deletedAt: null});

    if (!user) {
      // throw new NotFoundException('user not found');
      throw new DomainException({
        code: DomainExceptionCode.UserNotFound,
        message: 'User not found',
      });
    }

    return user;
  }
}
