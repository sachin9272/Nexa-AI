import { SetMetadata } from '@nestjs/common';
import { ROLE_OWNER, ROLE_STAFF, ROLE_ADMIN } from '../constants';

export type AppRole = typeof ROLE_OWNER | typeof ROLE_STAFF | typeof ROLE_ADMIN;

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);

export const OwnerOnly = () => Roles(ROLE_OWNER);
