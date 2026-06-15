import { MessagesUI } from "@/components/features/MessagesUI";

export default function SellerMessagesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Messages</h1>
        <p className="text-sm text-text-secondary mt-1">Manage all buyer inquiries, negotiations, and order communication here.</p>
      </div>
      <MessagesUI role="SELLER" />
    </div>
  );
}
