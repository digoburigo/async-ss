import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  ref?: React.Ref<HTMLInputElement>;
};

export function PasswordInput({
  className,
  disabled,
  ref,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className={cn("relative rounded-md", className)}>
      <input
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        ref={ref}
        type={showPassword ? "text" : "password"}
        {...props}
      />
      <Button
        className="absolute end-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-md text-muted-foreground"
        disabled={disabled}
        onClick={() => setShowPassword((prev) => !prev)}
        size="icon"
        type="button"
        variant="ghost"
      >
        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
      </Button>
    </div>
  );
}
