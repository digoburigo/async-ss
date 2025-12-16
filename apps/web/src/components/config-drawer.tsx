import { cn } from "@acme/ui";
import { useSidebar } from "@acme/ui/base-ui/sidebar";
import { Button } from "@acme/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@acme/ui/sheet";
import { Item, Root as Radio } from "@radix-ui/react-radio-group";
import { CircleCheck, RotateCcw, Settings } from "lucide-react";
import type { SVGProps } from "react";
import { IconDir } from "~/assets/custom/icon-dir";
import { IconLayoutCompact } from "~/assets/custom/icon-layout-compact";
import { IconLayoutDefault } from "~/assets/custom/icon-layout-default";
import { IconLayoutFull } from "~/assets/custom/icon-layout-full";
import { IconSidebarFloating } from "~/assets/custom/icon-sidebar-floating";
import { IconSidebarInset } from "~/assets/custom/icon-sidebar-inset";
import { IconSidebarSidebar } from "~/assets/custom/icon-sidebar-sidebar";
import { IconThemeDark } from "~/assets/custom/icon-theme-dark";
import { IconThemeLight } from "~/assets/custom/icon-theme-light";
import { IconThemeSystem } from "~/assets/custom/icon-theme-system";
import { useDirection } from "~/context/direction-provider";
import type { Collapsible } from "~/context/layout-provider";
import { useLayout } from "~/context/layout-provider";
import { useTheme } from "~/context/theme-provider";

export function ConfigDrawer() {
  const { setOpen } = useSidebar();
  const { resetDir } = useDirection();
  const { resetTheme } = useTheme();
  const { resetLayout } = useLayout();

  const handleReset = () => {
    setOpen(true);
    resetDir();
    resetTheme();
    resetLayout();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          aria-describedby="config-drawer-description"
          aria-label="Open theme settings"
          className="rounded-full"
          size="icon"
          variant="ghost"
        >
          <Settings aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="pb-0 text-start">
          <SheetTitle>Theme Settings</SheetTitle>
          <SheetDescription id="config-drawer-description">
            Adjust the appearance and layout to suit your preferences.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 overflow-y-auto px-4">
          <ThemeConfig />
          <SidebarConfig />
          <LayoutConfig />
          <DirConfig />
        </div>
        <SheetFooter className="gap-2">
          <Button
            aria-label="Reset all settings to default values"
            onClick={handleReset}
            variant="destructive"
          >
            Reset
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function SectionTitle({
  title,
  showReset = false,
  onReset,
  className,
}: {
  title: string;
  showReset?: boolean;
  onReset?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-2 flex items-center gap-2 font-semibold text-muted-foreground text-sm",
        className
      )}
    >
      {title}
      {showReset && onReset && (
        <Button
          className="size-4 rounded-full"
          onClick={onReset}
          size="icon"
          variant="secondary"
        >
          <RotateCcw className="size-3" />
        </Button>
      )}
    </div>
  );
}

function RadioGroupItem({
  item,
  isTheme = false,
}: {
  item: {
    value: string;
    label: string;
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
  };
  isTheme?: boolean;
}) {
  return (
    <Item
      aria-describedby={`${item.value}-description`}
      aria-label={`Select ${item.label.toLowerCase()}`}
      className={cn("group outline-none", "transition duration-200 ease-in")}
      value={item.value}
    >
      <div
        aria-hidden="false"
        aria-label={`${item.label} option preview`}
        className={cn(
          "relative rounded-[6px] ring-[1px] ring-border",
          "group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary",
          "group-focus-visible:ring-2"
        )}
        role="img"
      >
        <CircleCheck
          aria-hidden="true"
          className={cn(
            "size-6 fill-primary stroke-white",
            "group-data-[state=unchecked]:hidden",
            "absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
          )}
        />
        <item.icon
          aria-hidden="true"
          className={cn(
            !isTheme &&
              "fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground"
          )}
        />
      </div>
      <div
        aria-live="polite"
        className="mt-1 text-xs"
        id={`${item.value}-description`}
      >
        {item.label}
      </div>
    </Item>
  );
}

