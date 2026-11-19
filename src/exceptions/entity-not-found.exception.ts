import { HttpException, HttpStatus } from '@nestjs/common';

export class EntityNotFoundException extends HttpException {
  constructor(entityTitle: string, id?: number) {
    if (id !== undefined) {
      super(`${entityTitle} with ${id} not found`, HttpStatus.NOT_FOUND);
    } else {
      super(
        `There is not a single ${entityTitle} in the database`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
