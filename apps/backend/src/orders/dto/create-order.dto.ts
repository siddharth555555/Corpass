import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsNumber() productId: number;
  @IsNumber() quantity: number;
  @IsNumber() unitPrice: number;
  @IsString() shippingAddress: string;
  @IsString() billingAddress: string;
  @IsOptional() @IsString() buyerNote?: string;
  @IsOptional() @IsString() paymentMode?: string;
  @IsOptional() @IsString() buyerPincode?: string;
}
