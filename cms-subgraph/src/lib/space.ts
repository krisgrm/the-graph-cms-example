import {Space, User} from "../../generated/schema";

export function initSpace(owner: string, id: string) : void {
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