"use client";

import { useState } from "react";
import {
  CalendarOff,
  Plus,
  Trash2,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { addHoliday, deleteHoliday, bulkImportHolidays } from "@/lib/admin/holidays";

export default function HolidaysClient({
  holidays,
  session,
  error,
}: {
  holidays: any[];
  session: any;
  error: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    const formData = new FormData();
    formData.append("date", date);
    formData.append("title", title);
    formData.append("session_id", session.id);

    const res = await addHoliday(null, formData);
    if (res.error) setFormError(res.error);
    else {
      setDate("");
      setTitle("");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this holiday? Classes cancelled by this holiday will REMAIN cancelled manually. Continue?")) return;
    
    setLoading(true);
    const res = await deleteHoliday(id);
    if (res.error) alert(res.error);
    setLoading(false);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n").map(r => r.trim()).filter(Boolean);
      
      const payload: { date: string, title: string }[] = [];
      // Skip header (i=1)
      for(let i = 1; i < rows.length; i++) {
        const [d, t] = rows[i].split(",");
        if (d && t) {
          payload.push({ date: d.trim(), title: t.trim() });
        }
      }

      if (payload.length === 0) {
        alert("No valid rows found in CSV. Expected: Date(YYYY-MM-DD),Title");
        setCsvLoading(false);
        return;
      }

      const res = await bulkImportHolidays(payload, session.id);
      if (res.error) alert(`Failed: ${res.error}`);
      else alert(`Successfully imported ${payload.length} holidays!`);
      
      setCsvLoading(false);
      // Reset input
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-red-500" />
            Global Holidays
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage public holidays and breaks for <strong>{session.name}</strong>.
            <br />
            <span className="text-xs text-amber-600 bg-amber-50 px-2 rounded-full py-0.5 mt-1 inline-block">
              Note: Adding a holiday automatically cancels all classes scheduled on that date.
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="border-zinc-300 gap-2 w-full sm:w-auto"
            onClick={() => {
              const csvContent = "Date,Title\n2026-08-15,Independence Day\n2026-10-31,Diwali Break\n";
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement("a");
              const url = URL.createObjectURL(blob);
              link.setAttribute("href", url);
              link.setAttribute("download", "holidays_template.csv");
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Download Template
          </Button>

          <div className="relative group w-full sm:w-auto">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleCSVUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={csvLoading}
            />
            <Button variant="default" className="gap-2 pointer-events-none bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto" disabled={csvLoading}>
              {csvLoading ? "Processing..." : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload CSV
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* ADD HOLIDAY FORM */}
        <div className="md:col-span-1 bg-white border border-zinc-200 p-6 rounded-xl shadow-sm h-fit">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">
            Record Holiday
          </h2>
          {formError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {formError}
            </div>
          )}
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">
                Occasion / Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Diwali Break"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
            >
              {loading ? "Saving..." : "Add Holiday"}
            </Button>
          </form>
          
          <div className="mt-6 border-t border-zinc-100 pt-4">
            <h3 className="text-xs font-semibold text-zinc-500 mb-2">CSV Import Format:</h3>
            <pre className="text-[10px] bg-zinc-50 p-2 rounded text-zinc-600">
              Date,Title{"\n"}
              2026-08-15,Independence Day{"\n"}
              2026-10-31,Diwali
            </pre>
          </div>
        </div>

        {/* HOLIDAY LIST */}
        <div className="md:col-span-2">
          {error && <div className="text-red-500">{error}</div>}
          
          {holidays.length === 0 ? (
             <div className="p-12 border border-dashed border-zinc-200 rounded-xl flex items-center justify-center text-center">
               <div>
                  <CalendarOff className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-zinc-600">No Holidays Recorded</h3>
                  <p className="text-xs text-zinc-400 mt-1">Holidays for this session will appear here.</p>
               </div>
             </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
               <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase text-zinc-500 font-semibold">
                     <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Occasion</th>
                        <th className="px-4 py-3">Added On</th>
                        <th className="px-4 py-3 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                     {holidays.map((h) => (
                        <tr key={h.id} className="hover:bg-zinc-50/50">
                           <td className="px-4 py-3 font-medium text-zinc-900">
                              {new Date(h.date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                           </td>
                           <td className="px-4 py-3 text-zinc-600">{h.title}</td>
                           <td className="px-4 py-3 text-zinc-400 text-xs">
                              {new Date(h.created_at).toLocaleDateString()}
                           </td>
                           <td className="px-4 py-3 text-right">
                              <button 
                                onClick={() => handleDelete(h.id)}
                                disabled={loading}
                                className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors disabled:opacity-50"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
