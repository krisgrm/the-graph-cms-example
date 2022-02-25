import { clearStore, test, assert } from 'matchstick-as/assembly/index'
import {
  createStateChangeEvent,
  createStateChangeEventWithBody,
  createStateChangeEventWithHexBody,
  handleStateChangesEvents
} from "./helpers/helpers";
import {buildEntityIdFromEvent, buildMappingTableId} from "../src/mapping";
import {Bytes, log} from "@graphprotocol/graph-ts/index";
import {Content, Platform, Space, User} from "../generated/schema";

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

test('Create space success', () => {
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

test('Create platform success', () => {
  const ownerAddress = '0xffe64338ce6c7443858d5286463bbf4922a0056e';
  const user = new User(ownerAddress)
  user.save()

  const spaceId = 'a16081f360e3847006db660bae1c6d1b2e17ec2a-1';
  const space = new Space(spaceId)
  space.owner = ownerAddress
  space.save()

  const createPlatformEvent = createStateChangeEventWithBody(
    "02", // platform
    "01", // create
    ownerAddress,
    spaceId
  )
  const platformId: string = buildEntityIdFromEvent(createPlatformEvent)
  handleStateChangesEvents([createPlatformEvent])

  assert.fieldEquals('Platform', platformId, 'owner', ownerAddress)
  assert.fieldEquals('Platform', platformId, 'space', spaceId)

  clearStore()
})

test('Assign content to platform success', () => {
  const ownerAddress = '0xffe64338ce6c7443858d5286463bbf4922a0056e';
  const user = new User(ownerAddress)
  user.save()

  const spaceId = 'a16081f360e3847006db660bae1c6d1b2e17ec2a-1';
  const space = new Space(spaceId)
  space.owner = ownerAddress
  space.save()

  const contentId = 'a16081f360e3847006db660bae1c6d1b2e17ec2b-2';
  const content = new Content(contentId)
  content.owner = ownerAddress
  content.metadata = 'QmPom35pEPJRSUnVvsurU7PoENCbRjH3ns2PuHb7PqdwmH'
  content.save()

  const platformId = 'a16081f360e3847006db660bae1c6d1b2e17ec2c-3';
  const platform = new Platform(platformId)
  platform.owner = ownerAddress
  platform.space = spaceId
  platform.save()

  const createPlatformEvent = createStateChangeEventWithBody(
    "02", // platform
    "02", // create
    ownerAddress,
    contentId + '_' + platformId
  )
  handleStateChangesEvents([createPlatformEvent])

  assert.fieldEquals('Content', contentId, 'platform', platformId)
  clearStore()
})

test('Approve platform admins success', () => {
  const firstAdminToApprove = '0x6EAAFdBC385116EE740737c0E71b155A28bd0883';
  const secondAdminToApprove = '0x9713a6b9677e01dAeE5C26e1d3C7a4Ea57af4f3a';

  const ownerAddress = '0xffe64338ce6c7443858d5286463bbf4922a0056e';
  const user = new User(ownerAddress)
  user.save()

  const spaceId = 'a16081f360e3847006db660bae1c6d1b2e17ec2a-1';
  const space = new Space(spaceId)
  space.owner = ownerAddress
  space.save()

  const platformId = 'a16081f360e3847006db660bae1c6d1b2e17ec2c-3';
  const platform = new Platform(platformId)
  platform.owner = ownerAddress
  platform.space = spaceId
  platform.admins = []
  platform.save()

  const assignAdminToPlatformEvent = createStateChangeEventWithBody(
    "02",
    "03",
    ownerAddress,
    platformId + "_" + firstAdminToApprove + "_" + secondAdminToApprove
  )

  handleStateChangesEvents([assignAdminToPlatformEvent])
  const firstUserPlatformId = buildMappingTableId(firstAdminToApprove, platformId)
  const secondUserPlatformId = buildMappingTableId(secondAdminToApprove, platformId)

  assert.fieldEquals('UserPlatform', firstUserPlatformId, 'user', firstAdminToApprove)
  assert.fieldEquals('UserPlatform', firstUserPlatformId, 'platform', platformId)
  assert.fieldEquals('UserPlatform', secondUserPlatformId, 'user', secondAdminToApprove)
  assert.fieldEquals('UserPlatform', secondUserPlatformId, 'platform', platformId)

  clearStore()
})

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
