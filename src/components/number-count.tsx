interface StepNumberProps {
  children: React.ReactNode;
}

export const StepNumber = ({ children }: StepNumberProps) => {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-sm">
      {children}
    </span>
  );
};
