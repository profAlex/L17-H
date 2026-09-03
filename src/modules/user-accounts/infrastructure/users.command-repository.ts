import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import {DomainException} from "../../../core/exceptions/domain-exceptions";
import {DomainExceptionCode} from "../../../core/exceptions/domain-exception-codes";
import { DataSource } from 'typeorm';
import { SQLUser } from '../domain/sql-user.entitry';

@Injectable()
export class UsersCommandRepository {
  //инжектирование модели через DI
  constructor(@InjectModel(User.name) private UserModel: UserModelType,
  private readonly dataSource: DataSource,) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  // async save(user: UserDocument) {
  //   // console.log("<----------------TEST HERE 5");
  //
  //   await user.save();
  //   // console.log("<----------------TEST HERE 6");
  //
  // }

  async save(user: SQLUser): Promise<void> {
    const query = `
      INSERT INTO users (
        id,
        login,
        email,
        password_hash,
        is_email_confirmed,
        confirmation_code,
        confirmation_code_expiration_date,
        first_name,
        last_name,
        created_at,
        updated_at,
        deleted_at,
        recovery_code,
        recovery_code_expiration_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
    `;

    const queryParams = [
      user.id,
      user.login,
      user.email,
      user.passwordHash,
      user.isEmailConfirmed,
      user.emailConfirmationInfo.confirmationCode,
      user.emailConfirmationInfo.expirationDate,
      user.name.firstName,
      user.name.lastName,
      user.createdAt,
      user.updatedAt,
      user.deletedAt,
      user.recoveryCode,
      user.recoveryCodeExpirationDate,
    ];

    await this.dataSource.query(query, queryParams);
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
