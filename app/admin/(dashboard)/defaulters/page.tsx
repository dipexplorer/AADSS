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
  searchParams: { semester?: string };
}) {
  const semestersResult = await getAvailableSemesters();
  const availableSemesters = semestersResult.data ?? [];
  const selectedSemesterId =
    searchParams.semester ?? availableSemesters[0]?.id ?? "";
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
