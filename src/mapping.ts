import {Bytes, log} from "@graphprotocol/graph-ts"
import { StateChange } from "../generated/CMS/CMS"
import {
  Content,
  Platform,
  Project,
  Space, User,
  UserPlatform,
  UserProject
} from "../generated/schema";
import { store } from '@graphprotocol/graph-ts'
import { encode } from "as-base58";

/*
shapes:
- space.init: nil
- platform.create: space-id
- platform.assign-content: space-id, platform-id, content-hash
- platform.unassign-content: space-id, platform-id, content-hash
- platform.approve-admin: space-id, platform-id, admin-address
- platform.revoke-admin: space-id, platform-id, admin-address
- platform.assign-project: space-id, platform-id, project-id
- platform.unassign-project: space-id, platform-id, project-id
- project.create: space-id
- project.assign-content: space-id, project-id, content-hash
- project.unassign-content: space-id, project-id, content-hash
- project.approve-admin: space-id, project-id, admin-address
- project.revoke-admin: space-id, project-id, admin-address

01 01 space.init

02 01 platform.create
02 02 platform.assign-content
02 03 platform.approve-admin
02 04 platform.revoke-admin
02 05 platform.assign-project

03 01 project.create
03 02 project.assign-content
03 03 project.approve-admin
03 04 project.revoke-admin

04 01 content.create
04 02 content.delete
04 03 content.unassign

 */
export function handleStateChange(event: StateChange): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from.toHex())

  // event.params.data has starting 0x and then header and body.
  // first 4 characters are header, rest is body
  const header = event.params.data.toHex().slice(2, 6)
  const body = event.params.data.toHex().slice(6)
  log.info("header: {}", [header])
  log.info("body: {}", [body])

  // header byte 1 is the noun (space, project, platform, content) byte 2 is the verb (create, assign, unassign, approve, revoke)
  const noun = header.slice(0, 2)
  const verb = header.slice(2, 4)

  log.info("noun: {}, verb: {}", [noun.toString(), verb.toString()])
  log.info("body: {}", [body.toString()])

  // init space
  if (noun.toString() == "01" && verb.toString() == "01") {
    const spaceId = buildEntityIdFromEvent(event)
    initSpace(event.params.author.toString(), spaceId)
  }
  // platform create
  if (noun.toString() == "02" && verb.toString() == "01") {
    const platformId = buildEntityIdFromEvent(event)
    const spaceId = body.toString()
    createPlatform(event.params.author.toString(), platformId, spaceId)
  }
  // platform assign content
  if (noun.toString() == "02" && verb.toString() == "02") {
    const bodyParts = body.toString().split("_");
    const contentId = bodyParts[0]
    const platformId = bodyParts[1]
    assignContentToPlatform(event.params.author.toString(),  platformId, contentId)
  }
  // platform approve admin
  if (noun.toString() == "02" && verb.toString() == "03") {
    const platformId = body.toString().split("_")[0]
    const admins = body.toString().split("_").slice(1)
    platformApproveAdmin(event.params.author.toString(), platformId, admins)
  }
  // platform revoke admin
  if (noun.toString() == "02" && verb.toString() == "04") {
    const platformId = body.toString().split("_")[0]
    const admins = body.toString().split("_").slice(1)
    platformRevokeAdmin(event.params.author.toString(), platformId, admins)
  }
  // platform assign project
  if (noun.toString() == "02" && verb.toString() == "05") {
    const bodyParts = body.toString().split("_");
    const projectId = bodyParts[0]
    const platformId = bodyParts[1]
    assignProjectToPlatform(event.params.author.toString(), platformId, projectId)
  }
  // platform unassign project
  if (noun.toString() == "02" && verb.toString() == "06") {
    const projectId = body.toString()
    unassignProjectFromPlatform(event.params.author.toString(), projectId)
  }
  // project create
  if (noun.toString() == "03" && verb.toString() == "01") {
    const projectId = buildEntityIdFromEvent(event)
    createProject(event.params.author.toString(), projectId)
  }
  // project assign content
  if (noun.toString() == "03" && verb.toString() == "02") {
    const bodyParts = body.toString().split("_");
    const contentId = bodyParts[0]
    const projectId = bodyParts[1]
    assignContentToProject(event.params.author.toString(), contentId, projectId)
  }
  // project approve admin
  if (noun.toString() == "03" && verb.toString() == "03") {
    const projectId = body.toString().split("_")[0]
    const admins = body.toString().split("_").slice(1)
    projectApproveAdmin(event.params.author.toString(), projectId, admins)
  }
  // project revoke admin
  if (noun.toString() == "03" && verb.toString() == "04") {
    const projectId = body.toString().split("_")[0]
    const admins = body.toString().split("_").slice(1)
    projectRevokeAdmin(event.params.author.toString(), projectId, admins)
  }

  // content create
  if (noun.toString() == "04" && verb.toString() == "01") {
    const contentId = buildEntityIdFromEvent(event)
    const bytes = Bytes.fromHexString("0x1220" + body);
    const metadata = encode(bytes)
    createContent(event.params.author.toString(), contentId, metadata)
  }
  // content delete
  if (noun.toString() == "04" && verb.toString() == "02") {
    const contentId = body.toString()
    deleteContent(event.params.author.toString(), contentId)
  }
  // content unassign
  if (noun.toString() == "04" && verb.toString() == "03") {
    const contentId = body.toString()
    unassignContent(event.params.author.toString(), contentId)
  }
}

