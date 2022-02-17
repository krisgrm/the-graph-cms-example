import {Address, Bytes, log} from "@graphprotocol/graph-ts"
import { StateChange } from "../generated/CMS/CMS"
import {Project} from "../generated/schema";

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

  // header byte 1 is the verb byte 2 is the noun
  // noun: create, delete, update
  let action = header.slice(0, 2)
  // noun: project
  let type = header.slice(2, 4)
  if (body.length > 1000) {
    log.info("body too long", [])
    return
  }
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
    let memberArray = members.split("_")
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

function addMembersToProject(event: StateChange, id: string, members: string[]): void {
  let project = Project.load(id)
  if (project == null) return
  log.info("project members: {}", [members.length.toString()])
  let projectMembers = project.members
  for (let i = 0; i < members.length; i++) {
    log.info("project member: {}", [members[i]])
    projectMembers.push(Address.fromString(members[i]))
    project.updatedAt = event.block.timestamp
  }
  project.members2 = ["BLABBLA", "BLABBLA"]
  project.members = projectMembers
  project.updatedAt = event.block.timestamp
  project.save()
}