import { StateChange } from "../../generated/CMS/CMS";
import { handleStateChange } from "../../src/mapping";
import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as/assembly/defaults";

export function handleStateChangesEvents(events: StateChange[]): void {
  events.forEach((event) => {
    handleStateChange(event)
  })
}

export function createStateChangeEvent(
  noun: string, verb: string, ownerAddress: string
): StateChange {
  const stateChangeEvent = createMockStateChangeEvent(ownerAddress);

  const bytes = Bytes.fromByteArray(Bytes.fromHexString("0x" + noun + verb))
  let dataParam = new ethereum.EventParam('data', ethereum.Value.fromBytes(bytes))
  stateChangeEvent.parameters.push(dataParam)

  return stateChangeEvent
}

export function createStateChangeEventWithBody(
  noun: string, verb: string, ownerAddress: string, body: string
): StateChange {
  const stateChangeEvent = createMockStateChangeEvent(ownerAddress);

  const header = Bytes.fromHexString("0x" + noun + verb);
  const bytes = new Bytes(header.length + body.length)
  bytes.set(header)
  bytes.set(Bytes.fromUTF8(body), header.length)
  const dataParam = new ethereum.EventParam('data', ethereum.Value.fromBytes(bytes))
  stateChangeEvent.parameters.push(dataParam)

  return stateChangeEvent
}

export function createStateChangeEventWithHexBody(
  noun: string, verb: string, ownerAddress: string, body: string
): StateChange {
  const stateChangeEvent = createMockStateChangeEvent(ownerAddress);

  const bytes = Bytes.fromByteArray(Bytes.fromHexString("0x" + noun + verb + body))
  const dataParam = new ethereum.EventParam('data', ethereum.Value.fromBytes(bytes))
  stateChangeEvent.parameters.push(dataParam)

  return stateChangeEvent
}

function createMockStateChangeEvent(ownerAddress: string): StateChange {
  const mockEvent = newMockEvent()
  const stateChangeEvent = new StateChange(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  stateChangeEvent.parameters = []
  const addressParam = new ethereum.EventParam(
    'author',
    ethereum.Value.fromAddress(Address.fromString(ownerAddress))
  )
  stateChangeEvent.parameters.push(addressParam)
  return stateChangeEvent;
}
