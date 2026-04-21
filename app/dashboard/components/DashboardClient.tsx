"use client";

import Link from "next/link";
import { ClassPeriod } from "@/lib/attendance/getDailySchedule";
import { SubjectAnalytics } from "@/lib/engines/analytics/types";

interface Props {
  profile: any;
  todaysClasses: ClassPeriod[];
  streak: number;
  overallPercentage: number;
  riskLevel: string;
  subjects: SubjectAnalytics[];
  unmarkedCount: number;
  currentDate: string;
}

export default function DashboardClient({ profile, todaysClasses, streak, overallPercentage, riskLevel, subjects, unmarkedCount, currentDate }: Props) {
  
  // Tactical Summary Logic
  const criticalSubjects = subjects.filter(s => s.attendancePercentage < 75);
  const safeBufferPercentage = Math.round((overallPercentage - 75) * 10) / 10;
  const isHoliday = todaysClasses.length === 0;
  const studentFirstName = profile?.full_name?.split(' ')[0] || 'Student';

  return (
    <div className="min-h-screen bg-background pt-[80px] pb-24 md:pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Academic Hub</h1>
            <p className="text-muted-foreground mt-1 font-medium">Welcome back, {studentFirstName}!</p>
          </div>
          
          <div className="flex items-center gap-2">
             <Link href="/simulate" className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-sm shadow-sm hover:opacity-90 transition-opacity">
                Engine
             </Link>
             <Link href="/calendar-dashboard" className="px-4 py-2 border border-border bg-card text-foreground font-bold rounded-xl text-sm shadow-sm hover:bg-muted transition-colors">
                Calendar
             </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Content Area (Left 2/3) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Tactical Summary Panel */}
            <div className={`p-6 rounded-[2rem] border-2 shadow-sm relative overflow-hidden transition-all ${
               riskLevel === "Critical" 
               ? "bg-red-50/50 border-red-300 dark:bg-red-950/20 dark:border-red-900/50" 
               : riskLevel === "Warning"
               ? "bg-amber-50/50 border-amber-300 dark:bg-amber-950/20 dark:border-amber-900/50"
               : "bg-green-50/50 border-green-300 dark:bg-green-950/20 dark:border-green-900/50"
            }`}>
               <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Tactical Summary</h3>
               
               <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                 <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-background rounded-2xl border shadow-sm w-32 h-32">
                    <span className="text-4xl font-black tabular-nums">{overallPercentage}%</span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Average</span>
                 </div>
                 
                 <div className="flex-1 space-y-3 pl-2">
                    {riskLevel === "Critical" ? (
                       <div>
                         <p className="text-lg font-bold text-red-700 dark:text-red-400">🚨 Attention Required</p>
                         <p className="text-sm font-medium text-foreground mt-1">
                           Your overall average is dangerously low. You have <strong className="text-red-600">{criticalSubjects.length} subjects</strong> below the 75% threshold. Do not skip classes this week.
                         </p>
                       </div>
                    ) : riskLevel === "Warning" ? (
                       <div>
                         <p className="text-lg font-bold text-amber-700 dark:text-amber-400">⚠️ Approaching Danger</p>
                         <p className="text-sm font-medium text-foreground mt-1">
                           You are hovering near the 75% cutoff boundary (+{safeBufferPercentage}% buffer). You should attend today's classes to build a safer margin.
                         </p>
                       </div>
                    ) : (
                       <div>
                         <p className="text-lg font-bold text-green-700 dark:text-green-500">🛡️ Safe Zone Maintained</p>
                         <p className="text-sm font-medium text-foreground mt-1">
                           Excellent standing. You have a solid +{safeBufferPercentage}% average buffer across your courses. If an emergency arises, you can safely skip a class.
                         </p>
                       </div>
                    )}
                 </div>
               </div>
            </div>

            {/* Today's Mission / Schedule */}
            <div>
               <div className="flex items-center justify-between mb-4 pl-1">
                  <h3 className="text-lg font-black text-foreground">Today's Mission</h3>
                  <Link href="/daily-attendance" className="text-sm font-bold text-primary hover:underline">
                    Mark Attendance &rarr;
                  </Link>
               </div>
               
               {isHoliday ? (
                  <div className="bg-muted/30 border border-muted rounded-2xl p-8 text-center">
                     <span className="text-4xl block mb-2">🌴</span>
                     <p className="font-bold text-foreground">No classes scheduled today.</p>
                     <p className="text-sm text-muted-foreground mt-1">Enjoy your day off or catch up on revision!</p>
                  </div>
               ) : (
                  <div className="grid gap-3">
                     {todaysClasses.map((cl, i) => (
                        <div key={cl.sessionId} className="bg-card border rounded-2xl p-4 flex sm:items-center justify-between gap-4 flex-col sm:flex-row hover:shadow-sm transition-shadow">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-black flex items-center justify-center shrink-0">
                                 P{i + 1}
                              </div>
                              <div>
                                 <h4 className="font-bold text-foreground truncate max-w-[200px]">{cl.subjectName}</h4>
                                 <p className="text-xs font-semibold text-muted-foreground uppercase">{cl.startTime.slice(0,5)} - {cl.endTime.slice(0,5)}</p>
                              </div>
                           </div>
                           
                           {/* Contextual Action from Engine POV */}
                           <div className="shrink-0">
                              {cl.attendanceStatus ? (
                                 <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                   cl.attendanceStatus === 'present' ? 'bg-green-100/50 text-green-700 border border-green-200' 
                                   : 'bg-red-100/50 text-red-700 border border-red-200'
                                 }`}>
                                    {cl.attendanceStatus}
                                 </span>
                              ) : (
                                 <Link href={`/daily-attendance?date=${currentDate}`} className="inline-flex px-4 py-2 bg-foreground text-background text-xs font-bold rounded-xl hover:opacity-80 transition-opacity">
                                    Take Action
                                 </Link>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
          </div>

          {/* Gamification Sidebar (Right 1/3) */}
          <div className="space-y-6">
            
            {/* The Streak Gamification Container */}
            <div className="bg-linear-to-br from-indigo-500 via-purple-500 to-fuchsia-500 rounded-[2rem] p-1 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
               <div className="bg-card rounded-[1.9rem] p-6 h-full border border-transparent">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Consistency Score</h3>
                  
                  <div className="flex flex-col items-center text-center justify-center py-4">
                     <div className="w-24 h-24 bg-linear-to-br from-amber-200 to-orange-400 rounded-full flex items-center justify-center shadow-inner mb-3">
                        <span className="text-5xl font-black text-white drop-shadow-md">{streak}</span>
                     </div>
                     <h4 className="font-bold text-lg text-foreground">Class Streak</h4>
                     <p className="text-sm font-medium text-muted-foreground mt-1 max-w-[200px]">
                        Consecutive classes attended without a break.
                     </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border">
                     {streak === 0 ? (
                        <p className="text-xs font-bold text-red-500 text-center uppercase tracking-wider">Streak broken. Time to rebuild!</p>
                     ) : streak >= 5 ? (
                        <p className="text-xs font-bold text-green-600 text-center uppercase tracking-wider">🔥 On Fire! Top 10% discipline.</p>
                     ) : (
                        <p className="text-xs font-bold text-amber-500 text-center uppercase tracking-wider">Building momentum...</p>
                     )}
                  </div>
               </div>
            </div>

            {/* Quick Stats Panel */}
            <div className="bg-card border rounded-[2rem] p-6 shadow-sm">
               <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Threat Radar</h3>
               <div className="space-y-4">
                 {criticalSubjects.length === 0 ? (
                    <div className="flex items-center gap-3">
                       <span className="text-2xl">🏆</span>
                       <p className="text-sm font-bold text-foreground">Zero subjects below threshold. Keep conquering.</p>
                    </div>
                 ) : (
                    criticalSubjects.map(sub => (
                       <div key={sub.subjectId} className="flex flex-col bg-red-50 dark:bg-red-950/20 rounded-xl p-3 border border-red-100 dark:border-red-900/50">
                          <span className="text-xs font-black text-red-800 dark:text-red-400 uppercase truncate">{sub.subjectName}</span>
                          <div className="flex items-end justify-between mt-1">
                             <span className="text-lg font-black text-red-600 tabular-nums leading-none tracking-tight">{sub.attendancePercentage}%</span>
                             <Link href={`/simulate`} className="text-[10px] uppercase font-bold text-red-600 underline hover:no-underline">Fix it</Link>
                          </div>
                       </div>
                    ))
                 )}
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
