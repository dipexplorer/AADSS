export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-muted/60 rounded mt-2 animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border/50 rounded-xl p-4"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted/60 rounded animate-pulse" />
                </div>
                <div className="h-8 w-20 bg-muted rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
