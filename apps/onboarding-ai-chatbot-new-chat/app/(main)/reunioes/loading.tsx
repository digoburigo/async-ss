export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    </div>
  );
}
