"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProductReviewsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productName, setProductName] = useState("");

  useEffect(() => {
    // We can fetch the product details just for the name, or just show "Product Reviews"
    const fetchProductName = async () => {
       try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/products/marketplace/${id}`);
         if (res.ok) {
           const data = await res.json();
           setProductName(data.name);
         }
       } catch (e) {}
    };
    fetchProductName();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/products/marketplace/${id}/reviews?page=${page}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.data);
          setTotalPages(data.totalPages);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [id, page]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20 animate-fade-in">
      <button onClick={() => router.back()} className="mb-6 flex items-center text-sm font-semibold text-muted hover:text-ink transition-colors">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Product
      </button>

      <h1 className="text-2xl font-bold text-ink mb-2">All Reviews</h1>
      {productName && <p className="text-sm font-medium text-muted mb-8">For <span className="text-ink">{productName}</span></p>}

      {loading ? (
        <div className="p-16 text-center text-muted">Loading reviews...</div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((r: any) => (
             <div key={r.id} className="bg-surface border border-border rounded-xl p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex text-warning">
                    {[...Array(r.productRating)].map((_, j) => <svg key={j} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                  </div>
                  <span className="text-[11px] font-bold text-muted bg-surface-2 px-2 py-1 rounded-md">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-[15px] font-medium text-ink mb-4">"{r.productComment || 'No comment provided.'}"</p>
                
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                    {(r.reviewer?.company?.name || r.reviewer?.name || 'U').charAt(0)}
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-ink leading-tight">{r.reviewer?.company?.name || r.reviewer?.name}</p>
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">Verified Buyer</p>
                  </div>
                </div>
             </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="cp-btn cp-btn--secondary py-1 px-3 disabled:opacity-50 text-sm">Previous</button>
              <span className="flex items-center text-sm font-semibold text-muted px-4">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="cp-btn cp-btn--secondary py-1 px-3 disabled:opacity-50 text-sm">Next</button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-16 text-center text-muted bg-surface border border-border rounded-xl">
          No reviews found for this product.
        </div>
      )}
    </div>
  );
}
