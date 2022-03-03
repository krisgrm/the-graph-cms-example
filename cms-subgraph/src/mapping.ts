import {Bytes, log} from "@graphprotocol/graph-ts"
import { StateChange } from "../generated/CMS/CMS"
import { encode } from "as-base58";
import {
  assignProjectToPlatform,
  createProject,
  projectApproveAdmin,
  projectRevokeAdmin,
  unassignProjectFromPlatform
} from "./lib/project";
import {
  assignContentToPlatform,
  assignContentToProject,
  createContent,
  unassignContentFromPlatform,
  unassignContentFromProject
} from "./lib/content";
import {createPlatform, platformApproveAdmin, platformRevokeAdmin} from "./lib/platform";
import {initSpace} from "./lib/space";
import {buildEntityIdFromEvent} from "./lib/utils";

export function handleStateChange(event: StateChange): void {

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
    const platformId = bodyParts[0]
    const projectId = bodyParts[1]
    assignProjectToPlatform(eventAuthor, platformId, projectId)
  }
  // platform unassign project
  if (noun.toString() == "02" && verb.toString() == "06") {
    const bodyParts = event.params.data.toString().slice(2).split("_");
    const platformId = bodyParts[0]
    const projectId = bodyParts[1]
    unassignProjectFromPlatform(eventAuthor, platformId, projectId)
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
