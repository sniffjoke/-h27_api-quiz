export class CommentatorInfoModel {
    userId: string;
    userLogin: string;
}

export class LikesInfo  {
    likesCount: number
    dislikesCount: number
}

export class CommentViewModel {
    id: string;
    content: string;
    commentatorInfo: CommentatorInfoModel
    createdAt: string;
    likesInfo: LikesInfo
}
