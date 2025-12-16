import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { Check, Moon, Sun } from "lucide-react";
// import { useTheme } from "~/context/theme-provider";
import { useTheme } from "next-themes";

export function ThemeSwitch() {
  // const { theme, setTheme } = useTheme();
  const { theme, setTheme } = useTheme();

  /* Update theme-color meta tag
   * when theme is updated */
  // useEffect(() => {
  //   const themeColor = theme === "dark" ? "#020817" : "#fff";
  //   const metaThemeColor = document.querySelector("meta[name='theme-color']");
  //   if (metaThemeColor) metaThemeColor.setAttribute("content", themeColor);
  // }, [theme]);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button className="scale-95 rounded-full" size="icon" variant="ghost">
          <Sun className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light{" "}
          <Check
            className={cn("ms-auto", theme !== "light" && "hidden")}
            size={14}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
          <Check
            className={cn("ms-auto", theme !== "dark" && "hidden")}
            size={14}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
          <Check
            className={cn("ms-auto", theme !== "system" && "hidden")}
            size={14}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
