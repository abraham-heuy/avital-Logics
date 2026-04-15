import { AppException } from './App.exception';

export class BadRequestException extends AppException {
  constructor(message: string = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
  }
}