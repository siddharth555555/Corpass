import { MessagesUI } from "@/components/features/MessagesUI";

export default function BuyerMessagesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Messages</h1>
        <p className="text-sm text-text-secondary mt-1">Manage all your inquiries, negotiations, and order updates here.</p>
      </div>
      <MessagesUI role="BUYER" />
    </div>
  );
}
