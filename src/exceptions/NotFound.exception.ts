import { AppException } from './App.exception';

export class NotFoundException extends AppException {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}