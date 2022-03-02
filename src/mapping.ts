import {Bytes, log, store} from "@graphprotocol/graph-ts"
import { StateChange } from "../generated/CMS/CMS"
import {
  Content,
  Platform,
  Project,
  Space,
  User,
  ContentPlatform,
  ContentProject,
  AdminProject,
  AdminPlatform,
  PlatformProject
} from "../generated/schema";
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
  // header byte 1 is the noun (space, project, platform, content) byte 2 is the verb (create, assign, unassign, approve, revoke)
  const noun = header.slice(0, 2)
  const verb = header.slice(2, 4)
  const eventAuthor = event.params.author.toHexString();
  log.info("noun: {}, verb: {} author: {}", [noun.toString(), verb.toString(), eventAuthor])

  // init space
  if (noun.toString() == "01" && verb.toString() == "01") {
    const spaceId = buildEntityIdFromEvent(event)
    initSpace(eventAuthor, spaceId)
  }
  // platform create
  if (noun.toString() == "02" && verb.toString() == "01") {
    const spaceId = event.params.data.toString().slice(2)
    const platformId = buildEntityIdFromEvent(event)
    createPlatform(eventAuthor, platformId, spaceId)
  }
  // platform assign content
  if (noun.toString() == "02" && verb.toString() == "02") {
    const body = event.params.data.toString().slice(2)
    const bodyParts = body.split("_");
    const contentId = bodyParts[0]
    const platformId = bodyParts[1]
    assignContentToPlatform(eventAuthor, platformId, contentId)
  }
  // platform unassign content
  if (noun.toString() == "02" && verb.toString() == "03") {
    const bodyParts = event.params.data.toString().slice(2).split("_")
    const platformId = bodyParts[0]
    const content = bodyParts[1]
    unassignContentFromPlatform(eventAuthor, platformId, content)
  }
  // platform approve admin
  if (noun.toString() == "02" && verb.toString() == "03") {
    const bodyParts = event.params.data.toString().slice(2).split("_")
    const platformId = bodyParts[0]
    const admins = bodyParts.slice(1)
    platformApproveAdmin(eventAuthor, platformId, admins)
  }
  // platform revoke admin
  if (noun.toString() == "02" && verb.toString() == "04") {
    const bodyParts = event.params.data.toString().slice(2).split("_")
    const platformId = bodyParts[0]
    const admins = bodyParts.slice(1)
    platformRevokeAdmin(eventAuthor, platformId, admins)
  }
  // platform assign project
  if (noun.toString() == "02" && verb.toString() == "05") {
    const bodyParts = event.params.data.toString().slice(2).split("_");
    const projectId = bodyParts[0]
    const platformId = bodyParts[1]
    assignProjectToPlatform(eventAuthor, platformId, projectId)
  }
  // platform unassign project
  if (noun.toString() == "02" && verb.toString() == "06") {
    const bodyParts = event.params.data.toString().slice(2).split("_");
    const platformId = bodyParts[0]
    const projectId = bodyParts[1]
    unassignProjectFromPlatform(eventAuthor, projectId, platformId)
  }
  // project create
  if (noun.toString() == "03" && verb.toString() == "01") {
    const projectId = buildEntityIdFromEvent(event)
    createProject(eventAuthor, projectId)
  }
  // project assign content
  if (noun.toString() == "03" && verb.toString() == "02") {
    const body = event.params.data.toString().slice(2)
    const bodyParts = body.toString().split("_");
    const contentId = bodyParts[0]
    const projectId = bodyParts[1]
    assignContentToProject(eventAuthor, projectId, contentId)
  }
  // project unassign content
  if (noun.toString() == "03" && verb.toString() == "03") {
    const bodyParts = event.params.data.toString().slice(2).split("_")
    const projectId = bodyParts[0]
    const content = bodyParts[1]
    unassignContentFromProject(eventAuthor, projectId, content)
  }
  // project approve admin
  if (noun.toString() == "03" && verb.toString() == "03") {
    const bodyParts = event.params.data.toString().slice(2).split("_")
    const projectId = bodyParts[0]
    const admins = bodyParts.slice(1)
    projectApproveAdmin(eventAuthor, projectId, admins)
  }
  // project revoke admin
  if (noun.toString() == "03" && verb.toString() == "04") {
    const bodyParts = event.params.data.toString().slice(2).split("_")
    const projectId = bodyParts[0]
    const admins = bodyParts.slice(1)
    projectRevokeAdmin(eventAuthor, projectId, admins)
  }

  // content create
  if (noun.toString() == "04" && verb.toString() == "01") {
    const body = event.params.data.toHex().slice(6)
    const contentId = buildEntityIdFromEvent(event)
    const bytes = Bytes.fromHexString("0x1220" + body);
    const metadata = encode(bytes)
    createContent(eventAuthor, contentId, metadata)
  }
}

export function buildEntityIdFromEvent(event: StateChange) : string {
  return event.transaction.hash.toHex().slice(2) + "-" + event.logIndex.toString();
}

