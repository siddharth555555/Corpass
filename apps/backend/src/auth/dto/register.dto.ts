import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class RegisterDto {
  @IsString() @MinLength(2) name: string;
  @IsString() @MinLength(3) loginId: string;
  @IsEmail() email: string;
  @IsString() @MinLength(10) mobile: string;
  @IsString() @MinLength(6) password: string;
  @IsString() address: string;
  @IsString() city: string;
  @IsString() pincode: string;
  @IsIn(['BUYER', 'SELLER']) role: string;

  // Buyer-specific
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() companyAddress?: string;
  @IsOptional() @IsString() companyType?: string;
  @IsOptional() @IsString() employeeCount?: string;

  // Seller-specific
  @IsOptional() @IsString() gstin?: string;
  @IsOptional() @IsString() deliveryRange?: string;
  @IsOptional() deliveryCities?: any;
  @IsOptional() deliveryPincodes?: any;
}
