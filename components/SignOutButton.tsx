"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/auth/client";

export function SignOutButton() {
  const t = useTranslations("account");
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    await signOut();

    router.replace("/auth/login");
    // Server components were rendered with a session that no longer exists.
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={pending}>
      <LogOut size={18} aria-hidden="true" />
      {t("signOut")}
    </Button>
  );
}
