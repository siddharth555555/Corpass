import { IsNumber, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateInvoiceDto {
  @IsOptional() @IsNumber() orderId?: number;
  @IsNumber() buyerId: number;
  @IsString() productName: string;
  @IsIn(['PIECE', 'PAIR', 'SET', 'PACK', 'BUNDLE', 'BOX', 'CARTON', 'CASE', 'DOZEN', 'GRAM', 'KILOGRAM', 'TONNE', 'QUINTAL', 'MILLILITRE', 'LITRE', 'METRE', 'FOOT', 'ROLL', 'SQ_FOOT', 'SQ_METRE', 'HOUR', 'DAY', 'MONTH', 'YEAR', 'PROJECT']) pricingUnit: string;
  @IsNumber() unitPrice: number;
  @IsNumber() quantity: number;
  @IsNumber() totalAmount: number;
  @IsOptional() @IsString() shippingAddress?: string;
  @IsOptional() @IsString() billingAddress?: string;
  @IsOptional() @IsString() notes?: string;
}
