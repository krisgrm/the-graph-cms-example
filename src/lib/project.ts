import {AdminPlatform, AdminProject, Platform, PlatformProject, Project, User} from "../../generated/schema";
import {buildMappingTableId} from "./utils";
import {store} from "@graphprotocol/graph-ts";

export function createProject(owner : string, id: string): void {
  let project = Project.load(id)
  if (project != null) return
  project = new Project(id)
  project.owner = owner
  project.save()
}

export function assignProjectToPlatform(sender: string, platformId : string, projectId: string) : void {

  let platform = Platform.load(platformId)
  if (platform == null) return
  let project = Project.load(projectId)
  if (project == null) return

  /* check if sender is owner OR admin of platform */
  if (platform.owner != sender) return

  /* create platformProject mapping */
  let platformProject = new PlatformProject(buildMappingTableId(platformId, projectId))
  platformProject.project = projectId
  platformProject.platform = platformId
  platformProject.save()
}

export function unassignProjectFromPlatform(sender: string, platformId: string, projectId: string) : void {
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

export function projectApproveAdmin(sender: string, projectId: string, admins: string[]) : void {
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

export function projectRevokeAdmin(sender: string, projectId: string, admins: string[]) : void{
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

