// RTM OS — Login page
//
// Single sign-in method: Google (via Supabase Auth).
// No password field, no magic link.
// Domain restriction (@rtm.agency) is enforced server-side in the OAuth
// callback. A UI message covers the rejected-domain case clearly.

"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

// Google "G" icon — inline SVG, no external dependency
function IconGoogle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

type State = "idle" | "loading" | "error";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Error passed back from the callback (e.g. domain rejection)
  const callbackError = searchParams?.error;
  const callbackMessage = searchParams?.message;

  async function handleGoogleSignIn() {
    setState("loading");
    setErrorMsg(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          // Request Google Workspace accounts only — cosmetic hint; enforcement
          // is server-side in the callback.
          hd: "rtm.agency",
        },
      },
    });

    if (error) {
      setState("error");
      setErrorMsg(error.message);
    }
    // On success, the browser is redirected by Supabase; no local state change.
  }

  const displayError =
    callbackError === "domain_not_allowed"
      ? callbackMessage ?? "Only @rtm.agency addresses may sign in."
      : callbackError === "auth_failed"
        ? callbackMessage ?? "Sign-in failed. Please try again."
        : errorMsg;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--rtm-bg)" }}
    >
      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl shadow-lg overflow-hidden"
        style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
      >
        {/* Header band — charcoal */}
        <div
          className="px-8 pt-8 pb-6 flex flex-col items-center gap-3"
          style={{ background: "#231f20" }}
        >
          <Image
            src="/rtm-logo.png"
            alt="Real Time Marketing"
            width={160}
            height={40}
            priority
            className="object-contain"
            style={{ filter: "brightness(1.1) saturate(0.9)" }}
          />
          <p
            className="text-xs font-semibold tracking-widest uppercase mt-1"
            style={{ color: "rgba(200,213,238,0.55)" }}
          >
            RTM OS
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-8 flex flex-col gap-5">
          <div className="text-center">
            <h1
              className="text-lg font-bold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              Sign in to RTM OS
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--rtm-text-secondary)" }}
            >
              Use your @rtm.agency Google account
            </p>
          </div>

          {/* Error banner */}
          {displayError && (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                background: "rgba(220,38,38,0.08)",
                border: "1px solid rgba(220,38,38,0.25)",
                color: "#b91c1c",
              }}
            >
              {displayError}
            </div>
          )}

          {/* Google sign-in button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={state === "loading"}
            className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background:
                state === "loading"
                  ? "var(--rtm-blue-dark)"
                  : "var(--rtm-blue)",
              color: "#ffffff",
              boxShadow: "0 1px 4px rgba(29,112,159,0.3)",
            }}
            onMouseEnter={(e) => {
              if (state !== "loading")
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--rtm-blue-dark)";
            }}
            onMouseLeave={(e) => {
              if (state !== "loading")
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--rtm-blue)";
            }}
          >
            <IconGoogle className="w-5 h-5 flex-shrink-0" />
            {state === "loading" ? "Redirecting…" : "Continue with Google"}
          </button>

          {/* Domain note */}
          <p
            className="text-center text-xs"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Access is restricted to Real Time Marketing staff.
          </p>
        </div>
      </div>

      {/* Footer */}
      <p
        className="mt-6 text-xs"
        style={{ color: "var(--rtm-text-muted)" }}
      >
        © {new Date().getFullYear()} Real Time Marketing
      </p>
    </div>
  );
}
