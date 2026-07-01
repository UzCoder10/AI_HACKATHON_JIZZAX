type Props = {
  name: string;
  filled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  style?: React.CSSProperties;
};

const sizes = { sm: "text-xl", md: "text-2xl", lg: "text-5xl", xl: "text-[48px]" };

export function AqlliIcon({ name, filled, className = "", size = "md", style }: Props) {
  return (
    <span
      className={`aqlli-icon ${filled ? "filled" : ""} ${sizes[size]} ${className}`}
      style={style}
      aria-hidden
    >
      {name}
    </span>
  );
}
