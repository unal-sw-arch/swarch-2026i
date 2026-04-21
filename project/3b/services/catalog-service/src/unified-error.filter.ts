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
      
      // 1. Si el error ya trae un código (ej. de los controladores), lo respetamos
      if (typeof res === 'object' && res.code && res.message) {
        code = res.code;
        message = Array.isArray(res.message) ? res.message[0] : res.message;
      } 
      // 2. Fallbacks para errores comunes de NestJS para mapearlos a la Biblia
      else if (status === HttpStatus.BAD_REQUEST) {
          code = 'VALIDATION_ERROR';
          message = res.message && Array.isArray(res.message) ? res.message[0] : (res.message || 'Validation failed');
      } else if (status === HttpStatus.UNAUTHORIZED) {
          code = 'UNAUTHORIZED';
          message = 'Token required or invalid';
      } else if (status === HttpStatus.FORBIDDEN) {
          code = 'FORBIDDEN';
          message = 'You do not have permission';
      }
    } else if (exception instanceof Error) {
      console.error(exception);
    }

    // Contrato unificado Biblia Pág. 23
    response.status(status).json({
      code,
      message,
    });
  }
}
