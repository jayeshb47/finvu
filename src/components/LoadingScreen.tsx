import LoadingDot from "./ui/loading-dot";

const LoadingScreen = ({
  title = "Loading...",
  errorMessage,
}: {
  title?: string;
  errorMessage?: string;
}) => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/bg.png')" }}
    >
      <div className="text-center p-5">
        {errorMessage ? (
          <div className="text-red/100 uppercase font-semibold">
            {errorMessage}
          </div>
        ) : (
          <LoadingDot />
        )}
        <h2 className="text-2xl font-bold text-black/100 dark:text-gray-200 mt-8">
          {errorMessage ? "There seems to be a problem" : title}
        </h2>
        <p className="text-sm text-black/50 mt-2.5">
          It will take a few seconds. Please don’t close the browser or refresh
          this window.
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
