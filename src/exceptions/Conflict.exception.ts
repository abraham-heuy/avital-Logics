import { AppException } from './App.exception';

export class ConflictException extends AppException {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}