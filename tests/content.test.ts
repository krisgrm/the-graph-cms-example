import { clearStore, test, assert } from 'matchstick-as/assembly/index'
import {
  createStateChangeEventWithBody,
  createStateChangeEventWithHexBody,
  handleStateChangesEvents
} from "./helpers/helpers";
import { buildEntityIdFromEvent } from "../src/mapping";
import { Content, User } from "../generated/schema";

test('Create content success', () => {
  // 15cd85e01f144ced0c812bcc45c933ef4abdc69ed77e557acc669700b58f6e80 -> ipfs 32 bytes hash (without prefix 1220 since ipfs only supports v0 CID)
  const ownerAddress = '0xffe64338ce6c7443858d5286463bbf4922a0056e';
  const createContentEvent = createStateChangeEventWithHexBody(
    "04", // content
    "01", // create
    ownerAddress,
    '15cd85e01f144ced0c812bcc45c933ef4abdc69ed77e557acc669700b58f6e80'
  )

  handleStateChangesEvents([createContentEvent])

  const contentId : string = buildEntityIdFromEvent(createContentEvent)
  assert.fieldEquals('Content', contentId, 'owner', ownerAddress)
  assert.fieldEquals('Content', contentId, 'metadata', 'QmPom35pEPJRSUnVvsurU7PoENCbRjH3ns2PuHb7PqdwmH')

  assert.fieldEquals('User', ownerAddress, 'id', ownerAddress)
  assert.fieldEquals('User', ownerAddress, 'id', ownerAddress)

  let userContentId = ownerAddress + '-' + contentId;
  assert.fieldEquals('UserContent', userContentId, 'user', ownerAddress)
  assert.fieldEquals('UserContent', userContentId, 'content', contentId)
  assert.fieldEquals('UserContent', userContentId, 'content', contentId)

  clearStore()
})

test('Delete content success', () => {
  const ownerAddress = '0xffe64338ce6c7443858d5286463bbf4922a0056e';
  const user = new User(ownerAddress)
  user.save()

  const contentId = 'a16081f360e3847006db660bae1c6d1b2e17ec2b-2';
  const content = new Content(contentId)
  content.owner = ownerAddress
  content.metadata = 'QmPom35pEPJRSUnVvsurU7PoENCbRjH3ns2PuHb7PqdwmH'
  content.save()

  assert.fieldEquals('Content', contentId, 'owner', ownerAddress)
  assert.fieldEquals('Content', contentId, 'metadata', 'QmPom35pEPJRSUnVvsurU7PoENCbRjH3ns2PuHb7PqdwmH')

  const deleteContentEvent = createStateChangeEventWithBody(
    "04", // content
    "02", // delete
    ownerAddress,
    contentId
  )

  handleStateChangesEvents([deleteContentEvent])
  assert.notInStore('Content', contentId)

  clearStore()
})
