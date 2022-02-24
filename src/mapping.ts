import {Address, Bytes, log} from "@graphprotocol/graph-ts"
import { StateChange } from "../generated/CMS/CMS"
import {
  Content, ContentPlatform, ContentProject,
  Platform,
  PlatformSpace,
  Project,
  ProjectPlatform,
  Space,
  User, UserPlatform,
  UserProject
} from "../generated/schema";
import { store } from '@graphprotocol/graph-ts'

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
02 03 platform.unassign-content
02 04 platform.approve-admin
02 05 platform.revoke-admin
02 06 platform.assign-project
02 07 platform.unassign-project

03 01 project.create
03 02 project.assign-content
03 03 project.unassign-content
03 04 project.approve-admin
03 05 project.revoke-admin

 */
export function handleStateChange(event: StateChange): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from.toHex())

  // event.params.data has starting 0x and then header and body.
  // first 4 characters are header, rest is body
  let header = event.params.data.toHex().slice(2, 6)
  let body = event.params.data.toHex().slice(6)
  log.info("header: {}", [header])
  log.info("body: {}", [body])

  // header byte 1 is the noun (space, project, platform, content) byte 2 is the verb (create, assign, unassign, approve, revoke)
  let noun = header.slice(0, 2)
  let verb = header.slice(2, 4)

  log.info("noun: {}, verb: {}", [noun.toString(), verb.toString()])
  log.info("body: {}", [body.toString()])

  // init space
  if (noun.toString() == "01" && verb.toString() == "01") {
    // TODO parse body to retrieve ID
    let spaceId = ""
    initSpace(event.params.author.toString(), spaceId)
  }
  // platform create
  if (noun.toString() == "02" && verb.toString() == "01") {
    // TODO parse body to retrieve ID
    let platformId = ""
    let spaceId = ""
    createPlatform(event.params.author.toString(), platformId, spaceId)
  }
  // platform assign content
  if (noun.toString() == "02" && verb.toString() == "02") {
    // TODO parse body to retrieve ID
    let contentId = ""
    let platformId = ""
    assignContentToPlatform(event.params.author.toString(),  platformId, contentId)
  }
  // platform unassign content
  if (noun.toString() == "02" && verb.toString() == "03") {
    // TODO parse body to retrieve ID
    let contentId = ""
    let platformId = ""
    unassignContentFromPlatform(event.params.author.toString(), platformId, contentId)
  }
  // platform approve admin
  if (noun.toString() == "02" && verb.toString() == "04") {
    // TODO parse body to retrieve platformId and admin address
    let platformId = ""
    let admins = ["", ""]
    platformApproveAdmin(event.params.author.toString(), platformId, admins)
  }
  // platform revoke admin
  if (noun.toString() == "02" && verb.toString() == "05") {
    // TODO parse body to retrieve platformId and admin address
    let platformId = ""
    let admins = ["", ""]
    platformRevokeAdmin(event.params.author.toString(), platformId, admins)
  }
  // platform assign project
  if (noun.toString() == "02" && verb.toString() == "06") {
    // TODO parse body to retrieve projectId and platformId
    let projectId = ""
    let platformId = ""
    assignProjectToPlatform(event.params.author.toString(), platformId, projectId)
  }
  // platform unassign project
  if (noun.toString() == "02" && verb.toString() == "07") {
    // TODO parse body to retrieve projectId and platformId
    let projectId = ""
    let platformId = ""
    unassignProjectFromPlatform(event.params.author.toString(), platformId, projectId)
  }
  // project create
  if (noun.toString() == "03" && verb.toString() == "01") {
    // TODO parse body to retrieve projectId
    let projectId = ""
    createProject(event.params.author.toString(), projectId)
  }
  // project assign content
  if (noun.toString() == "03" && verb.toString() == "02") {
    // TODO parse body to retrieve ID
    let contentId = ""
    let projectId = ""
    assignContentToProject(event.params.author.toString(), contentId, projectId)
  }
  // project unassign content
  if (noun.toString() == "03" && verb.toString() == "03") {
    // TODO parse body to retrieve ID
    let contentId = ""
    let projectId = ""
    unassignContentFromProject(event.params.author.toString(), contentId, projectId)
  }
  // project approve admin
  if (noun.toString() == "03" && verb.toString() == "04") {
    // TODO parse body to retrieve ID and admins
    let projectId = ""
    let admins = ["", ""]
    projectApproveAdmin(event.params.author.toString(), projectId, admins)
  }
  // project revoke admin
  if (noun.toString() == "03" && verb.toString() == "05") {
    // TODO parse body to retrieve ID and admins
    let projectId = ""
    let admins = ["", ""]
    projectRevokeAdmin(event.params.author.toString(), projectId, admins)
  }
}

function initSpace(owner: string, id: string) {
  let space = Space.load(id)
  if (space == null) {
    space = new Space(id)
    space.owner = owner
    space.save()
  }
}

function createPlatform(sender: string, id: string, spaceId: string) {
  let platform = Platform.load(id)
  if (platform != null) return
  let space = Space.load(spaceId)
  if (space == null) return
  /* if owner is not space owner, return */
  if (space.owner != sender) return
  let platformSpace = PlatformSpace.load(spaceId + "-" + id)
  if (platformSpace != null) return

  platform = new Platform(id)
  platform.owner = sender
  platformSpace = new PlatformSpace(spaceId + "-" + id)
  platformSpace.space = spaceId
  platformSpace.platform = id
  platform.save()
}

function createProject(owner : string, id: string): void {
  let project = Project.load(id)
  if (project != null) return
  project = new Project(id)
  project.owner = owner
  project.save()
}