export function buildMappingTableId(leftId: string, rightId: string) : string {
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
  if (platform.owner != sender && !AdminPlatform.load(buildMappingTableId(sender, platformId))) return

  /* create platformProject mapping */
  let platformProject = new PlatformProject(buildMappingTableId(projectId, platformId))
  platformProject.project = projectId
  platformProject.platform = platformId
  platformProject.save()
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

  content.metadata = metadata
  content.save()

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
  if (project.owner != sender && !AdminProject.load(buildMappingTableId(sender, projectId))) return

  /* create mapping table for content - project mapping */
  let contentProject = new ContentProject(buildMappingTableId(contentId, projectId))
  contentProject.content = contentId
  contentProject.project = projectId
  contentProject.save()
}

function assignContentToPlatform(sender: string, platformId: string, contentId: string) : void{

  let platform = Platform.load(platformId)
  if (platform == null) return
  let content = Content.load(contentId)
  if (content == null) return

  /* check if sender is owner OR admin of platform */
  if (platform.owner != sender && !AdminPlatform.load(buildMappingTableId(sender, platformId))) return

  /* create mapping table for content - platform mapping */
  let contentPlatform = new ContentPlatform(buildMappingTableId(contentId, platformId))
  contentPlatform.content = contentId
  contentPlatform.platform = platformId
  contentPlatform.save()

}

function unassignContentFromPlatform(sender: string, projectId: string, contentId: string) : void {
  /* find mapping table for content - project mapping */
  let contentPlatform = ContentPlatform.load(buildMappingTableId(contentId, projectId))
  if (contentPlatform == null) return

  let platform = Platform.load(projectId)
  if (platform == null) return
  let content = Content.load(contentId)
  if (content == null) return

  /* check if sender is owner OR admin of platform */
  if (platform.owner != sender && !AdminPlatform.load(buildMappingTableId(sender, projectId))) return

  store.remove("ContentPlatform", contentPlatform.id)
}

function unassignContentFromProject(sender: string, projectId: string, contentId: string) : void {
  /* find mapping table for content - project mapping */
  let contentProject = ContentProject.load(buildMappingTableId(contentId, projectId))
  if (contentProject == null) return

  let project = Project.load(projectId)
  if (project == null) return
  let content = Content.load(contentId)
  if (content == null) return

  /* check if sender is owner OR admin of project */
  if (project.owner != sender && !AdminProject.load(buildMappingTableId(sender, projectId))) return;

  store.remove("ContentProject", contentProject.id)
}

function platformApproveAdmin(sender: string, platformId: string, admins: string[]) : void {
  const platform = Platform.load(platformId)
  if (platform == null) return
  if (platform.owner != sender) return

  for (let i = 0; i < admins.length; i++) {
    const adminAddress = admins[i];
    const mappingTableId = buildMappingTableId(adminAddress, platformId);
    let userPlatform = AdminPlatform.load(mappingTableId)
    if (userPlatform === null) {
      if (User.load(adminAddress) === null) {
        const user = new User(adminAddress)
        user.save()
      }
      userPlatform = new AdminPlatform(mappingTableId)
      userPlatform.user = adminAddress
      userPlatform.platform = platformId
      userPlatform.save()
    }
  }
}

function platformRevokeAdmin(sender: string, platformId: string, admins: string[]) : void {
  let platform = Platform.load(platformId)
  if (platform === null) return
  if (platform.owner != sender) return

  for (let i = 0; i < admins.length; i++) {
    const mappingTableId = buildMappingTableId(admins[i], platformId);
    const adminPlatform = AdminPlatform.load(mappingTableId)
    if (adminPlatform) {
      store.remove("AdminPlatform", adminPlatform.id)
    }
  }
}

function projectApproveAdmin(sender: string, projectId: string, admins: string[]) : void {
  const project = Project.load(projectId)
  if (project === null) return
  if (project.owner != sender) return

  for (let i = 0; i < admins.length; i++) {
    const adminAddress = admins[i];
    const mappingTableId = buildMappingTableId(adminAddress, projectId);
    let userProject = AdminProject.load(mappingTableId)
    if (userProject === null) {
      if (User.load(adminAddress) === null) {
        const user = new User(adminAddress)
        user.save()
      }
      userProject = new AdminProject(mappingTableId)
      userProject.user = adminAddress
      userProject.project = projectId
      userProject.save()
    }
  }
}

function projectRevokeAdmin(sender: string, projectId: string, admins: string[]) : void{
  const project = Project.load(projectId)
  if (project == null) return
  if (project.owner != sender) return

  for (let i = 0; i < admins.length; i++) {
    const mappingTableId = buildMappingTableId(admins[i], projectId);
    const userProject = AdminProject.load(mappingTableId)
    if (userProject) {
      store.remove('AdminProject', mappingTableId)
    }
  }
}

function unassignProjectFromPlatform(sender: string, projectId: string, platformId: string) : void {
  let platformProject = PlatformProject.load(buildMappingTableId(platformId, projectId))
  if (platformProject == null) return

  let platform = Platform.load(platformId)
  if (platform == null) return
  let project = Project.load(projectId)
  if (project == null) return

  /* check if sender is owner OR admin of platform */
  if (platform.owner != sender && !AdminPlatform.load(buildMappingTableId(sender, platformId))) return

  store.remove("PlatformProject", platformProject.id)
}

