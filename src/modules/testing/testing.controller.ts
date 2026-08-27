import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectConnection() private readonly databaseConnection: Connection,
  ) {}

  // @Delete('all-data')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteAll() {
  //   const collections = await this.databaseConnection.listCollections();
  //
  //
  //   const promises = collections.map((collection) =>
  //       // Вместо deleteMany({}) мы полностью сносим коллекцию вместе с индексами
  //       this.databaseConnection.collection(collection.name).drop()
  //           .catch(err => {
  //             // На случай, если коллекция уже была удалена или пуста,
  //             // ловим ошибку, чтобы Promise.all не упал
  //             console.log(`Коллекция ${collection.name} не смогла удалиться:`, err.message);
  //           })
  //   );
  //
  //   await Promise.all(promises);
  //
  //   return {
  //     status: 'succeeded',
  //   };
  // }

  // .drop(), MongoDB полностью удаляет коллекцию вместе со всеми индексами.
  // Если в схемах (например, в Mongoose-модели RateLimit или Session) установлены
  // уникальные индексы или TTL-индексы (авто-удаление по времени), после первого
  // же вызова DELETE /testing/all-data эти индексы пропадают навсегда! Mongoose
  // создает индексы только при инициализации приложения. После .drop() индексы
  // не пересоздаются, из-за чего логика уникальности сессий, поиска по IP
  // или автоочистки ломается.
  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    const collections = await this.databaseConnection.listCollections();

    const promises = collections.map((collection) =>
        this.databaseConnection
            .collection(collection.name)
            .deleteMany({}) // ✅ Безопасно очищает документы, СОХРАНЯЯ индексы и структуру!
    );

    await Promise.all(promises);

    // Возвращать ничего не нужно, так как стоит @HttpCode(HttpStatus.NO_CONTENT)
  }
}
