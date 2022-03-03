import {StateChange} from "../../generated/CMS/CMS";

export function buildEntityIdFromEvent(event: StateChange) : string {
  return event.transaction.hash.toHex().slice(2) + "-" + event.logIndex.toString();
}

export function buildMappingTableId(leftId: string, rightId: string) : string {
  return leftId + "-" + rightId;
}