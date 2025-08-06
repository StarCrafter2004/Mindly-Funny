type ButtonProps = {
  icon?: React.ReactNode;
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const PrimaryButton = ({
  icon,
  children,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`bg-surface-brand group text-text-inversed relative inline-flex items-center justify-center gap-2 overflow-hidden text-[16px] font-medium transition ${className}`}
      {...props}
    >
      <span
        className={`bg-surface-primary ${!props.disabled && "group-active:bg-surface-inversed"} pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-12 group-active:opacity-12 group-disabled:opacity-72`}
      ></span>

      {icon}
      {children}
    </button>
  );
};
