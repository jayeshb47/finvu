import React from "react";
import LoadingDot from "./loading-dot";

const LoadingScreen = ({ title, description: string }) => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/path/to/your/background-image.png')" }}
    >
      <div className="text-center">
        <LoadingDot />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Verifying information
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          It will only take a few seconds...
        </p>
      </div>
      s
    </div>
  );
};

export default LoadingScreen;
