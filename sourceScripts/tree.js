import TreeModel from 'tree-model';

export default class Tree {
    constructor() {
        this.tree = new TreeModel();
        this.simprovTree = {};
        this.currentNode = {};
    }

    addRoot(node) {
        return new Promise((resolve) => {
            this.simprovTree = this.tree.parse(node);
            this.currentNode = this.simprovTree;
            resolve();
        });
    }

    addNode(node) {
        return new Promise((resolve) => {
            let tempNode = this.tree.parse(node);
            this.currentNode = this.currentNode.addChild(tempNode);
            resolve();
        });
    }

   async actionSequencer(requiredID){
       let foundNode = await this.findNode(requiredID);
       if (foundNode.model.checkpoint) {
           return foundNode.model.id;
       }
       let nodePath = foundNode.getPath();
       nodePath.reverse();
       let checkpointObject = nodePath.find((node) => node.model.checkpoint === true);
       nodePath.reverse();
       let checkpointOIndex = nodePath.indexOf(checkpointObject);
       let sequenceArray = nodePath.splice(checkpointOIndex);
       let finalSequence = [];
       for (let node of sequenceArray) {
           finalSequence.push(node.model.id);
       }
       return finalSequence;
    }

    async addTree(requiredTree, requiredCurrentNode) {
        this.simprovTree = this.tree.parse(requiredTree);
        this.currentNode = await this.findNode(requiredCurrentNode);
    }

    findNode(nodeAttribute) {
        return new Promise((resolve) => {
            let foundNode = this.simprovTree.first((node) => {
                return node.model.id === nodeAttribute;
            });
            resolve(foundNode);
        });
    }

    getTree() {
        return Promise.resolve(this.simprovTree.model);
    }

    getCurrentNode() {
        return Promise.resolve(this.currentNode.model.id);
    }

    setCurrentNode(node) {

    }

    nodeMaker(cuid, checkpoint, inverse) {
        return Promise.resolve({id: cuid, checkpoint: checkpoint, inverse: inverse, children: []});
    }

    printTree() {
        return new Promise((resolve) => {
            let tempTree = JSON.stringify(this.simprovTree.model, null, '\t');
            console.log(tempTree);
            resolve();
        });
    }

    classTreeInformation() {
        console.log('Simprov:> This is Class Tree');
    }
}