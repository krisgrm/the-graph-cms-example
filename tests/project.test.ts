import { clearStore, test, assert } from 'matchstick-as/assembly/index'
import {createStateChangeEvent, createStateChangeEventWithBody, handleStateChangesEvents} from "./helpers/helpers";
import {buildEntityIdFromEvent, buildMappingTableId} from "../src/mapping";
import {Content, Platform, Project, Space, User, UserPlatform, UserProject} from "../generated/schema";

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

test('Assign content to project success', () => {
  const ownerAddress = '0xffe64338ce6c7443858d5286463bbf4922a0056e';
  const user = new User(ownerAddress)
  user.save()

  const contentId = 'a16081f360e3847006db660bae1c6d1b2e17ec2b-2';
  const content = new Content(contentId)
  content.owner = ownerAddress
  content.metadata = 'QmPom35pEPJRSUnVvsurU7PoENCbRjH3ns2PuHb7PqdwmH'
  content.save()

  const projectId = 'a16081f360e3847006db660bae1c6d1b2e17ec2d-4';
  const project = new Project(projectId)
  project.owner = ownerAddress
  project.admins = []
  project.save()

  const assignContentEvent = createStateChangeEventWithBody(
    "03",
    "02",
    ownerAddress,
    contentId + '_' + projectId
  )
  handleStateChangesEvents([assignContentEvent])

  assert.fieldEquals('Content', contentId, 'project', projectId)

  clearStore()
})


test('Approve project admins success', () => {
  const firstAdminToApprove = '0x6EAAFdBC385116EE740737c0E71b155A28bd0883';
  const secondAdminToApprove = '0x9713a6b9677e01dAeE5C26e1d3C7a4Ea57af4f3a';

  const ownerAddress = '0xffe64338ce6c7443858d5286463bbf4922a0056e';
  const user = new User(ownerAddress)
  user.save()

  const projectId = 'a16081f360e3847006db660bae1c6d1b2e17ec2d-4';
  const project = new Project(projectId)
  project.owner = ownerAddress
  project.admins = []
  project.save()

  const assignAdminToProjectEvent = createStateChangeEventWithBody(
    "03",
    "03",
    ownerAddress,
    projectId + "_" + firstAdminToApprove + "_" + secondAdminToApprove
  )

  handleStateChangesEvents([assignAdminToProjectEvent])
  const firstUserProjectId = buildMappingTableId(firstAdminToApprove, projectId)
  const secondUserProjectId = buildMappingTableId(secondAdminToApprove, projectId)

  assert.fieldEquals('UserProject', firstUserProjectId, 'user', firstAdminToApprove)
  assert.fieldEquals('UserProject', firstUserProjectId, 'project', projectId)
  assert.fieldEquals('UserProject', secondUserProjectId, 'user', secondAdminToApprove)
  assert.fieldEquals('UserProject', secondUserProjectId, 'project', projectId)

  clearStore()
})

test('Revoke project admins success', () => {
  const firstAdminToRevoke = '0x6EAAFdBC385116EE740737c0E71b155A28bd0883';
  const secondAdminToRevoke = '0x9713a6b9677e01dAeE5C26e1d3C7a4Ea57af4f3a';
  const thirdAdminToRevoke = '0x345f0625550AC189cf55D2EC0CE6FB93a63eA943';

  const ownerAddress = '0xffe64338ce6c7443858d5286463bbf4922a0056e';
  const user = new User(ownerAddress)
  user.save()

  const projectId = 'a16081f360e3847006db660bae1c6d1b2e17ec2d-4';
  const project = new Project(projectId)
  project.owner = ownerAddress
  project.admins = []
  project.save()

  const firstUserProjectId = buildMappingTableId(firstAdminToRevoke, projectId)
  const secondUserProjectId = buildMappingTableId(secondAdminToRevoke, projectId)
  const thirdUserProjectId = buildMappingTableId(thirdAdminToRevoke, projectId)

  const firstUserProject = new UserProject(firstUserProjectId)
  firstUserProject.user = firstAdminToRevoke
  firstUserProject.project = projectId
  firstUserProject.save()

  const secondUserProject = new UserProject(thirdUserProjectId)
  secondUserProject.user = thirdAdminToRevoke
  secondUserProject.project = projectId
  secondUserProject.save()

  assert.fieldEquals('UserProject', firstUserProjectId, 'user', firstAdminToRevoke)
  assert.fieldEquals('UserProject', firstUserProjectId, 'project', projectId)
  assert.fieldEquals('UserProject', thirdUserProjectId, 'user', thirdAdminToRevoke)
  assert.fieldEquals('UserProject', thirdUserProjectId, 'project', projectId)

  const revokeAdminToProjectEvent = createStateChangeEventWithBody(
    "03",
    "04",
    ownerAddress,
    projectId + "_" + firstAdminToRevoke + "_" + secondAdminToRevoke + "_" + thirdAdminToRevoke
  )

  handleStateChangesEvents([revokeAdminToProjectEvent])

  assert.notInStore('UserProject', firstUserProjectId)
  assert.notInStore('UserProject', secondUserProjectId)
  assert.notInStore('UserProject', thirdUserProjectId)

  clearStore()
})
