import { clearStore, test, assert } from 'matchstick-as/assembly/index'
import { createStateChangeEvent, handleStateChangesEvents } from "./helpers/helpers";
import { buildEntityIdFromEvent } from "../src/mapping";
import { Project, User } from "../generated/schema";

test('Create project success', () => {
  const ownerAddress = '0xffe64338ce6c7443858d5286463bbf4922a0056e';
  const user = new User(ownerAddress)
  user.save()

  const createProjectEvent = createStateChangeEvent(
    "03", // project
    "01", // create
    ownerAddress
  )
  const projectId: string = buildEntityIdFromEvent(createProjectEvent)
  handleStateChangesEvents([createProjectEvent])

  assert.fieldEquals('Project', projectId, 'owner', ownerAddress)

  clearStore()
})
