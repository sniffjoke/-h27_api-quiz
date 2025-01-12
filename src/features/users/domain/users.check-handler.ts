import { ForbiddenException } from '@nestjs/common';


export class UsersCheckHandler {
  checkIsOwner(featureOwnerId: number, userId: number) {
    if (featureOwnerId !== userId) {
      throw new ForbiddenException('User is not owner');
    } else {
      return true;
    }
  }
}
