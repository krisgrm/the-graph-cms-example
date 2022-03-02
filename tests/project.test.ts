import { clearStore, test, assert } from 'matchstick-as/assembly/index'
import {createStateChangeEvent, createStateChangeEventWithBody, handleStateChangesEvents} from "./helpers/helpers";
import {buildEntityIdFromEvent, buildMappingTableId} from "../src/mapping";
import {
  Content,
  Project,
  User,
  AdminProject,
  ContentProject
} from "../generated/schema";
import {log} from "@graphprotocol/graph-ts";

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
  log.info("hello world", [])

  const ownerAddress = '0xffe64338ce6c7443858d5286463bbf4922a0056e';
  const user = new User(ownerAddress)
  user.save()

  const contentId = 'a16081f360e3847006db660bae1c6d1b2e17ec2b-2';
  const content = new Content(contentId)
  content.metadata = 'QmPom35pEPJRSUnVvsurU7PoENCbRjH3ns2PuHb7PqdwmH'
  content.save()

  const projectId = 'a16081f360e3847006db660bae1c6d1b2e17ec2d-4';
  const project = new Project(projectId)
  project.owner = ownerAddress
  project.save()

  const assignContentEvent = createStateChangeEventWithBody(
    "03",
    "02",
    ownerAddress,
    contentId + '_' + projectId
  )
  handleStateChangesEvents([assignContentEvent])

  const contentProject = ContentProject.load(buildMappingTableId(contentId, projectId))
  if (contentProject == null) {
    assert.notInStore('ContentProject', buildMappingTableId(contentId, projectId))
  } else {
    log.info("contentProject", [contentProject.id])
    assert.fieldEquals('ContentProject', contentProject.id, 'content', contentId)
  }

  assert.fieldEquals('ContentProject', contentId + "-" + projectId, 'project', projectId)

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
  project.save()

  const assignAdminToProjectEvent = createStateChangeEventWithBody(
    "03",
    "03",
    ownerAddress,
    projectId + "_" + firstAdminToApprove + "_" + secondAdminToApprove
  )

  handleStateChangesEvents([assignAdminToProjectEvent])
  const firstAdminProjectId = buildMappingTableId(firstAdminToApprove, projectId)
  const secondAdminProjectId = buildMappingTableId(secondAdminToApprove, projectId)

  assert.fieldEquals('AdminProject', firstAdminProjectId, 'user', firstAdminToApprove)
  assert.fieldEquals('AdminProject', firstAdminProjectId, 'project', projectId)
  assert.fieldEquals('AdminProject', secondAdminProjectId, 'user', secondAdminToApprove)
  assert.fieldEquals('AdminProject', secondAdminProjectId, 'project', projectId)

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
  project.save()

  const firstAdminProjectId = buildMappingTableId(firstAdminToRevoke, projectId)
  const secondAdminProjectId = buildMappingTableId(secondAdminToRevoke, projectId)
  const thirdAdminProjectId = buildMappingTableId(thirdAdminToRevoke, projectId)

  const firstAdminProject = new AdminProject(firstAdminProjectId)
  firstAdminProject.user = firstAdminToRevoke
  firstAdminProject.project = projectId
  firstAdminProject.save()

  const secondAdminProject = new AdminProject(thirdAdminProjectId)
  secondAdminProject.user = thirdAdminToRevoke
  secondAdminProject.project = projectId
  secondAdminProject.save()

  assert.fieldEquals('AdminProject', firstAdminProjectId, 'user', firstAdminToRevoke)
  assert.fieldEquals('AdminProject', firstAdminProjectId, 'project', projectId)
  assert.fieldEquals('AdminProject', thirdAdminProjectId, 'user', thirdAdminToRevoke)
  assert.fieldEquals('AdminProject', thirdAdminProjectId, 'project', projectId)

  const revokeAdminToProjectEvent = createStateChangeEventWithBody(
    "03",
    "04",
    ownerAddress,
    projectId + "_" + firstAdminToRevoke + "_" + secondAdminToRevoke + "_" + thirdAdminToRevoke
  )

  handleStateChangesEvents([revokeAdminToProjectEvent])

  assert.notInStore('AdminProject', firstAdminProjectId)
  assert.notInStore('AdminProject', secondAdminProjectId)
  assert.notInStore('AdminProject', thirdAdminProjectId)

  clearStore()
})
