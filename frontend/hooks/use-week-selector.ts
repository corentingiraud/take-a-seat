import moment from "@/lib/moment";
import { Moment } from "moment";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";

export function useWeekSelector() {
  const [startParam, setStartParam] = useQueryState(
    "start",
    parseAsString.withDefault(moment().startOf("isoWeek").format("YYYY-MM-DD")),
  );
  const [endParam, setEndParam] = useQueryState(
    "end",
    parseAsString.withDefault(moment().endOf("isoWeek").format("YYYY-MM-DD")),
  );

  const startDate: Moment = useMemo(() => {
    const m = moment(startParam, "YYYY-MM-DD", true);

    return m.isValid() ? m.startOf("day") : moment().startOf("isoWeek");
  }, [startParam]);

  const endDate: Moment = useMemo(() => {
    const m = moment(endParam, "YYYY-MM-DD", true);

    return m.isValid() ? m.endOf("day") : moment().endOf("isoWeek");
  }, [endParam]);

  const setWeekRange = async (start: Moment, end: Moment) => {
    const s = start.clone().startOf("day").format("YYYY-MM-DD");
    const e = end.clone().endOf("day").format("YYYY-MM-DD");

    await Promise.all([setStartParam(s), setEndParam(e)]);
  };

  const goToNextWeek = async () => {
    const nextStart = startDate.clone().add(1, "week").startOf("isoWeek");
    const nextEnd = nextStart.clone().endOf("isoWeek");

    await setWeekRange(nextStart, nextEnd);
  };

  return {
    startDate,
    endDate,
    setWeekRange,
    goToNextWeek,
  }
}
