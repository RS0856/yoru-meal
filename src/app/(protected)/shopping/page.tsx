import ShoppingClient, { ShoppingData } from "@/app/shopping/ShoppingClient";

export const dynamic = "force-dynamic";

async function fetchLatest(): Promise<ShoppingData | null> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/shopping/latest`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
}

export default async function ShoppingPageServer() {
    const initialData = await fetchLatest();
    return <ShoppingClient initialData={initialData} />;
} 