"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function formatPriceMain(p: any): string {
  if (p.priceType === 'FIXED') return `₹${Number(p.price).toLocaleString('en-IN')}`;
  return 'Get Quote';
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/products/marketplace/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="p-16 text-center text-muted">Loading product details...</div>;
  }

  if (!product) {
    return <div className="p-16 text-center text-muted">Product not found.</div>;
  }

  const supplier = product.sellerProfile?.user?.company?.name || product.sellerProfile?.user?.name || 'Unknown Supplier';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20 animate-fade-in">
      <button onClick={() => router.back()} className="mb-6 flex items-center text-sm font-semibold text-muted hover:text-ink transition-colors">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Catalog
      </button>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm mb-8">
        <div className="md:flex">
          {/* Images */}
          <div className="md:w-1/2 bg-surface-3 p-8 flex items-center justify-center min-h-[300px]">
             {product.images && product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-auto max-h-[400px] object-contain mix-blend-multiply drop-shadow-md" />
             ) : (
                <svg className="w-24 h-24 text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             )}
          </div>

          {/* Info */}
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{product.category}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate bg-surface-2 px-2 py-0.5 rounded-full">{product.subCategory}</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-ink leading-tight mb-2">{product.name}</h1>
            <p className="text-sm font-medium text-muted mb-4 border-b border-border pb-4">By <span className="text-ink">{supplier}</span></p>

            {/* Ratings Summary */}
            <div className="flex gap-6 mb-6">
               <div>
                 <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate mb-1">Product Rating</p>
                 <div className="flex items-center gap-1">
                   <span className="text-lg font-black text-warning">{product.productAvgRating || '-'}</span>
                   <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                   <span className="text-xs font-semibold text-muted ml-1">({product.productReviewCount} reviews)</span>
                 </div>
               </div>
            </div>

            <div className="mb-6 bg-surface-2 rounded-lg p-4 border border-border">
               <span className="block text-2xl font-black text-ink mb-1">{formatPriceMain(product)}</span>
               <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Min. Order: {product.minQtyPurchase} {product.pricingUnit}</p>
            </div>

            <div className="mt-auto flex gap-3">
              <button className="flex-1 cp-btn cp-btn--primary py-3 text-sm">Buy Now</button>
              <button className="flex-1 cp-btn cp-btn--secondary py-3 text-sm">Inquire</button>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-12">
        <h3 className="text-lg font-bold text-ink mb-4 font-sans">Product Description</h3>
        <div className="bg-surface border border-border rounded-xl p-6">
          <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{product.description || 'No description provided.'}</p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-lg font-bold text-ink font-sans">Featured Reviews</h3>
          <Link href={`/dashboard/buyer/catalog/${id}/reviews`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            See all reviews →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Positive Reviews */}
          <div>
             <h4 className="text-sm font-bold text-success flex items-center gap-2 mb-4">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
               Top Positive
             </h4>
             <div className="space-y-4">
               {product.topReviews?.positive?.length > 0 ? product.topReviews.positive.map((r: any, i: number) => (
                 <div key={i} className="bg-surface border border-border rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex text-warning">
                        {[...Array(r.productRating)].map((_, j) => <svg key={j} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                      </div>
                      <span className="text-[10px] font-bold text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-medium text-ink mb-2">"{r.productComment || 'Great product!'}"</p>
                    <p className="text-[11px] font-bold text-slate">- {r.reviewer?.company?.name || r.reviewer?.name}</p>
                 </div>
               )) : <p className="text-sm text-muted italic p-4 bg-surface-2 rounded-xl">No positive reviews yet.</p>}
             </div>
          </div>

          {/* Negative Reviews */}
          <div>
             <h4 className="text-sm font-bold text-danger flex items-center gap-2 mb-4">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
               Critical Reviews
             </h4>
             <div className="space-y-4">
               {product.topReviews?.negative?.length > 0 ? product.topReviews.negative.map((r: any, i: number) => (
                 <div key={i} className="bg-surface border border-border rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex text-warning">
                        {[...Array(r.productRating)].map((_, j) => <svg key={j} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                      </div>
                      <span className="text-[10px] font-bold text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-medium text-ink mb-2">"{r.productComment || 'Had some issues.'}"</p>
                    <p className="text-[11px] font-bold text-slate">- {r.reviewer?.company?.name || r.reviewer?.name}</p>
                 </div>
               )) : <p className="text-sm text-muted italic p-4 bg-surface-2 rounded-xl">No critical reviews yet.</p>}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
