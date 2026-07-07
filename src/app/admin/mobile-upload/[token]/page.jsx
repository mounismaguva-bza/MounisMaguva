import Link from "next/link";
import { getAdminFromCookies } from "@/lib/admin-auth";
import { getUploadSession } from "@/lib/upload-session";
import MobileUploadPage from "@/components/admin/MobileUploadPage";

export const metadata = {
  title: "Mobile Upload",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMobileUploadPage({ params }) {
  const admin = await getAdminFromCookies();
  const { token } = await params;

  if (!admin) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center gap-4 px-4 py-8 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-primary)]">
          Sign in required
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Log in to admin on this phone first, then open the upload link again.
        </p>
        <Link
          href={`/admin/login?next=/admin/mobile-upload/${token}`}
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white"
        >
          Go to admin login
        </Link>
      </div>
    );
  }

  const session = await getUploadSession(token);

  if (!session || session.adminId !== admin.uid) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center gap-4 px-4 py-8 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-primary)]">
          Upload link expired
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Go back to the product form and tap <strong>Show upload QR code</strong> again to get a
          fresh link.
        </p>
        <Link
          href="/admin/products"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--color-border)] px-4 text-sm font-medium"
        >
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <MobileUploadPage
      token={token}
      initialSession={{
        token,
        color: session.color,
        productId: session.productId,
        images: session.images || [],
      }}
    />
  );
}
