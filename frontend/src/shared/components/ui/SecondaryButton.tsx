type ButtonProps = {
  icon?: string;
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const SecondaryButton = ({
  icon,
  children,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`bg-surface-secondary group text-text-primary relative inline-flex items-center justify-center gap-2 text-[16px] font-medium transition ${className}`}
      {...props}
    >
      {icon && <img src={icon} alt="icon" className="h-4 w-4" />}
      {children}
    </button>
  );
};
