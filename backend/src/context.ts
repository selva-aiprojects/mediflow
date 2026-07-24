import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  storeId?: string;
  userId?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();
