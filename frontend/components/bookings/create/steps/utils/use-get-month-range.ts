import { useAuth } from "@/contexts/auth-context";
import moment from "@/lib/moment";

export function useGetMonthRange() {
  const { isSuperAdmin } = useAuth();
  
  let startMonth = moment();
  let endMonth = startMonth.clone().add(1, "month");

  if (isSuperAdmin) {
    startMonth = moment().subtract("1", "year");
    endMonth = moment().add("1", "year");
  }

  return { startMonth, endMonth };
}
