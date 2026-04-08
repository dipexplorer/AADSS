"use client";

import { useState, useTransition } from "react";
import {
  approveDeviceReset,
  rejectDeviceReset,
} from "@/lib/admin/deviceActions";
import { toast } from "react-hot-toast";
import { ShieldAlert, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SecurityClientProps {
  requests: any[];
}

export default function SecurityClient({ requests }: SecurityClientProps) {
  const [isPending, startTransition] = useTransition();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  function handleApprove(requestId: string, userId: string, profileId: string) {
    startTransition(async () => {
      const res = await approveDeviceReset(requestId, userId, profileId);
      if (res.error) toast.error(res.error);
      else toast.success("Device has been unlinked successfully!");
    });
  }

  function handleReject(requestId: string) {
    if (!rejectNotes.trim()) {
      toast.error("Please provide a reason for rejecting the request.");
      return;
    }
    startTransition(async () => {
      const res = await rejectDeviceReset(requestId, rejectNotes);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Request rejected.");
        setRejectingId(null);
        setRejectNotes("");
      }
    });
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-[calc(100vh-4rem)]">
      <div className="mb-8 border-b border-border/50 pb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-primary" />
          Security Alerts & Device Resets
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          Students who have lost their device or changed phones are locked out
          of attendance due to fingerprint mapping. Review their requests here
          to approve linking a new device.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-card/50 border border-border border-dashed rounded-2xl p-10 mt-6 text-center">
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">All Clear!</h3>
          <p className="text-muted-foreground text-sm">
            No pending device reset operations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-card border border-border/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-start">
                {/* Information Block */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">
                      {(r.student_profiles as any)?.full_name ?? "Unknown"}
                    </h3>
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      Pending Action
                    </span>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mb-3 divide-x divide-border">
                    <span className="pr-3">
                      Roll No:{" "}
                      {(r.student_profiles as any)?.roll_number ?? "N/A"}
                    </span>
                    <span className="pl-3">
                      {(r.student_profiles as any)?.email}
                    </span>
                  </div>

                  <div className="bg-muted/40 p-4 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">
                        Student's Reason
                      </h4>
                      <p className="text-sm text-foreground/90 leading-relaxed italic">
                        "{r.reason}"
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-2 font-mono">
                        Requested on:{" "}
                        {new Date(r.requested_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Block */}
                <div className="shrink-0 flex flex-col gap-2 min-w-[200px] border-t sm:border-l sm:border-t-0 border-border/50 pt-4 sm:pt-0 sm:pl-4">
                  {rejectingId === r.id ? (
                    <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95">
                      <textarea
                        autoFocus
                        placeholder="Reason for rejection (seen by student)"
                        value={rejectNotes}
                        onChange={(e) => setRejectNotes(e.target.value)}
                        className="w-full text-xs p-2 rounded-md border border-border bg-background resize-none h-20 outline-none focus:ring-2 focus:ring-red-500/30"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleReject(r.id)}
                          disabled={isPending}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => setRejectingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="default"
                        className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm gap-2"
                        disabled={isPending}
                        onClick={() =>
                          handleApprove(r.id, r.user_id, r.student_profile_id)
                        }
                      >
                        <Check className="w-4 h-4" /> Approve & Un-Link
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full shadow-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 gap-2 border-red-200 dark:border-red-900/50"
                        disabled={isPending}
                        onClick={() => setRejectingId(r.id)}
                      >
                        <X className="w-4 h-4" /> Reject Request
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
