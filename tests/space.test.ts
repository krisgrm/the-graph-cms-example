import { clearStore, test, assert } from 'matchstick-as/assembly/index'
import { createStateChangeEvent, handleStateChangesEvents } from "./helpers/helpers";
import { buildEntityIdFromEvent } from "../src/mapping";
import {Space, User} from "../generated/schema";

test('Create space success', () => {
  const ownerAddress = '0xffe64338ce6c7443858d5286463bbf4922a0056e';
  const user = new User(ownerAddress)
  user.save()

  const createSpaceEvent = createStateChangeEvent(
    "01", // space
    "01", // create
    ownerAddress
  )
  const spaceId: string = buildEntityIdFromEvent(createSpaceEvent)
  handleStateChangesEvents([createSpaceEvent])

  assert.fieldEquals('Space', spaceId, 'owner', ownerAddress)

  clearStore()
})

test('Create space and not existing user success', () => {
  const ownerAddress = '0xffe64338ce6c7443858d5286463bbf4922a0056e';
  const createSpaceEvent = createStateChangeEvent(
    "01", // space
    "01", // create
    ownerAddress
  )
  const spaceId: string = buildEntityIdFromEvent(createSpaceEvent)
  handleStateChangesEvents([createSpaceEvent])

  assert.fieldEquals('Space', spaceId, 'owner', ownerAddress)

  clearStore()
})
