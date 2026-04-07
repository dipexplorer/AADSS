"use client";

import { useState } from "react";
import { FullStudentProfile } from "@/server/profile/getFullStudentProfile";
import {
  ShieldCheck,
  ShieldOff,
  GraduationCap,
  Calendar,
  User,
  Mail,
  Hash,
  Fingerprint,
  Clock,
  Layers,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { submitDeviceResetRequest } from "@/server/profile/deviceResetRequest";
import { toast } from "react-hot-toast";

interface Props {
  profile: FullStudentProfile;
  resetRequests?: {
    id: string;
    reason: string;
    status: string;
    admin_notes: string | null;
    requested_at: string;
    reviewed_at: string | null;
    activates_at: string | null;
  }[];
}

/* ─── Helpers ─────────────────────────────────────────────── */
function getInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─── InfoItem — used inside cards ───────────────────────── */
function InfoItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="py-2.5 border-b border-border/40 last:border-0">
      <p className="text-[11px] text-muted-foreground font-medium mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value || "—"}</p>
    </div>
  );
}

/* ─── Status Badge ────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; Icon: React.FC<{ className?: string }> }> = {
    pending:   { label: "Pending Review",  cls: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400", Icon: Clock },
    approved:  { label: "Approved",        cls: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",   Icon: CheckCircle },
    rejected:  { label: "Rejected",        cls: "bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400",       Icon: XCircle },
    completed: { label: "Reset Completed", cls: "bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400", Icon: CheckCircle },
  };
  const cfg = map[status] ?? map["pending"];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
      <cfg.Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
export default function ProfileClient({ profile, resetRequests = [] }: Props) {
  const [showResetModal, setShowResetModal] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const hasPendingRequest = resetRequests.some(
    (r) => r.status === "pending" || r.status === "approved"
  );

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await submitDeviceResetRequest(reason);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Reset request submitted. Admin will review shortly.");
        setShowResetModal(false);
        setReason("");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pt-[60px] pb-24 md:pb-10">

      {/* ── Hero Banner ── */}
      <div className="relative h-36 bg-gradient-to-r from-primary/80 via-primary to-primary/60 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-background rounded-t-[2rem]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 -mt-16 space-y-4">

        {/* ── Profile Header Card ── */}
        <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0 ring-4 ring-background shadow-md">
              {getInitials(profile.full_name)}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground tracking-tight truncate">
                {profile.full_name ?? "Student"}
              </h1>
              <p className="text-muted-foreground text-sm truncate">{profile.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {profile.roll_number && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted/70 rounded-md text-xs font-mono font-semibold text-foreground">
                    <Hash className="w-3 h-3 text-primary" />{profile.roll_number}
                  </span>
                )}
                {profile.semester && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted/70 rounded-md text-xs font-semibold text-foreground">
                    <Layers className="w-3 h-3 text-primary" />Semester {profile.semester.semester_number}
                  </span>
                )}
                {profile.program && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-md text-xs font-semibold text-primary">
                    <GraduationCap className="w-3 h-3" />{profile.program.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Info Grid: Academic + Personal ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Academic Details */}
          <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Academic Details</h2>
            </div>

            <InfoItem label="Academic Session" value={profile.session?.name} />

            {/* Session Start + End in one horizontal row */}
            <div className="flex gap-4 py-2.5 border-b border-border/40 last:border-0">
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Session Start</p>
                <p className="text-sm font-semibold text-foreground">{formatDate(profile.session?.start_date ?? null)}</p>
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Session End</p>
                <p className="text-sm font-semibold text-foreground">{formatDate(profile.session?.end_date ?? null)}</p>
              </div>
            </div>

            <InfoItem
              label="Session Status"
              value={profile.session?.status
                ? profile.session.status.charAt(0).toUpperCase() + profile.session.status.slice(1)
                : null}
            />
          </div>

          {/* Personal Info */}
          <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/30 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Personal Info</h2>
            </div>
            <InfoItem label="Full Name" value={profile.full_name} />
            <InfoItem label="Email Address" value={profile.email} />
            <InfoItem label="Roll Number" value={profile.roll_number} />
            <InfoItem label="Account Created" value={formatDate(profile.created_at)} />
          </div>
        </div>

        {/* ── Device Security ── */}
        <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${profile.is_device_registered ? "bg-green-100 dark:bg-green-950/30" : "bg-red-100 dark:bg-red-950/20"}`}>
              {profile.is_device_registered
                ? <ShieldCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                : <ShieldOff className="w-3.5 h-3.5 text-red-500" />}
            </div>
            <h2 className="text-sm font-bold text-foreground">Device Security</h2>
          </div>

          {/* Status block */}
          <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${
            profile.is_device_registered
              ? "bg-green-50 dark:bg-green-950/15 border-green-200 dark:border-green-900"
              : "bg-red-50 dark:bg-red-950/15 border-red-200 dark:border-red-900"
          }`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              profile.is_device_registered
                ? "bg-green-100 dark:bg-green-900/40 text-green-600"
                : "bg-red-100 dark:bg-red-900/40 text-red-500"
            }`}>
              <Fingerprint className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${profile.is_device_registered ? "text-green-800 dark:text-green-300" : "text-red-700 dark:text-red-400"}`}>
                {profile.is_device_registered ? "Primary Device Registered & Locked" : "No Primary Device Registered"}
              </p>
              <p className={`text-xs mt-0.5 leading-relaxed ${profile.is_device_registered ? "text-green-700/70 dark:text-green-400/60" : "text-red-600/70 dark:text-red-400/60"}`}>
                {profile.is_device_registered
                  ? "Attendance from any other device will be automatically blocked."
                  : "Complete onboarding to register and lock your primary device."}
              </p>
              {profile.device_id && (
                <p className="mt-2 text-[11px] font-mono text-muted-foreground">
                  ID: {`${profile.device_id.slice(0, 6)}••••••••${profile.device_id.slice(-5)}`}
                </p>
              )}
            </div>
          </div>

          {/* Reset Request row */}
          {profile.is_device_registered && (
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-foreground">Changed or lost your phone?</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Requires admin approval to reset.</p>
              </div>
              <button
                onClick={() => setShowResetModal(true)}
                disabled={hasPendingRequest}
                className="shrink-0 px-3.5 py-2 text-xs font-semibold rounded-xl border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {hasPendingRequest ? "Pending…" : "Request Reset"}
              </button>
            </div>
          )}

          {/* Request History collapsible */}
          {resetRequests.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowHistory((p) => !p)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showHistory ? "Hide" : "View"} reset history ({resetRequests.length})
              </button>
              {showHistory && (
                <div className="mt-2 space-y-2">
                  {resetRequests.map((req) => (
                    <div key={req.id} className="p-3 rounded-xl bg-muted/40 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-foreground leading-snug flex-1">{req.reason}</p>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Requested: {formatDateTime(req.requested_at)}</p>
                      {req.admin_notes && (
                        <p className="text-[11px] text-muted-foreground italic">Admin: {req.admin_notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ── Reset Request Modal ── */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="p-5 border-b border-border/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Request Device Reset</p>
                <p className="text-xs text-muted-foreground mt-0.5">Requires admin approval</p>
              </div>
            </div>

            {/* Rules */}
            <div className="px-5 pt-4 pb-1">
              <div className="p-3 rounded-xl bg-muted/50 space-y-1.5 text-xs text-muted-foreground">
                <p>• Only 1 reset request allowed every 30 days</p>
                <p>• Admin must review and approve your request</p>
                <p>• You must re-register your new device after reset</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleResetSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. My phone was stolen and I have purchased a new device."
                  rows={4}
                  required
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl resize-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none placeholder:text-muted-foreground/50"
                />
                <p className={`text-[11px] text-right ${reason.length < 20 ? "text-muted-foreground" : "text-green-500"}`}>
                  {reason.length}/20 min
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowResetModal(false); setReason(""); }}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || reason.trim().length < 20}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                    : <><Send className="w-4 h-4" /> Submit</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
