type MaterialIconProps = {
  name: string;
  filled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeClass = {
  sm: "text-base",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-[120px]",
};

export function MaterialIcon({ name, filled, className = "", size = "md" }: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? "filled" : ""} ${sizeClass[size]} ${className}`}
      aria-hidden
    >
      {name}
    </span>
  );
}
