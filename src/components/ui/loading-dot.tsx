/**
 * v0 by Vercel.
 * @see https://v0.dev/t/IvMzHeB6nH7
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
export default function LoadingDot() {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="animate-pulse bg-gray-500 h-4 w-4 rounded-full dark:bg-gray-400" />
      <div className="animate-pulse bg-gray-500 h-4 w-4 rounded-full delay-150 dark:bg-gray-400" />
      <div className="animate-pulse bg-gray-500 h-4 w-4 rounded-full delay-300 dark:bg-gray-400" />
    </div>
  );
}
