export const LoadingSpinner = () => {
  return (
    <div className="flex h-full w-full items-center justify-center p-2">
      <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-main-accent" />
    </div>
  );
};
