"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bike, LogOut, ShoppingBag, Sparkles, Store, UserRound } from "lucide-react";

import { useCart } from "@/components/cart-provider";
import { useToast } from "@/components/toast-provider";
import type { CustomerSession } from "@/lib/types";

const links = [
  { href: "/", label: "Home" },
  { href: "/restaurants", label: "Restaurants" },
  { href: "/orders", label: "My orders" },
  { href: "/profile", label: "Profile" },
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

export function SiteHeader({ session }: { session: CustomerSession | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { pushToast } = useToast();

  const logout = async () => {
    const response = await fetch("/api/session/logout", { method: "POST" });
    if (!response.ok) {
      pushToast("INTERNAL_ERROR", "We could not close your session right now.");
      return;
    }

    router.push("/login");
    router.refresh();
  };

  return (
    <div className="topbar">
      <div className="topbar__content">
        <Link className="brand-mark" href="/">
          <span className="brand-mark__badge">
            <Bike size={22} />
          </span>
          <span>
            DELI<span className="brand-mark__accent">UNAL</span>
          </span>
        </Link>

        <nav className="nav-links">
          {links.map((link) => (
            <Link
              className={pathname === link.href ? "nav-link--active" : undefined}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-spacer" />

        <div className="nav-links" style={{ gap: 12 }}>
          <Link className="button-secondary" href="/restaurants">
            <Store size={16} />
            Explore
          </Link>
          <Link className="button-secondary" href="/cart">
            <ShoppingBag size={16} />
            Cart {itemCount > 0 ? `(${itemCount})` : ""}
          </Link>
          {session ? (
            <>
              <span className="chip chip--success">
                <Sparkles size={14} />
                {session.name}
              </span>
              <button className="button-ghost" onClick={logout} type="button">
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="button-secondary" href="/register">
                Create account
              </Link>
              <Link className="button" href="/login">
                <UserRound size={16} />
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
