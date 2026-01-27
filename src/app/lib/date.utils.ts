export function getMonthFromDateString(inputString: string) {
  return parseInt(inputString.split("-")[1]);
}

export function getDayFromDateString(inputString: string) {
  return parseInt(inputString.split("-")[2]);
}
