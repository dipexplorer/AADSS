"use client";

import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Subject {
  id: string;
  code?: string;
  name: string;
  credits?: number;
  min_attendance_required: number;
  status?: "active" | "inactive" | "archived";
}

interface Props {
  data: Subject[];
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

type SortField = "name" | "code" | "credits";
type SortOrder = "asc" | "desc";

export function SubjectsDataTable({ data, onEdit, onDelete }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const filteredAndSorted = useMemo(() => {
    let result = [...data];

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(lower) ||
          (s.code && s.code.toLowerCase().includes(lower))
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";
      
      if (sortField === "credits") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, searchTerm, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-20" />;
    return sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search subjects by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
          />
        </div>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          Showing <span className="font-medium text-foreground">{filteredAndSorted.length}</span> subjects
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
            <tr>
              <th 
                className="px-6 py-3 font-medium cursor-pointer hover:bg-muted/60 transition-colors"
                onClick={() => handleSort("code")}
              >
                <div className="flex items-center gap-2">Code <SortIcon field="code" /></div>
              </th>
              <th 
                className="px-6 py-3 font-medium cursor-pointer hover:bg-muted/60 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">Subject Name <SortIcon field="name" /></div>
              </th>
              <th 
                className="px-6 py-3 font-medium cursor-pointer hover:bg-muted/60 transition-colors"
                onClick={() => handleSort("credits")}
              >
                <div className="flex items-center gap-2">Credits <SortIcon field="credits" /></div>
              </th>
              <th className="px-6 py-3 font-medium">Min Attendance</th>
              <th className="px-6 py-3 font-medium text-center">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((subject) => (
              <tr key={subject.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors group">
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{subject.code || "—"}</td>
                <td className="px-6 py-4 font-medium text-foreground">{subject.name}</td>
                <td className="px-6 py-4">{subject.credits || 3}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    subject.min_attendance_required < 75 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30'
                  }`}>
                    {subject.min_attendance_required}%
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {(!subject.status || subject.status === "active") ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                      {subject.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(subject)} className="h-8 px-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(subject)} className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Delete</Button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredAndSorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <p>No subjects found for this criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
