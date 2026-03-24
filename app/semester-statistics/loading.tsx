export default function SemesterStatisticsLoading() {
  return (
    <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="h-7 w-52 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-muted/60 rounded mt-2 animate-pulse" />
        </div>

        {/* Overall stats skeleton */}
        <div className="bg-card border border-border/50 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 w-16 bg-muted rounded-lg animate-pulse mx-auto mb-1" />
                <div className="h-3 w-12 bg-muted/60 rounded animate-pulse mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Subject cards skeleton */}
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-36 bg-muted rounded animate-pulse" />
                <div className="h-6 w-14 bg-muted rounded-full animate-pulse" />
              </div>
              <div className="h-2 w-full bg-muted rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
