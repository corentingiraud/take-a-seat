import { Progress } from "@/components/ui/progress";

interface Props {
  remaining: number;
  initial?: number;
}

export function PrepaidCardBalanceProgressBar({ remaining, initial }: Props) {
  const safeInitial = initial && initial > 0 ? initial : 0;
  const percentage = safeInitial > 0 ? (remaining / safeInitial) * 100 : 0;

  return (
    <div className="flex flex-col gap-1 items-center">
      <div className={`flex items-center justify-between text-sm`}>
        <span>
          {remaining}h{initial ? " / " + initial + "h" : ""}
        </span>
      </div>

      {safeInitial > 0 && (
        <Progress className="h-2 w-full bg-muted" value={percentage} />
      )}
    </div>
  );
}
