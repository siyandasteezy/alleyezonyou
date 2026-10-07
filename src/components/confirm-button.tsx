"use client";

import { useFormStatus } from "react-dom";

/** Submit button for a server-action form, with an optional "are you sure?" prompt. */
export function SubmitButton({
  children,
  confirm: message,
  className = "btn-outline btn-sm",
}: {
  children: React.ReactNode;
  confirm?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (message && !window.confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}
