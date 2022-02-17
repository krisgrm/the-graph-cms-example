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
```shell
## Creata project with id 1
0x01010002746573742d70726f6a656374
## Create project with id 2
0x01010002746573742d70726f6a656374
## add address to project 1
0x020100013078623031444234413141463962413530303136373646633630663035443138333337343666323436305f307837346141454264353065463531644139464361313066443030353238443234314536336231423063

```