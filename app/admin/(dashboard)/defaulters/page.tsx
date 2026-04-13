import {
  getAvailableSemesters,
  getDefaultersReport,
} from "@/lib/admin/defaulters";
import DefaultersClient from "./components/DefaultersClient";

export const metadata = {
  title: "Eligibility Report | Admin Panel",
};

export default async function AdminDefaultersPage({
  searchParams,
}: {
  searchParams: Promise<{ semester?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const semestersResult = await getAvailableSemesters();
  const availableSemesters = semestersResult.data ?? [];
  
  const selectedSemesterId =
    resolvedSearchParams.semester ?? availableSemesters[0]?.id ?? "";
    
  const { data, error } = selectedSemesterId
    ? await getDefaultersReport(selectedSemesterId)
    : { data: [], error: null };

  return (
    <DefaultersClient
      data={data ?? []}
      error={error}
      semesters={availableSemesters}
      selectedSemesterId={selectedSemesterId}
    />
  );
}
