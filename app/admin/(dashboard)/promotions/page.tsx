/*
 * ─────────────────────────────────────────────────────────────────────────────
 *  page.tsx — Promotions Server Page
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  TEACHING NOTES:
 *
 *  "Server Component" kya hai?
 *  Next.js App Router mein, by default har page.tsx ek "Server Component" hota
 *  hai. Matlab wo sirf server par chalta hai — user ka browser directly
 *  aane se pehle hi data ready hota hai.
 *
 *  Ye pattern: page.tsx (Server) → Client Component (Browser)
 *
 *  1. page.tsx: Server par getPromotionData() call karo (database query)
 *  2. Data PromotionClient ko "props" ke zariye bhej do
 *  3. PromotionClient: Browser mein render hota hai + interactive buttons kaam karte hain
 *
 *  Faida: Database ka kaam server karta hai (fast, secure),
 *         UI ka kaam browser karta hai (interactive).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { getPromotionData } from "@/lib/admin/promotionActions";
import PromotionClient from "./components/PromotionClient";
import { GraduationCap } from "lucide-react";

export const metadata = {
  title: "Bulk Promotion | Admin Panel",
};

export default async function PromotionsPage() {
  // Server pe data fetch karo — ye Next.js ka magic hai!
  // Ye function directly database se baat karta hai, koi API nahi chahiye.
  const result = await getPromotionData();

  if (result?.error) {
    return (
      <div className="p-8 text-center text-red-500">
        <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm font-medium">Failed to load promotion data.</p>
        <p className="text-xs text-muted-foreground mt-1">{result.error}</p>
      </div>
    );
  }

  // Data ko PromotionClient (browser component) ko "props" ke through bhejo
  return <PromotionClient programs={result.data!} />;
}
