import { AppException } from './App.exception';

export class UnauthorizedException extends AppException {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}