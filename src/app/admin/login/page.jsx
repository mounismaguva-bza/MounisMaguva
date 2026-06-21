"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirebaseClientAuth } from "@/lib/firebase/client";

function mapAuthError(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    default:
      return "Unable to sign in. Please try again.";
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [hintUid, setHintUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    fetch("/api/admin/auth/session", { credentials: "include" })
      .then((res) => {
        if (res.ok) router.replace("/admin");
      })
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setHintUid("");
    setLoading(true);
    const auth = getFirebaseClientAuth();
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await credential.user.getIdToken(true);

      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        await signOut(auth).catch(() => {});
        if (data.uid) setHintUid(data.uid);
        throw new Error(data.error || "Login failed");
      }

      await signOut(auth).catch(() => {});
      router.replace("/admin");
      router.refresh();
    } catch (submitError) {
      const code = submitError?.code;
      setError(code ? mapAuthError(code) : submitError.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-4">
        <p className="text-sm text-[var(--color-muted)]">Checking session…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <div className="w-full rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-primary)]">
          Admin Login
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Sign in with your Firebase email and password. Admin access requires a Firestore user
          profile with document ID equal to your Auth UID and{" "}
          <code className="text-xs">role: &quot;admin&quot;</code>.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="admin-email">
              Email
            </label>
            <input
              id="admin-email"
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p>{error}</p>
              {hintUid ? (
                <p className="mt-2 text-xs">
                  Your UID: <code className="break-all">{hintUid}</code>
                  <br />
                  In Firestore create: <code>users/{hintUid}</code> with fields{" "}
                  <code>role: &quot;admin&quot;</code> and <code>email</code>.
                </p>
              ) : null}
            </div>
          ) : null}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
