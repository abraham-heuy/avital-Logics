import { AppException } from './App.exception';

export class ForbiddenException extends AppException {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}