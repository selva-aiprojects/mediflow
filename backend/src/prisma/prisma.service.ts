import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { requestContext } from '../context';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();

    // Middleware to automatically scope queries to the active store
    this.$use(async (params, next) => {
      const store = requestContext.getStore();
      const storeId = store?.storeId;

      if (storeId && params.model) {
        // Models that do NOT have a storeId or are global
        const excludeModels = ['Store', 'User', 'Tenant', 'Category', 'Manufacturer', 'Supplier', 'Medicine', 'MedicineSupplier'];
        
        if (!excludeModels.includes(params.model)) {
          // Add storeId to read/update/delete operations
          if (['findUnique', 'findFirst', 'findMany', 'update', 'updateMany', 'delete', 'deleteMany', 'count'].includes(params.action)) {
            params.args = params.args || {};
            params.args.where = params.args.where || {};
            
            // Prisma throws if we add non-unique fields to findUnique where clause.
            if (params.action === 'findUnique') {
              params.action = 'findFirst';
            }
            
            params.args.where.storeId = storeId;
          }
          
          // Add storeId to create operations
          if (['create', 'createMany'].includes(params.action)) {
            params.args = params.args || {};
            params.args.data = params.args.data || {};
            
            if (Array.isArray(params.args.data)) {
              params.args.data = params.args.data.map((d: any) => ({ ...d, storeId }));
            } else {
              params.args.data.storeId = storeId;
            }
          }
        }
      }
      return next(params);
    });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}