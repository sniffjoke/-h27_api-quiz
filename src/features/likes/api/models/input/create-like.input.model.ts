import { LikeStatus } from '../../../../posts/api/models/output/post.view.model';
import { Matches } from 'class-validator';

export class CreateLikeInput {
  @Matches(/\b(?:Like|Dislike|None)\b/)
  likeStatus: LikeStatus
}
