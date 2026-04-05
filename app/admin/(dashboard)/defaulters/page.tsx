import { getDefaultersReport } from "@/lib/admin/defaulters";
import DefaultersClient from "./components/DefaultersClient";

export default async function AdminDefaultersPage() {
  const { data, error } = await getDefaultersReport();

  return <DefaultersClient data={data ?? []} error={error} />;
}
