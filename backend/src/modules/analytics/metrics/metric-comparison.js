export function compareMetricValues(current, previous) {
  if (
    typeof current !== "number" ||
    typeof previous !== "number" ||
    !Number.isFinite(current) ||
    !Number.isFinite(previous)
  ) {
    return {
      current: null,
      previous: null,
      absoluteChange: null,
      percentageChange: null,
      direction: "indeterminate",
    };
  }

  const absoluteChange = current - previous;

  let direction = "unchanged";

  if (absoluteChange > 0) {
    direction = "increase";
  } else if (absoluteChange < 0) {
    direction = "decrease";
  }

  let percentageChange = null;

  if (previous !== 0) {
    percentageChange = Number(
      ((absoluteChange / Math.abs(previous)) * 100).toFixed(2),
    );
  }

  return {
    current,
    previous,
    absoluteChange,
    percentageChange,
    direction,
  };
}
