export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center">
      {/* content */}
      <div className="z-100 flex flex-col items-center gap-4 px-4 text-center">
        {/* 404 number */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="font-bold text-8xl text-primary leading-none tracking-tighter md:text-9xl">
            404
          </h1>
        </div>

        {/* error message */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="font-medium text-2xl text-text uppercase tracking-[0.1rem] md:text-3xl">
            Page Not Found
          </h2>
          <p className="max-w-md text-base text-text-muted opacity-70 md:text-lg">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>
      </div>
    </div>
  );
}
