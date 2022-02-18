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


### Requests
When subgraph is parsing the smart contract calls it has the following logic:
It takes data field from contract calls. `0x` is removed from the data field it is indicator this is byte encoded data.
Then it takes the first 4 characters of the data field and it is used to determine the type of the data.
First 2 characters represent action:
01 - create, 02 - addMember, 03 - deleteMember, 04 - deleteProject
Second 2 characters represent entity:
01 - project
#### Create project
0x0101[ProjectNameInBytes]
Example for project name `Test Project`: 0x0101546573742050726f6a656374
```shell
## Creata project with id 1
0x01010002746573742d70726f6a656374
## Create project with id 2
0x01010002746573742d70726f6a656374
```
#### Add member to project
You can add multiple addresses by separating them with `_` before converting to bytes
0x0201[ProjectId][MemberAddressInBytes]
Example members: `0xb01DB4A1AF9bA5001676Fc60f05D1833746f2460_0x74aAEBd50eF51dA9FCa10fD00528D241E63b1B0c` -> `3078623031444234413141463962413530303136373646633630663035443138333337343666323436305f307837346141454264353065463531644139464361313066443030353238443234314536336231423063`
Example projectID: `0001`
Contract call data: `0x020100013078623031444234413141463962413530303136373646633630663035443138333337343666323436305f307837346141454264353065463531644139464361313066443030353238443234314536336231423063`
