import type { Direction, Outcome } from "../../config";

export function directionToUint8(d: Direction): 0 | 1 {
  return d === "left" ? 0 : 1;
}

export function outcomeToUint8(o: Outcome): 0 | 1 {
  return o === "goal" ? 0 : 1;
}
