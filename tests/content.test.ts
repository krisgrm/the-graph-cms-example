import { clearStore, test, assert } from 'matchstick-as/assembly/index'
import {
  createStateChangeEventWithBody,
  createStateChangeEventWithHexBody,
  handleStateChangesEvents
} from "./helpers/helpers";
import { buildEntityIdFromEvent } from "../src/mapping";
import {Content, ContentPlatform, ContentProject, Platform, Project, Space, User} from "../generated/schema";

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

test('Unassign content success', () => {
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

  const contentWithPlatformId = 'a16081f360e3847006db660bae1c6d1b2e17ec2b-2';
  const contentWithPlatform = new Content(contentWithPlatformId)
  contentWithPlatform.metadata = 'QmRyHny5TQXcjWfgT9sYx2eF8GR51FEzfrsC5oGsek9zXS'
  contentWithPlatform.save()

  const contentPlatformIdMapping = contentWithPlatformId + '-' + platformId;
  const contentPlatform = new ContentPlatform(contentPlatformIdMapping)
  contentPlatform.content = contentWithPlatformId
  contentPlatform.platform = platformId
  contentPlatform.save()

  const projectId = 'a16081f360e3847006db660bae1c6d1b2e17ec2d-4';
  const project = new Project(projectId)
  project.owner = ownerAddress
  project.save()

  const contentWithProjectId = 'a16081f360e3847006db660bae1c6d1b2e17ec2e-5';
  const contentWithProject = new Content(contentWithProjectId)
  contentWithProject.metadata = 'QmPom35pEPJRSUnVvsurU7PoENCbRjH3ns2PuHb7PqdwmH'
  contentWithProject.save()

  const contentProjectIdMapping = contentWithProjectId + '-' + projectId;
  const contentProject = new ContentProject(contentProjectIdMapping)
  contentProject.content = contentWithProjectId
  contentProject.project = projectId
  contentProject.save()

  assert.fieldEquals('Content', contentWithPlatformId, 'platform', platformId)
  assert.fieldEquals('Content', contentWithProjectId, 'project', projectId)

  const unassignContentWithPlatformEvent = createStateChangeEventWithBody(
    "04", // content
    "03", // unassign
    ownerAddress,
    contentWithPlatformId
  )

  const unassignContentWithProjectEvent = createStateChangeEventWithBody(
    "04", // content
    "03", // unassign
    ownerAddress,
    contentWithProjectId
  )

  handleStateChangesEvents([unassignContentWithPlatformEvent, unassignContentWithProjectEvent])
  assert.fieldEquals('Content', contentWithPlatformId, 'platform', 'null')
  assert.fieldEquals('Content', contentWithProjectId, 'project', 'null')

  clearStore()
})
