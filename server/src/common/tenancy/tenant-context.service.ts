import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

export interface TenantContextPayload {
  tenantId: Types.ObjectId;
  userId: Types.ObjectId;
  role: string;
}

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantContextPayload>();

  run<T>(context: TenantContextPayload, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  getContext(): TenantContextPayload {
    const ctx = this.storage.getStore();
    if (!ctx) {
      throw new Error(
        'TenantContext is not initialized. Ensure TenantContextInterceptor is applied.',
      );
    }
    return ctx;
  }

  getTenantId(): Types.ObjectId {
    return this.getContext().tenantId;
  }

  getUserId(): Types.ObjectId {
    return this.getContext().userId;
  }

  getRole(): string {
    return this.getContext().role;
  }
}
