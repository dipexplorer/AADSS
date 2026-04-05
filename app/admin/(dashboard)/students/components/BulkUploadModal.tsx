"use client";

import { useState, useEffect } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, FileUp, X } from "lucide-react";
import { processBulkStudentImport } from "@/lib/admin/bulk-actions";
import { createClient } from "@/lib/supabase/client";
// Assume you can grab PapaParse from CDN or just do basic manual CSV parsing
// To keep dep stack small, a robust manual parser works for 4 simple columns

export default function BulkUploadModal({ onClose }: { onClose: () => void }) {
  const [csvText, setCsvText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{count: number, total: number, log: string[] | null} | null>(null);
  const [errMessage, setErrMessage] = useState("");
  
  const [sessions, setSessions] = useState<{id: string, name: string}[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.from("academic_sessions")
      .select("id, name")
      .eq("status", "active")
      .then(({ data }) => {
         if (data && data.length > 0) {
           setSessions(data);
           setSelectedSessionId(data[0].id); // default to first active
         }
      });
  }, []);

  const handleProcess = async () => {
    if (!selectedSessionId) {
       setErrMessage("Please select a Target Academic Session first.");
       return;
    }
    if (!csvText.trim()) return;
    setIsProcessing(true);
    setErrMessage("");
    setResults(null);

    // Naive CSV parser line by line
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedRows = [];

    let headerSkipped = false;
    for (const line of lines) {
      const cols = line.split(',').map(c => c.trim());
      // Skip simple header like "email,roll_number,program,semester"
      if (!headerSkipped && cols[0].toLowerCase().includes('email')) {
        headerSkipped = true;
        continue;
      }
      
      if (cols.length >= 4) {
        parsedRows.push({
          email: cols[0],
          roll: cols[1],
          program: cols[2],
          semester: cols[3]
        });
      }
    }

    if (parsedRows.length === 0) {
      setErrMessage("No valid data rows found. Ensure format is: email, roll_number, program, semester");
      setIsProcessing(false);
      return;
    }

    try {
      const response = await processBulkStudentImport(selectedSessionId, parsedRows);
      if (response.error) {
        setErrMessage(response.error);
      } else {
        setResults({
          count: response.count ?? 0,
          total: response.total ?? 0,
          log: response.log ?? null
        });
      }
    } catch (e: any) {
      setErrMessage(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 border border-border">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/30">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileUp className="w-5 h-5 text-blue-600" />
            Bulk Import CSV
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {results ? (
            <div className="space-y-4">
               <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-green-800 dark:text-green-400">Import Complete</h3>
                    <p className="text-sm text-green-700/80">Successfully provisioned {results.count} out of {results.total} profiles.</p>
                  </div>
               </div>

               {results.log && results.log.length > 0 && (
                 <div className="text-xs bg-muted p-4 rounded-lg h-40 overflow-y-auto text-muted-foreground font-mono whitespace-pre-wrap border">
                    <p className="font-bold text-foreground mb-2">Error Logs:</p>
                    {results.log.join('\n')}
                 </div>
               )}

               <button 
                  onClick={onClose}
                  className="w-full py-2 bg-foreground text-background font-medium rounded-lg"
               >
                  Close & Refresh Page
               </button>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 p-4 rounded-xl text-sm border border-blue-200 dark:border-blue-900">
                <p className="font-bold mb-1">Strict Academic CSV Format:</p>
                <div className="font-mono text-xs overflow-x-auto bg-blue-100/50 dark:bg-black/20 p-2 rounded mt-2 border border-blue-200 dark:border-blue-800">
                  email, roll_number, program, semester<br/>
                  deep@college.edu, CSE23001, B.Tech CSE, 5<br/>
                  rahul@college.edu, CSE23002, B.Tech CSE, 5
                </div>
              </div>

              {errMessage && (
                <div className="p-3 bg-red-50 text-red-600 text-sm border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {errMessage}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Target Academic Session</label>
                <select 
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:ring-2 focus:outline-none focus:ring-blue-500/50 mb-4"
                >
                  <option value="" disabled>Select Session</option>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Paste CSV Dump</label>
                <textarea 
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="email, roll_number, program, semester..."
                  className="w-full h-40 p-3 border rounded-xl bg-background font-mono text-xs focus:ring-2 focus:outline-none focus:ring-blue-500/50"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 rounded-lg font-medium hover:bg-muted">Cancel</button>
                <button 
                  onClick={handleProcess}
                  disabled={isProcessing || !csvText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  {isProcessing ? "Provisioning Auth..." : "Run Bulk Import"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
