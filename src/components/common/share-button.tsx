"use client";

import { useState } from "react";
import { Share2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareButton() {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  async function handleShare() {
    const url = window.location.href;
    const title = document.title;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      {state === "copied" ? (
        <>
          <Check className="size-4" />
          Copied!
        </>
      ) : state === "error" ? (
        <>
          <X className="size-4" />
          Failed
        </>
      ) : (
        <>
          <Share2 className="size-4" />
          Share
        </>
      )}
    </Button>
  );
}
