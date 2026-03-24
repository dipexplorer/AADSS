export default function StudentLoading() {
  return (
    <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-7 w-40 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-56 bg-muted/60 rounded mt-2 animate-pulse" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border/50 rounded-xl p-4"
            >
              <div className="h-3 w-16 bg-muted/60 rounded animate-pulse mb-2" />
              <div className="h-7 w-12 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* List skeleton */}
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-20 bg-muted/60 rounded animate-pulse" />
                </div>
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
