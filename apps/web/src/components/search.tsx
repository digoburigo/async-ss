import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { SearchIcon } from "lucide-react";

import { useSearch } from "~/context/search-provider";

type SearchProps = {
  className?: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
};

export function Search({
  className = "",
  placeholder = "Search",
}: SearchProps) {
  const { setOpen } = useSearch();
  return (
    <Button
      className={cn(
        "group relative h-8 w-full flex-1 justify-start rounded-md bg-muted/25 font-normal text-muted-foreground text-sm shadow-none hover:bg-accent sm:w-40 sm:pe-12 md:flex-none lg:w-52 xl:w-64",
        className
      )}
      onClick={() => setOpen(true)}
      variant="outline"
    >
      <SearchIcon
        aria-hidden="true"
        className="absolute start-1.5 top-1/2 -translate-y-1/2"
        size={16}
      />
      <span className="ms-4">{placeholder}</span>
      <kbd className="pointer-events-none absolute end-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] opacity-100 group-hover:bg-accent sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}
