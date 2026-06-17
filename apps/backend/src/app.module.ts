import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { OrdersModule } from './orders/orders.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AssetsModule } from './assets/assets.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { SupportModule } from './support/support.module';
import { CitiesModule } from './cities/cities.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProductsModule,
    InquiriesModule,
    OrdersModule,
    InvoicesModule,
    AssetsModule,
    ReviewsModule,
    CloudinaryModule,
    SupportModule,
    CitiesModule,
    AdminModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
