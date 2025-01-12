import { IsBoolean } from 'class-validator';


export enum PublishedStatuses {
  ALL = 'all',
  PUBLISHED = 'published',
  NOTPUBLISHED = 'notPublished',
}

export class UpdatePublishStatusInputModel {
  @IsBoolean()
  published: boolean;
}
