import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
    constructor(
        @InjectConnection() private readonly databaseConnection: Connection,
        @InjectDataSource() protected dataSource: DataSource,
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
        // const collections = await this.databaseConnection.listCollections();
        //
        // const promises = collections.map((collection) =>
        //     this.databaseConnection
        //         .collection(collection.name)
        //         .deleteMany({}) // ✅ Безопасно очищает документы, СОХРАНЯЯ индексы и структуру!
        // );
        //
        // await Promise.all(promises);

        // Возвращать ничего не нужно, так как стоит @HttpCode(HttpStatus.NO_CONTENT)

        // 1. Получаем список всех существующих таблиц в схеме 'public'
        const tables: Array<{ tablename: string }> = await this.dataSource
            .query(`
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
              AND tablename NOT LIKE 'spatial_%'; -- исключаем системные таблицы, если есть
        `);

        if (tables.length === 0) return;

        // 2. Формируем строку вида: "user_sessions", "users", "posts"
        const tableNames = tables.map((t) => `"${t.tablename}"`).join(', ');

        // 3. Выполняем очистку всех найденных таблиц
        await this.dataSource.query(`
    TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;
  `);

        console.log(
            `Successfully cleared ${tables.length} tables: ${tableNames} `,
        );

        return tableNames;
    }
}
