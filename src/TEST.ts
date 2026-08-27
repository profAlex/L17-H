import { GetPostsQueryParams } from './modules/bloggers-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    Post,
    PostModelType,
} from './modules/bloggers-platform/posts/domain/post.entity';
import { PostLikesQueryRepository } from './modules/bloggers-platform/likes/infrastructure/query/post-likes.query-repository';
import { SortDirection } from './core/dto/base.query-params.input-dto';
import { LikeStatus } from './core/enums/like-status.enum';
import {
    PostLike,
    PostLikeModelType,
} from './modules/bloggers-platform/likes/domain/post-like.entity';
import { HydratedDocument } from 'mongoose';
import { PaginatedViewDto } from './core/dto/base.paginated.view-dto';
import { PostViewDto } from './modules/bloggers-platform/posts/api/view-dto/posts.view-dto';

@Injectable()
class testingMapping {
    constructor(
        @InjectModel(Post.name) private PostModel: PostModelType,
        private readonly postLikesQueryRepository: PostLikesQueryRepository,
        @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
    ) {}

    // задача - в каждый отдельный пост в общей выдаче, вставить статус лайка
    // выданного (или не выданного) юзером, который запросил саму выдачу.
    // то есть найти как лайкнул или не лайкнул пост в выдаче юзер

    // для этого:
    // 1) находим все посты по заданным параметрам сортировки
    // 2) отдельно выдираем только адишники постов которые были сформированы
    // выдачей в массив и идем в репозиторий харнящий лайки постов и находим
    // по фильтру юзера все посты которые были им лайкнуты одним запросом find;
    // формируем массив содержащий postId и likeStatus
    // 3) далее сформированный массив переделываем в словарь map в котором каждому
    // postId соответствует likeStatus
    // 4) методами mapToView последовательно маппим результат
    async testGettingMyStatus({
        sentUserId,
        query,
    }: {
        sentUserId?: string | undefined;
        query: GetPostsQueryParams;
    }): Promise<void> {
        const { sortBy, sortDirection, pageNumber, pageSize } = query;
        const skip = query.calculateSkip();

        const filter = { deletedAt: null };
        const [postsList, totalCount] = await Promise.all([
            this.PostModel.find(filter)
                .sort({
                    [sortBy]: sortDirection === SortDirection.Asc ? 1 : -1,
                })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            this.PostModel.countDocuments(filter),
        ]);

        const likesMap = new Map<string, LikeStatus>(); // это
        if (sentUserId && postsList.length > 0) {
            const postIdsList = postsList.map((post) => post._id.toString());
            const userReactions =
                await this.postLikesQueryRepository.getReactionListForPosts(
                    postIdsList,
                    sentUserId,
                );

            userReactions.forEach((reaction) => {
                likesMap.set(reaction.postId.toString(), reaction.likeStatus);
            });
        }
    }

    // задача - в каждый отдельный пост в общей выдаче, вставить статус лайка
    // выданного (или не выданного) юзером, который запросил саму выдачу.
    // то есть найти как лайкнул или не лайкнул пост в выдаче юзер

    // для этого:
    // 1) находим все посты по заданным параметрам сортировки
    // 2) отдельно выдираем только адишники постов которые были сформированы
    // выдачей в массив и идем в репозиторий харнящий лайки постов и находим
    // по фильтру юзера все посты которые были им лайкнуты одним запросом find;
    // формируем массив содержащий postId и likeStatus
    // 3) далее сформированный массив переделываем в словарь map в котором каждому
    // postId соответствует likeStatus
    // 4) методами mapToView последовательно маппим результат
    async anotherTestGettingMyStatus({
        sentUserId,
        query,
    }: {
        sentUserId?: string | undefined;
        query: GetPostsQueryParams;
    }): Promise<void> {
        const { sortBy, sortDirection, pageNumber, pageSize } = query;
        const skip = query.calculateSkip();

        const filter = { deletedAt: null };
        const [postsList, countDocuments] = await Promise.all([
            this.PostModel.find(filter)
                .sort({
                    [sortBy]: sortDirection === SortDirection.Asc ? 1 : -1,
                })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            this.PostModel.countDocuments(filter),
        ]);

        const likesMap = new Map<string, LikeStatus>();
        if (sentUserId) {
            const postIds = postsList.map((post) => post._id.toString());
            const userReactions = await getReactionListForPosts(
                postIds,
                sentUserId,
            );
            userReactions.forEach((reaction) => {
                likesMap.set(reaction.postId.toString(), reaction.myStatus);
            });
        }
    }
}

async function getReactionListForPosts(
    postIds: string[],
    userId: string,
): Promise<Array<{ postId: string; myStatus: LikeStatus }>> {
    const reactions = (await this.PostLikeModel.find({
        userId: userId,
        postId: { $in: postIds },
    }).lean()) as PostLike[];

    return reactions.map((reaction) => ({
        postId: reaction.postId.toString(),
        myStatus: reaction.likeStatus,
    }));
}