function buildEntityIdFromEvent(event: StateChange) : string {
  return event.transaction.hash.toHex() + "-" + event.logIndex.toString();
}

function buildMappingTableId(leftId: string, rightId: string) : string {
  return leftId + "-" + rightId;
}

function initSpace(owner: string, id: string) : void {
  let space = Space.load(id)
  if (space != null) return
   space = new Space(id)

  // get or create owner
  let user = User.load(owner)
  if (user == null) {
    user = new User(owner)
    user.save()
  }

  space.owner = owner
  space.save()
}

function createPlatform(sender: string, id: string, spaceId: string) : void {
  let platform = Platform.load(id)
  if (platform != null) return
  let space = Space.load(spaceId)
  if (space == null) return
  /* if owner is not space owner, return */
  if (space.owner != sender) return

  platform = new Platform(id)
  platform.owner = sender
  platform.space = spaceId
  platform.save()
}

function createProject(owner : string, id: string): void {
  let project = Project.load(id)
  if (project != null) return
  project = new Project(id)
  project.owner = owner
  project.save()
}

function assignProjectToPlatform(sender: string, platformId : string, projectId: string) : void {

  let platform = Platform.load(platformId)
  if (platform == null) return
  let project = Project.load(projectId)
  if (project == null) return

  /* check if sender is owner OR admin of platform */
  if (platform.owner != sender) return
  if (platform.admins.indexOf(sender) == -1) return

  project.platform = platformId
  project.save()
}

function createContent(sender: string, contentId: string, metadata: string) : void {
  let content = Content.load(contentId)
  if (content != null) return
  content = new Content(contentId)

  // get or create owner
  let user = User.load(sender)
  if (user == null) {
    user = new User(sender)
    user.save()
  }

  content.owner = sender
  content.metadata = metadata
  content.save()

  // Create userContent
  let userContentId = buildMappingTableId(sender, contentId);
  const userContent = new UserContent(userContentId)
  userContent.content = contentId
  userContent.user = sender
  userContent.save()
}

function deleteContent(sender: string, contentId: string) : void{
  let content = Content.load(contentId)
  if (content == null) return
  /* check if sender is owner */
  if (content.owner != sender) return

  // TODO call unassignContentFromProject and unassignContentFromPlatform

  store.remove('Content', contentId)
}

/*
if platformId is null, then content is assigned to project
if platformId is not null, then content is assigned to platform
 */
function assignContentToProject(sender: string, projectId: string, contentId: string) : void {

  let project = Project.load(projectId)
  if (project == null) return
  let content = Content.load(contentId)
  if (content == null) return

  /* check if sender is owner OR admin of project */
  if (project.owner != sender) return
  if (project.admins.indexOf(sender) == -1) return

  content.project = projectId
  content.save()
}

function assignContentToPlatform(sender: string, platformId: string, contentId: string) : void{

  let platform = Platform.load(platformId)
  if (platform == null) return
  let content = Content.load(contentId)
  if (content == null) return

  /* check if sender is owner OR admin of platform */
  if (platform.owner != sender && platform.admins && platform.admins.indexOf(sender) == -1) return

  content.platform = platformId
  content.save()

}

function unassignContent(sender: string, contentId: string) : void {
  let content = Content.load(contentId)
  if (content == null) return

  content.project = null
  content.platform = null
  content.save()
}

function platformApproveAdmin(sender: string, platformId: string, admins: string[]) : void {
  let platform = Platform.load(platformId)
  if (platform == null) return
  if (platform.owner != sender) return

  for (let i = 0; i < admins.length; i++) {
    if (platform.admins.indexOf(admins[i]) == -1) {
      let userPlatform = UserPlatform.load(buildMappingTableId(admins[i], platformId))
      if (userPlatform == null) {
        userPlatform = new UserPlatform(buildMappingTableId(admins[i], platformId))
        userPlatform.user = admins[i]
        userPlatform.platform = platformId
        userPlatform.save()
      }
    }
  }
}

function platformRevokeAdmin(sender: string, platformId: string, admins: string[]) : void {
  let platform = Platform.load(platformId)
  if (platform == null) return
  if (platform.owner != sender) return

  for (let i = 0; i < admins.length; i++) {
    if (platform.admins.indexOf(admins[i]) != -1) {
      store.remove('UserPlatform', buildMappingTableId(admins[i], platformId))
    }
  }
}

function projectApproveAdmin(sender: string, projectId: string, admins: string[]) : void {
  let project = Project.load(projectId)
  if (project == null) return
  if (project.owner != sender) return

  for (let i = 0; i < admins.length; i++) {
    if (project.admins.indexOf(admins[i]) == -1) {
      let userProject = UserProject.load(buildMappingTableId(admins[i], projectId))
      if (userProject == null) {
        userProject = new UserProject(buildMappingTableId(admins[i], projectId))
        userProject.user = admins[i]
        userProject.project = projectId
        userProject.save()
      }
    }
  }
}

function projectRevokeAdmin(sender: string, projectId: string, admins: string[]) : void{
  let project = Project.load(projectId)
  if (project == null) return
  if (project.owner != sender) return

  for (let i = 0; i < admins.length; i++) {
    if (project.admins.indexOf(admins[i]) != -1) {
      store.remove('UserProject', buildMappingTableId(admins[i], projectId))
    }
  }
}

function unassignProjectFromPlatform(sender: string, projectId: string) : void {
  let project = Project.load(projectId)
  if (project == null) return

  project.platform = null
  project.save()
}

