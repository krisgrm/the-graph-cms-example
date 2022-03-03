import {
  AdminPlatform,
  AdminProject,
  Content,
  ContentPlatform,
  ContentProject,
  Platform,
  Project,
  User
} from "../../generated/schema";
import {store} from "@graphprotocol/graph-ts";
import {buildMappingTableId} from "./utils";


/**
 * Creates new content entity from provided parameters
 * @param sender
 * @param contentId
 * @param metadata
 */
export function createContent(sender: string, contentId: string, metadata: string) : void {
  let content = Content.load(contentId)
  if (content != null) return
  content = new Content(contentId)

  // get or create owner
  let user = User.load(sender)
  if (user == null) {
    user = new User(sender)
    user.save()
  }
  content.creator = sender
  content.metadata = metadata
  content.save()
}

/**
 * Assigns existing content entity to a project
 * Sender must be the owner or admin of the project
 * @param sender
 * @param projectId
 * @param contentId
 */
export function assignContentToProject(sender: string, projectId: string, contentId: string) : void {
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

/**
 * Assigns existing content entity to a platform
 * Sender must be the owner or admin of the platform
 * @param sender
 * @param platformId
 * @param contentId
 */
export function assignContentToPlatform(sender: string, platformId: string, contentId: string) : void{

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

/**
 * Removes content entity from a project
 * It deletes a ContentPlatform mapping entity
 * @param sender
 * @param projectId
 * @param contentId
 */
export function unassignContentFromPlatform(sender: string, projectId: string, contentId: string) : void {
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

/**
 * Removes content entity from a project
 * It deletes a ContentProject mapping entity
 * @param sender
 * @param projectId
 * @param contentId
 */
export function unassignContentFromProject(sender: string, projectId: string, contentId: string) : void {
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