function assignProjectToPlatform(sender: string, platformId : string, projectId: string) {

  let platformProject = ProjectPlatform.load(platformId + "-" + projectId)
  if (platformProject != null) return
  let platform = Platform.load(platformId)
  if (platform == null) return
  let project = Project.load(projectId)
  if (project == null) return

  /* check if sender is owner OR admin of platform */
  if (platform.owner != sender) return
  if (platform.admins.indexOf(sender) == -1) return

  platformProject = new ProjectPlatform(platformId + "-" + projectId)
  platformProject.project = projectId
  platformProject.platform = platformId
  platformProject.save()

}

/*
TODO if we improve schema, we could access platform from project entity..
 */
function unassignProjectFromPlatform(sender: string, platformId: string, projectId: string) {
  let project = Project.load(projectId)
  if (project == null) return
  let platformProject = ProjectPlatform.load(platformId + "-" + projectId)
  if (platformProject == null) return
  let platform = Platform.load(platformProject.platform)
  if (platform == null) return

  /* check if sender is owner OR admin of platform */
  if (platform.owner != sender) return
  if (platform.admins.indexOf(sender) == -1) return
  store.remove('ProjectPlatform', platformId + "-" + projectId)
}

function createContent(owner: string, id: string, metadata: string): void {
  let content = Content.load(id)
  if (content != null) return
  content = new Content(id)
  content.owner = owner
  content.metadata = metadata
  content.save()
}

/*
if platformId is null, then content is assigned to project
if platformId is not null, then content is assigned to platform
 */
function assignContentToProject(sender: string, projectId: string, contentId: string) {
  let projectContent = ContentProject.load(projectId + "-" + contentId)
  if (projectContent != null) return
  let project = Project.load(projectId)
  if (project == null) return
  let content = Content.load(contentId)
  if (content == null) return

  /* check if sender is owner OR admin of project */
  if (project.owner != sender) return
  if (project.admins.indexOf(sender) == -1) return

  projectContent = new ContentProject(projectId + "-" + contentId)
  projectContent.project = projectId
  projectContent.content = contentId
  projectContent.save()
}

function assignContentToPlatform(sender: string, platformId: string, contentId: string) {
  let platformContent = ContentPlatform.load(platformId + "-" + contentId)
  if (platformContent != null) return
  let platform = Platform.load(platformId)
  if (platform == null) return
  let content = Content.load(contentId)
  if (content == null) return

  /* check if sender is owner OR admin of platform */
  if (platform.owner != sender) return
  if (platform.admins.indexOf(sender) == -1) return

  platformContent = new ContentPlatform(platformId + "-" + contentId)
  platformContent.content = contentId
  platformContent.platform = platformId
  platformContent.save()

}

function unassignContentFromPlatform(sender: string, platformId: string, contentId: string) {
  let content = Content.load(contentId)
  if (content == null) return
  let platformContent = ContentPlatform.load(platformId + "-" + contentId)
  if (platformContent == null) return
  let platform = Platform.load(platformContent.platform)
  if (platform == null) return

  /* check if sender is owner OR admin of platform */
  if (platform.owner != sender) return
  if (platform.admins.indexOf(sender) == -1) return
  store.remove('ContentPlatform', platformId + "-" + contentId)
}

function unassignContentFromProject(sender: string, contentId: string, projectId: string) {
  let content = Content.load(contentId)
  if (content == null) return
  let projectContent = ContentProject.load(projectId + "-" + contentId)
  if (projectContent == null) return
  let project = Project.load(projectContent.project)
  if (project == null) return

  /* check if sender is owner OR admin of project */
  if (project.owner != sender) return
  if (project.admins.indexOf(sender) == -1) return
  store.remove('ContentProject', projectId + "-" + contentId)
}

function platformApproveAdmin(sender: string, platformId: string, admins: string[]) {
  let platform = Platform.load(platformId)
  if (platform == null) return
  if (platform.owner != sender) return

  for (let i = 0; i < admins.length; i++) {
    if (platform.admins.indexOf(admins[i]) == -1) {
      let userPlatform = UserPlatform.load(admins[i] + "-" + platformId)
      if (userPlatform == null) {
        userPlatform = new UserPlatform(admins[i] + "-" + platformId)
        userPlatform.user = admins[i]
        userPlatform.platform = platformId
        userPlatform.save()
      }
    }
  }
}

function platformRevokeAdmin(sender: string, platformId: string, admins: string[]) {
  let platform = Platform.load(platformId)
  if (platform == null) return
  if (platform.owner != sender) return

  for (let i = 0; i < admins.length; i++) {
    if (platform.admins.indexOf(admins[i]) != -1) {
      store.remove('UserPlatform', admins[i] + "-" + platformId)
    }
  }
}

function projectApproveAdmin(sender: string, projectId: string, admins: string[]) {
  let project = Project.load(projectId)
  if (project == null) return
  if (project.owner != sender) return

  for (let i = 0; i < admins.length; i++) {
    if (project.admins.indexOf(admins[i]) == -1) {
      let userProject = UserProject.load(admins[i] + "-" + projectId)
      if (userProject == null) {
        userProject = new UserProject(admins[i] + "-" + projectId)
        userProject.user = admins[i]
        userProject.project = projectId
        userProject.save()
      }
    }
  }
}

function projectRevokeAdmin(sender: string, projectId: string, admins: string[]) {
  let project = Project.load(projectId)
  if (project == null) return
  if (project.owner != sender) return

  for (let i = 0; i < admins.length; i++) {
    if (project.admins.indexOf(admins[i]) != -1) {
      store.remove('UserProject', admins[i] + "-" + projectId)
    }
  }
}