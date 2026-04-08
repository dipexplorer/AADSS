import { getPendingDeviceResets } from "@/lib/admin/deviceActions";
import SecurityClient from "./components/SecurityClient";

export const metadata = {
  title: "Security & Devices | Admin",
};

export const revalidate = 0; // Ensures data is always fresh

export default async function SecurityPage() {
  const { data, error } = await getPendingDeviceResets();

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-xl font-bold">Failed to load security alerts</h2>
        <p className="mt-2 text-sm text-foreground/70">{error}</p>
      </div>
    );
  }

  return <SecurityClient requests={data || []} />;
}
