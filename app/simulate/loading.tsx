export default function SimulateLoading() {
  return (
    <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="h-7 w-44 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-60 bg-muted/60 rounded mt-2 animate-pulse" />
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-2 mb-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-9 w-24 bg-muted rounded-lg animate-pulse"
            />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="bg-card border border-border/50 rounded-xl p-6">
          <div className="space-y-4">
            <div className="h-5 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted/60 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted/60 rounded animate-pulse" />
            <div className="h-32 w-full bg-muted/30 rounded-xl animate-pulse mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
