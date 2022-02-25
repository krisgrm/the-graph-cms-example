import { clearStore, test, assert } from 'matchstick-as/assembly/index'
import { createStateChangeEvent, createStateChangeEventWithBody, handleStateChangesEvents } from "./helpers/helpers";
import { buildEntityIdFromEvent } from "../src/mapping";
import { Platform, Space } from "../generated/schema";

test('Create space with two platforms', () => {
  const ownerAddress = '0xffe64338ce6c7443858d5286463bbf4922a0056e';
  const createSpaceEvent = createStateChangeEvent("01", "01", ownerAddress)
  const spaceId: string = buildEntityIdFromEvent(createSpaceEvent)

  const createPlatformEvent = createStateChangeEventWithBody("02", "01", ownerAddress, spaceId)
  const platformId: string = buildEntityIdFromEvent(createPlatformEvent)

  const createAnotherPlatformEvent = createStateChangeEventWithBody("02", "01", ownerAddress, spaceId)
  const anotherPlatformId: string = buildEntityIdFromEvent(createPlatformEvent)

  handleStateChangesEvents([createSpaceEvent, createPlatformEvent, createAnotherPlatformEvent])

  assert.fieldEquals('Space', spaceId, 'owner', ownerAddress)
  assert.fieldEquals('Platform', platformId, 'owner', ownerAddress)
  assert.fieldEquals('Platform', platformId, 'space', spaceId)
  assert.fieldEquals('Platform', anotherPlatformId, 'owner', ownerAddress)
  assert.fieldEquals('Platform', anotherPlatformId, 'space', spaceId)

  clearStore()
})
