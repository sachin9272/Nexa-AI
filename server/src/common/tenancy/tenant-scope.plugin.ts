import { Schema, Query } from 'mongoose';
import { TenantContextService } from './tenant-context.service';

let tenantContextServiceRef: TenantContextService | null = null;

export function setTenantContextServiceRef(svc: TenantContextService): void {
  tenantContextServiceRef = svc;
}

/**
 * Mongoose plugin that automatically injects `tenantId` into every query
 * for the models it is applied to. This is the primary multi-tenancy enforcement layer.
 *
 * It hooks into: find, findOne, findOneAndUpdate, updateOne, updateMany,
 * deleteOne, deleteMany, countDocuments, and distinct.
 */
export function tenantScopePlugin(schema: Schema): void {
  const QUERY_HOOKS = [
    'find',
    'findOne',
    'findOneAndUpdate',
    'updateOne',
    'updateMany',
    'deleteOne',
    'deleteMany',
    'countDocuments',
    'distinct',
    'findOneAndDelete',
  ] as const;

  for (const hook of QUERY_HOOKS) {
    schema.pre(hook, function (this: Query<unknown, unknown>) {
      if (!tenantContextServiceRef) return;
      try {
        const tenantId = tenantContextServiceRef.getTenantId();
        const currentFilter = this.getFilter() as Record<string, unknown>;
        if (!currentFilter['tenantId']) {
          this.where({ tenantId });
        }
      } catch {
        // If context is not set (e.g. background jobs use explicit tenantId), skip injection
      }
    });
  }

  schema.pre('save', function (this: Record<string, unknown>) {
    if (!tenantContextServiceRef) return;
    try {
      if (!this['tenantId']) {
        this['tenantId'] = tenantContextServiceRef.getTenantId();
      }
    } catch {
      // context not available
    }
  });
}
