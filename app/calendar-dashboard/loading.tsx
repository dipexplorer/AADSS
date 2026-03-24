export default function CalendarLoading() {
  return (
    <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="h-7 w-40 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-56 bg-muted/60 rounded mt-2 animate-pulse" />
        </div>

        {/* Calendar skeleton */}
        <div className="bg-card border border-border/50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-muted/40 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border/50 rounded-xl p-4"
            >
              <div className="h-3 w-16 bg-muted/60 rounded animate-pulse mb-2" />
              <div className="h-6 w-10 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
