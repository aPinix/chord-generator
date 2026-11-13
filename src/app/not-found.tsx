export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center">
      {/* content */}
      <div className="z-100 flex flex-col items-center gap-4 px-4 text-center">
        {/* 404 number */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-8xl leading-none font-bold tracking-tighter text-primary md:text-9xl">
            404
          </h1>
        </div>

        {/* error message */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-text text-2xl font-medium tracking-[0.1rem] uppercase md:text-3xl">
            Page Not Found
          </h2>
          <p className="text-text-muted max-w-md text-base opacity-70 md:text-lg">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>
      </div>
    </div>
  );
}
