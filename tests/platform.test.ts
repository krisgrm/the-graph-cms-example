import { clearStore, test, assert } from 'matchstick-as/assembly/index'
import { createStateChangeEventWithBody, handleStateChangesEvents } from "./helpers/helpers";
import {
  Content,
  Platform,
  Project,
  Space,
  User,
  AdminPlatform,
  PlatformProject,
  ContentPlatform
} from "../generated/schema";

import {buildEntityIdFromEvent, buildMappingTableId} from "../src/lib/utils";

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

test('Create platform for non existing space failed', () => {
  const ownerAddress = '0xffe64338ce6c7443858d5286463bbf4922a0056e';
  const user = new User(ownerAddress)
  user.save()

  const spaceId = 'a16081f360e3847006db660bae1c6d1b2e17ec2a-1';
  const createPlatformEvent = createStateChangeEventWithBody(
    "02", // platform
    "01", // create
    ownerAddress,
    spaceId
  )
  const platformId: string = buildEntityIdFromEvent(createPlatformEvent)
  handleStateChangesEvents([createPlatformEvent])

  assert.notInStore('Platform', platformId)

  clearStore()
})

test('Create platform for non owned space space failed', () => {
  const spaceOwnerAddress = '0xffe64338ce6c7443858d5286463bbf4922a0056e';
  const user = new User(spaceOwnerAddress)
  user.save()

  const spaceId = 'a16081f360e3847006db660bae1c6d1b2e17ec2a-1';
  const space = new Space(spaceId)
  space.owner = spaceOwnerAddress
  space.save()

  const senderAddress = '0x6EAAFdBC385116EE740737c0E71b155A28bd0883';
  const sender = new User(senderAddress)
  sender.save()

  const createPlatformEvent = createStateChangeEventWithBody(
    "02", // platform
    "01", // create
    senderAddress,
    spaceId
  )
  const platformId: string = buildEntityIdFromEvent(createPlatformEvent)
  handleStateChangesEvents([createPlatformEvent])

  assert.notInStore('Platform', platformId)

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

  const contentPlatform = ContentPlatform.load(buildMappingTableId(contentId, platformId))

  if (contentPlatform == null) {
    assert.fieldEquals('ContentPlatform', "", 'content', contentId)
  } else {
    assert.fieldEquals('ContentPlatform', contentPlatform.id, 'content', contentId)
  }
  assert.fieldEquals('ContentPlatform', contentId + "-" + platformId, 'platform', platformId)

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

  assert.fieldEquals('AdminPlatform', firstUserPlatformId, 'user', firstAdminToApprove)
  assert.fieldEquals('AdminPlatform', firstUserPlatformId, 'platform', platformId)
  assert.fieldEquals('AdminPlatform', secondUserPlatformId, 'user', secondAdminToApprove)
  assert.fieldEquals('AdminPlatform', secondUserPlatformId, 'platform', platformId)

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
  platform.save()

  const firstUserPlatformId = buildMappingTableId(firstAdminToRevoke, platformId)
  const secondUserPlatformId = buildMappingTableId(secondAdminToRevoke, platformId)
  const thirdUserPlatformId = buildMappingTableId(thirdAdminToRevoke, platformId)

  const firstAdminPlatform = new AdminPlatform(firstUserPlatformId)
  firstAdminPlatform.user = firstAdminToRevoke
  firstAdminPlatform.platform = platformId
  firstAdminPlatform.save()

  const secondAdminPlatform = new AdminPlatform(secondAdminToRevoke)
  secondAdminPlatform.user = thirdAdminToRevoke
  secondAdminPlatform.platform = platformId
  secondAdminPlatform.save()

  const thirdAdminPlatform = new AdminPlatform(thirdUserPlatformId)
  thirdAdminPlatform.user = thirdAdminToRevoke
  thirdAdminPlatform.platform = platformId
  thirdAdminPlatform.save()

  assert.fieldEquals('AdminPlatform', firstUserPlatformId, 'user', firstAdminToRevoke)
  assert.fieldEquals('AdminPlatform', firstUserPlatformId, 'platform', platformId)
  assert.fieldEquals('AdminPlatform', thirdUserPlatformId, 'user', thirdAdminToRevoke)
  assert.fieldEquals('AdminPlatform', thirdUserPlatformId, 'platform', platformId)

  const revokeAdminToPlatformEvent = createStateChangeEventWithBody(
    "02",
    "04",
    ownerAddress,
    platformId + "_" + firstAdminToRevoke + "_" + secondAdminToRevoke + "_" + thirdAdminToRevoke
  )

  handleStateChangesEvents([revokeAdminToPlatformEvent])

  assert.notInStore('AdminPlatform', firstUserPlatformId)
  assert.notInStore('AdminPlatform', secondUserPlatformId)
  assert.notInStore('AdminPlatform', thirdUserPlatformId)

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
  platform.save()

  const projectId = 'a16081f360e3847006db660bae1c6d1b2e17ec2d-4';
  const project = new Project(projectId)
  project.owner = ownerAddress
  project.save()

  const assignProjectToPlatformEvent = createStateChangeEventWithBody(
    "02", // platform
    "05", // assign project
    ownerAddress,
    platformId + "_" + projectId
  )
  handleStateChangesEvents([assignProjectToPlatformEvent])

  const platformProjectId = buildMappingTableId(platformId, projectId)
  assert.fieldEquals('PlatformProject', platformProjectId, 'platform', platformId)
  assert.fieldEquals('PlatformProject', platformProjectId, 'project', projectId)
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
  platform.save()

  const projectId = 'a16081f360e3847006db660bae1c6d1b2e17ec2d-4';
  const project = new Project(projectId)
  project.owner = ownerAddress
  project.save()

  const platformProject = new PlatformProject(buildMappingTableId(platformId, projectId))
  platformProject.project = projectId
  platformProject.platform = platformId
  platformProject.save()

  const unassignProjectFromPlatform = createStateChangeEventWithBody(
    "02", // platform
    "06", // unassign project
    ownerAddress,
    platformId + '_' + projectId
  )
  handleStateChangesEvents([unassignProjectFromPlatform])

  assert.notInStore('PlatformProject', buildMappingTableId(platformId, projectId))

  clearStore()
})
