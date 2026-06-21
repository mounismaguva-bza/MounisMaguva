import TrackOrderForm from "@/components/order/TrackOrderForm";

export const metadata = {
  title: "Track Order",
  description: "Track your Mouni's Maguva order by mobile number or email.",
};

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="section-title">Track Your Order</h1>
        <p className="section-subtitle mx-auto mt-3">
          Track active orders by mobile number or email. Delivered orders are not shown.
        </p>
      </div>
      <TrackOrderForm />
    </div>
  );
}
