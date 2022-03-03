import {AdminPlatform, Platform, Space, User} from "../../generated/schema";
import {store} from "@graphprotocol/graph-ts";
import {buildMappingTableId} from "./utils";


/**
 * Create a new platform entity from the given parameters.
 * sender must be the owner of the space entity.
 * @param sender
 * @param id
 * @param spaceId
 */
export function createPlatform(sender: string, id: string, spaceId: string) : void {
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

/**
 * Adds new User to the platform as the admin
 * Sender must be owner of the platform entity
 * @param sender
 * @param platformId
 * @param admins
 */
export function platformApproveAdmin(sender: string, platformId: string, admins: string[]) : void {
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

/**
 * Removes User from the platform as the admin
 * Sender must be owner of the platform entity
 * @param sender
 * @param platformId
 * @param admins
 */
export function platformRevokeAdmin(sender: string, platformId: string, admins: string[]) : void {
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