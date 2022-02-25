# Intro

```shell
yarn install
```

## The graph
### Explorer:
https://thegraph.com/hosted-service/subgraph/krisgrm/cms
### Deploy updated subgraph
```shell
yarn deploy 
```

## Local development

### Graph local node
- https://github.com/graphprotocol/graph-node
```shell
git clone https://github.com/graphprotocol/graph-node
cd graph-node
cd docker
docker-compose up
```
Back in this repository you can run:
```shell
yarn create-local
yarn remove-local
yarn deploy-local
```

### Contract deployed on rinkeby/goerli
`0xab62F94EC37E7F8c7a7DA560C6a1B6225362Cd12`

### Requests
When subgraph is parsing the smart contract calls it has the following logic:
It takes data field from contract calls. `0x` is removed from the data field it is indicator this is byte encoded data.
Then it takes the first 4 characters of the data field and it is used to determine the type of the data.
First 2 characters represent action:

```shell
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
```

#### Init space
- Data: `0x0101`

#### Create platform
- Data: `0x0201 + bytes(space-id)`
#### Assign content to platform
- Data: `0x0202 + bytes(content-id + "_" + platform-id)`
#### Approve admin of platform
- Data: `0x0203 + bytes(platform-id + "_" admin-address + "_" admin-address + "_" admin-address + "_" ...)`
#### Revoke admin of platform
- Data: `0x0204 + bytes(platform-id + "_" admin-address + "_" admin-address + "_" admin-address + "_" ...)`
#### Assign project to platform
- Data: `0x0205 + bytes(project-id + "_" + platform-id)`

#### Create project
- Data: `0x0301`
#### Assign content to project
- Data: `0x0302 + bytes(content-id + "_" + project-id)`
#### Approve admin of project
- Data: `0x0303 + bytes(project-id + "_" admin-address + "_" admin-address + "_" admin-address + "_" ...)`
#### Revoke admin of project
- Data: `0x0304 + bytes(project-id + "_" admin-address + "_" admin-address + "_" admin-address + "_" ...)`

#### Create Content
- Data: `0x0401 + bytes(ipfs-hash-without-leading-0x1220)`
#### Delete Content
- Data: `0x0402 + bytes(content-id)`
#### Unassign Content
- Data: `0x0403 + bytes(content-id)`