import { IsString, IsOptional, IsNumber, IsIn, IsBoolean, IsArray, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString() @MinLength(1) name: string;
  @IsOptional() @IsString() description?: string;
  @IsString() category: string;
  @IsOptional() @IsString() subCategory?: string;
  @IsIn(['FIXED', 'CONTACT_FOR_QUOTE']) priceType: string;
  @IsOptional() @IsNumber() price?: number;
  @IsIn(['PIECE', 'PAIR', 'SET', 'PACK', 'BUNDLE', 'BOX', 'CARTON', 'CASE', 'DOZEN', 'GRAM', 'KILOGRAM', 'TONNE', 'QUINTAL', 'MILLILITRE', 'LITRE', 'METRE', 'FOOT', 'ROLL', 'SQ_FOOT', 'SQ_METRE', 'HOUR', 'DAY', 'MONTH', 'YEAR', 'PROJECT']) pricingUnit: string;
  @IsOptional() @IsNumber() piecesPerUnit?: number;
  @IsOptional() @IsBoolean() isDeliverable?: boolean;
  @IsOptional() @IsIn(['LOCAL_100KM', 'HYPER_LOCAL_20KM', 'SHIPPING_AVAILABLE']) deliveryRange?: string;
  @IsOptional() deliveryCities?: any;
  @IsOptional() deliveryPincodes?: any;
  @IsNumber() minQtyPurchase: number;
  @IsNumber() minAmountPurchase: number;
  @IsOptional() @IsNumber() deliveryTimeDays?: number;
  @IsOptional() @IsNumber() stockQuantity?: number;
  @IsOptional() @IsArray() images?: string[];
}
