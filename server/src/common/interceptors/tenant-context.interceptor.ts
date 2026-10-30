import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Types } from 'mongoose';
import { TenantContextService } from '../tenancy/tenant-context.service';

/**
 * Sets up the TenantContext AsyncLocalStorage from the JWT payload
 * so all downstream Mongoose queries are automatically scoped to the tenant.
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      user?: { tenantId: string; userId: string; role: string };
    }>();

    const user = request.user;
    if (!user || !user.tenantId) {
      throw new UnauthorizedException('Tenant context could not be resolved.');
    }

    return new Observable((subscriber) => {
      this.tenantContext.run(
        {
          tenantId: new Types.ObjectId(user.tenantId),
          userId: new Types.ObjectId(user.userId),
          role: user.role,
        },
        () => {
          next.handle().subscribe({
            next: (val) => subscriber.next(val),
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete(),
          });
        },
      );
    });
  }
}
