export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-white">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-4 border-[rgb(24,62,105)] border-t-transparent rounded-full animate-spin" />
        <h2 className="text-2xl font-semibold text-[rgb(24,62,105)]">
          Loading BuildTrack Pro...
        </h2>
        <p className="text-gray-500">
          Preparing your construction management tools
        </p>
      </div>
    </div>
  );
}