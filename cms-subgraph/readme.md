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
`0xd2971772929F177b5Fe58A336b1C9b71d5983919`

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
####
https://appdevtools.com/base58-encoder-decoder
https://string-functions.com/string-hex.aspx
https://www.myetherwallet.com/wallet/interact

#### Init space
- Data: `0x0101`

#### Create platform
- Data: `0x0201 + bytes(space-id)`
- Example:
  - SpaceId: `a05f61d4a6ebd0df97df6866aa309767dadb8679157a06885595396457cbd0ef-161`
  - Data: `0x0201613035663631643461366562643064663937646636383636616133303937363764616462383637393135376130363838353539353339363435376362643065662d313631`
#### Assign content to platform
- Data: `0x0202 + bytes(content-id + "_" + platform-id)`
- Example: 
  - contentId: `b252c462965a8828a1fc6db018f181d6a84e74986226484548e5016face8eb0a-99`
  - platformId: `82bebe7cd3853d52ebff0a784dc3e172589d24a892066e374d3b8c92710b990c-38`
  - Data: `0x0202623235326334363239363561383832386131666336646230313866313831643661383465373439383632323634383435343865353031366661636538656230612d39395f383262656265376364333835336435326562666630613738346463336531373235383964323461383932303636653337346433623863393237313062393930632d3338`
#### Approve admin of platform
- Data: `0x0203 + bytes(platform-id + "_" admin-address + "_" admin-address + "_" admin-address + "_" ...)`
- Example:
  - platformId: `82bebe7cd3853d52ebff0a784dc3e172589d24a892066e374d3b8c92710b990c-38`
  - adminAddress1: `0xb01DB4A1AF9bA5001676Fc60f05D1833746f2460`
  - adminAddress2: `0x74aAEBd50eF51dA9FCa10fD00528D241E63b1B0c`
  - Data: `0x0203383262656265376364333835336435326562666630613738346463336531373235383964323461383932303636653337346433623863393237313062393930632d33385f3078623031444234413141463962413530303136373646633630663035443138333337343666323436305f307837346141454264353065463531644139464361313066443030353238443234314536336231423063`
#### Revoke admin of platform
- Data: `0x0204 + bytes(platform-id + "_" admin-address + "_" admin-address + "_" admin-address + "_" ...)`
#### Assign project to platform
- Data: `0x0205 + bytes(project-id + "_" + platform-id)`
- Example: 
  - projectId: `827c045036b9b99db0570d07594771a03ed87637cc4443a45c3fb1e0a57284be-79`
  - platformId: `82bebe7cd3853d52ebff0a784dc3e172589d24a892066e374d3b8c92710b990c-38`
  - Data: `0x0205383237633034353033366239623939646230353730643037353934373731613033656438373633376363343434336134356333666231653061353732383462652d37395f383262656265376364333835336435326562666630613738346463336531373235383964323461383932303636653337346433623863393237313062393930632d3338`

#### Create project
- Data: `0x0301`
- Example:
  - Data: `0x0301`
#### Assign content to project
- Data: `0x0302 + bytes(content-id + "_" + project-id)`
- Example:
  - contentId: `93bf77d3f64b06edfbf9f8334e8c12c52e629c2229f6f08d49bb1e06b8b5b02f-79`
  - projectId: `827c045036b9b99db0570d07594771a03ed87637cc4443a45c3fb1e0a57284be-79`
  - Data: `0x0302393362663737643366363462303665646662663966383333346538633132633532653632396332323239663666303864343962623165303662386235623032662d37395f383237633034353033366239623939646230353730643037353934373731613033656438373633376363343434336134356333666231653061353732383462652d3739`
#### Approve admin of project
- Data: `0x0303 + bytes(project-id + "_" admin-address + "_" admin-address + "_" admin-address + "_" ...)`
#### Revoke admin of project
- Data: `0x0304 + bytes(project-id + "_" admin-address + "_" admin-address + "_" admin-address + "_" ...)`

#### Create Content
- Data: `0x0401 + bytes(ipfs-hash-without-leading-0x1220)`
- Example:
  - ipfs hash: `QmdzcP2WHLCM6ZM7iWYfQH7vr8ETy5h8og9gHBZr1zhZa1` -> `1220e898bdc40e00c6568a12e7fce41e52964b7719f72b3966a6acac12d4bedd030a`
  - Data: `0x0401e898bdc40e00c6568a12e7fce41e52964b7719f72b3966a6acac12d4bedd030a`
- Example:
  - ipfs hash: `QmaycCkEJqE3WiCp9g8Fsm5TZaCgeyTt9hXc1L1wHWVZKw` -> `1220bbc3e6364041e2f6fd7a76e651955d1aa688644e9c9257a702326e44d4655a7a`
  - Data: `0x0401bbc3e6364041e2f6fd7a76e651955d1aa688644e9c9257a702326e44d4655a7a`
#### Delete Content
- Data: `0x0402 + bytes(content-id)`
#### Unassign Content
- Data: `0x0403 + bytes(content-id)`



## Flow for creating a new space and populating it:
1. **Init space**
2. Get spaceID and **Create platform**
3. **Create project**
4. Get projectID and PlatformID
   1. **Assign project to platform**
5. **Create content**
6. Get contentID and projectID
   1. **Assign content to project**
7. **Create content**
8. Get contentID and platformID
   1. **Assign content to platform**