import { IsNumber, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateInquiryDto {
  @IsNumber() sellerProfileId: number;
  @IsOptional() @IsNumber() productId?: number;
  @IsOptional() @IsString() customProductRequest?: string;
  @IsIn(['QUOTE', 'FEASIBILITY', 'AVAILABILITY']) inquiryType: string;
  @IsString() buyerMessage: string;
}
