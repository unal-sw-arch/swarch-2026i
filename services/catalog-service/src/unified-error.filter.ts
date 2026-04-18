import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class UnifiedErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      
      // Manejar estructura de error unificado de NestJS ValidationPipe
      if (typeof res === 'object' && res.code && res.message) {
        code = res.code;
        message = Array.isArray(res.message) ? res.message[0] : res.message;
      } else if (status === HttpStatus.BAD_REQUEST) {
          code = 'VALIDATION_ERROR';
          message = Array.isArray(res.message) ? res.message[0] : (res.message || 'Validation failed');
      } else if (status === HttpStatus.NOT_FOUND) {
          code = 'NOT_FOUND';
          message = res.message || 'Resource not found';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      console.error(exception);
    }

    // Contrato unificado Biblia Pág. 23
    response.status(status).json({
      code,
      message,
    });
  }
}
