import {Address, Bytes, log} from "@graphprotocol/graph-ts"
import { StateChange } from "../generated/CMS/CMS"
import {Project, User, UserProject} from "../generated/schema";
import { store } from '@graphprotocol/graph-ts'

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

  // header byte 1 is the action byte 2 is the type
  // noun: create, delete, update
  let action = header.slice(0, 2)
  // noun: project
  let type = header.slice(2, 4)

  log.info("action: {}, type: {}", [action.toString(), type.toString()])
  log.info("body: {}", [body.toString()])
  // create project
  if (action.toString() == "01" && type.toString() == "01") {
    // project id is first 4 bytes of body
    let id = body.slice(0, 4)
    // project name is the rest of the body
    let name = body.slice(4)
    log.info("create project, ID: {}, name: {}", [id, name])
    createProject(event, id, Bytes.fromHexString("0x" + name).toString())
  }
  // add members to project
  if (action.toString() == "02" && type.toString() == "01") {
    // project id is first 4 bytes of body
    let id = body.slice(0, 4)
    // project members are string addresses of the rest of the body
    // split members into array
    let members = Bytes.fromHexString("0x" + body.slice(4)).toString()
    log.info("parsed members from body: {}", [members])
    let memberArray = members.split("_")
    log.info("member array: {}", [memberArray[0]])
    log.info("add members to project, ID: {}, members: {}", [id, memberArray.toString()])
    addMembersToProject(event, id, memberArray)
  }
}

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // None


function createProject(event: StateChange, id: string, name: string): void {
  let project = Project.load(id)
  if (project != null) return
  project = new Project(id)
  project.owner = event.params.author
  project.name = name
  project.createdAt = event.block.timestamp
  project.updatedAt = event.block.timestamp
  project.save()
}

function addMembersToProject(event: StateChange, projectId: string, members: string[]): void {
  let project = Project.load(projectId)
  if (project == null) return
  if (project.owner != event.params.author) return
  log.info("Number of project members: {}", [members.length.toString()])
  let projectMembers = project.members
  for (let i = 0; i < members.length; i++) {
    log.info("project member: {}", [members[i]])
    let user = User.load(members[i])
    if (user == null) {
      user = new User(members[i])
      user.save()
    }
    let userProject = UserProject.load(members[i] + "-" + projectId)
    if (userProject == null) {
      userProject = new UserProject(members[i] + "-" + projectId)
      userProject.user = members[i]
      userProject.project = projectId
      userProject.save()
      project.updatedAt = event.block.timestamp
      project.save()
    }
  }
}

function removeMembersFromProject(event: StateChange, projectId: string, members: string[]): void {
  let project = Project.load(projectId)
  if (project == null) return
  if (project.owner != event.params.author) return
  log.info("Number of project members: {}", [members.length.toString()])
  let projectMembers = project.members
  for (let i = 0; i < members.length; i++) {
    log.info("project member: {}", [members[i]])
    let userProject = UserProject.load(members[i] + "-" + projectId)
    if (userProject != null) {
      store.remove('UserProject', members[i] + "-" + projectId)
      project.updatedAt = event.block.timestamp
      project.save()
    }
  }
}