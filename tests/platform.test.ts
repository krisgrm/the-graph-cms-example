import { clearStore, test, assert } from 'matchstick-as/assembly/index'
import { createStateChangeEventWithBody, handleStateChangesEvents } from "./helpers/helpers";
import {buildEntityIdFromEvent, buildMappingTableId} from "../src/mapping";
import {Content, Platform, Project, Space, User, UserPlatform} from "../generated/schema";

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

test('Revoke platform admins success', () => {
  const firstAdminToRevoke = '0x6EAAFdBC385116EE740737c0E71b155A28bd0883';
  const secondAdminToRevoke = '0x9713a6b9677e01dAeE5C26e1d3C7a4Ea57af4f3a';
  const thirdAdminToRevoke = '0x345f0625550AC189cf55D2EC0CE6FB93a63eA943';

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

  const firstUserPlatformId = buildMappingTableId(firstAdminToRevoke, platformId)
  const secondUserPlatformId = buildMappingTableId(secondAdminToRevoke, platformId)
  const thirdUserPlatformId = buildMappingTableId(thirdAdminToRevoke, platformId)

  const firstUserPlatform = new UserPlatform(firstUserPlatformId)
  firstUserPlatform.user = firstAdminToRevoke
  firstUserPlatform.platform = platformId
  firstUserPlatform.save()

  const secondUserPlatform = new UserPlatform(thirdUserPlatformId)
  secondUserPlatform.user = thirdAdminToRevoke
  secondUserPlatform.platform = platformId
  secondUserPlatform.save()

  assert.fieldEquals('UserPlatform', firstUserPlatformId, 'user', firstAdminToRevoke)
  assert.fieldEquals('UserPlatform', firstUserPlatformId, 'platform', platformId)
  assert.fieldEquals('UserPlatform', thirdUserPlatformId, 'user', thirdAdminToRevoke)
  assert.fieldEquals('UserPlatform', thirdUserPlatformId, 'platform', platformId)

  const assignAdminToPlatformEvent = createStateChangeEventWithBody(
    "02",
    "04",
    ownerAddress,
    platformId + "_" + firstAdminToRevoke + "_" + secondAdminToRevoke + "_" + thirdAdminToRevoke
  )

  handleStateChangesEvents([assignAdminToPlatformEvent])

  assert.notInStore('UserPlatform', firstUserPlatformId)
  assert.notInStore('UserPlatform', secondUserPlatformId)
  assert.notInStore('UserPlatform', thirdUserPlatformId)

  clearStore()
})

test('Assign project to platform success', () => {
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

  const projectId = 'a16081f360e3847006db660bae1c6d1b2e17ec2d-4';
  const project = new Project(projectId)
  project.owner = ownerAddress
  project.save()

  const assignProjectToPlatformEvent = createStateChangeEventWithBody(
    "02", // platform
    "05", // create
    ownerAddress,
    projectId + '_' + platformId
  )
  handleStateChangesEvents([assignProjectToPlatformEvent])

  assert.fieldEquals('Project', projectId, 'platform', platformId)

  clearStore()
})

test('Unassign project from platform success', () => {
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

  const projectId = 'a16081f360e3847006db660bae1c6d1b2e17ec2d-4';
  const project = new Project(projectId)
  project.owner = ownerAddress
  project.platform = platformId
  project.save()

  const assignProjectToPlatformEvent = createStateChangeEventWithBody(
    "02", // platform
    "06", // create
    ownerAddress,
    projectId
  )
  handleStateChangesEvents([assignProjectToPlatformEvent])

  assert.fieldEquals('Project', projectId, 'platform', "null")

  clearStore()
})
