import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/base-ui/select";

type JobType = {
  id: string;
  name: string;
  color: string;
};

type JobTypeSelectorProps = {
  jobTypes: JobType[];
  selectedJobTypeId: string | null;
  onSelect: (id: string | null) => void;
  disabled?: boolean;
};

export function JobTypeSelector({
  jobTypes,
  selectedJobTypeId,
  onSelect,
  disabled = false,
}: JobTypeSelectorProps) {
  if (jobTypes.length === 0) {
    return null;
  }

  const selectedJobType = jobTypes.find((jt) => jt.id === selectedJobTypeId);

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">Visualizando como:</span>
      <Select
        disabled={disabled}
        onValueChange={(value) => onSelect(value || null)}
        value={selectedJobTypeId || ""}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue>
            {selectedJobType ? (
              <div className="flex items-center gap-2">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: selectedJobType.color }}
                />
                {selectedJobType.name}
              </div>
            ) : (
              <span className="text-muted-foreground">Selecione um cargo</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {jobTypes.map((jobType) => (
            <SelectItem key={jobType.id} value={jobType.id}>
              <div className="flex items-center gap-2">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: jobType.color }}
                />
                {jobType.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