function ThemeConfig() {
  const { defaultTheme, theme, setTheme } = useTheme();
  return (
    <div>
      <SectionTitle
        onReset={() => setTheme(defaultTheme)}
        showReset={theme !== defaultTheme}
        title="Theme"
      />
      <Radio
        aria-describedby="theme-description"
        aria-label="Select theme preference"
        className="grid w-full max-w-md grid-cols-3 gap-4"
        onValueChange={setTheme}
        value={theme}
      >
        {[
          {
            value: "system",
            label: "System",
            icon: IconThemeSystem,
          },
          {
            value: "light",
            label: "Light",
            icon: IconThemeLight,
          },
          {
            value: "dark",
            label: "Dark",
            icon: IconThemeDark,
          },
        ].map((item) => (
          <RadioGroupItem isTheme item={item} key={item.value} />
        ))}
      </Radio>
      <div className="sr-only" id="theme-description">
        Choose between system preference, light mode, or dark mode
      </div>
    </div>
  );
}

function SidebarConfig() {
  const { defaultVariant, variant, setVariant } = useLayout();
  return (
    <div className="max-md:hidden">
      <SectionTitle
        onReset={() => setVariant(defaultVariant)}
        showReset={defaultVariant !== variant}
        title="Sidebar"
      />
      <Radio
        aria-describedby="sidebar-description"
        aria-label="Select sidebar style"
        className="grid w-full max-w-md grid-cols-3 gap-4"
        onValueChange={setVariant}
        value={variant}
      >
        {[
          {
            value: "inset",
            label: "Inset",
            icon: IconSidebarInset,
          },
          {
            value: "floating",
            label: "Floating",
            icon: IconSidebarFloating,
          },
          {
            value: "sidebar",
            label: "Sidebar",
            icon: IconSidebarSidebar,
          },
        ].map((item) => (
          <RadioGroupItem item={item} key={item.value} />
        ))}
      </Radio>
      <div className="sr-only" id="sidebar-description">
        Choose between inset, floating, or standard sidebar layout
      </div>
    </div>
  );
}

function LayoutConfig() {
  const { open, setOpen } = useSidebar();
  const { defaultCollapsible, collapsible, setCollapsible } = useLayout();

  const radioState = open ? "default" : collapsible;

  return (
    <div className="max-md:hidden">
      <SectionTitle
        onReset={() => {
          setOpen(true);
          setCollapsible(defaultCollapsible);
        }}
        showReset={radioState !== "default"}
        title="Layout"
      />
      <Radio
        aria-describedby="layout-description"
        aria-label="Select layout style"
        className="grid w-full max-w-md grid-cols-3 gap-4"
        onValueChange={(v) => {
          if (v === "default") {
            setOpen(true);
            return;
          }
          setOpen(false);
          setCollapsible(v as Collapsible);
        }}
        value={radioState}
      >
        {[
          {
            value: "default",
            label: "Default",
            icon: IconLayoutDefault,
          },
          {
            value: "icon",
            label: "Compact",
            icon: IconLayoutCompact,
          },
          {
            value: "offExamples",
            label: "Full layout",
            icon: IconLayoutFull,
          },
        ].map((item) => (
          <RadioGroupItem item={item} key={item.value} />
        ))}
      </Radio>
      <div className="sr-only" id="layout-description">
        Choose between default expanded, compact icon-only, or full layout mode
      </div>
    </div>
  );
}

function DirConfig() {
  const { defaultDir, dir, setDir } = useDirection();
  return (
    <div>
      <SectionTitle
        onReset={() => setDir(defaultDir)}
        showReset={defaultDir !== dir}
        title="Direction"
      />
      <Radio
        aria-describedby="direction-description"
        aria-label="Select site direction"
        className="grid w-full max-w-md grid-cols-3 gap-4"
        onValueChange={setDir}
        value={dir}
      >
        {[
          {
            value: "ltr",
            label: "Left to Right",
            icon: (props: SVGProps<SVGSVGElement>) => (
              <IconDir dir="ltr" {...props} />
            ),
          },
          {
            value: "rtl",
            label: "Right to Left",
            icon: (props: SVGProps<SVGSVGElement>) => (
              <IconDir dir="rtl" {...props} />
            ),
          },
        ].map((item) => (
          <RadioGroupItem item={item} key={item.value} />
        ))}
      </Radio>
      <div className="sr-only" id="direction-description">
        Choose between left-to-right or right-to-left site direction
      </div>
    </div>
  );
}
