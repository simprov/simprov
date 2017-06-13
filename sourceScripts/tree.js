import TreeModel from 'tree-model';
import treeify from 'treeify';

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

    async actionSequencer(requiredID) {
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

    getCurrentNodeID() {
        return Promise.resolve(this.currentNode.model.id);
    }

    async setCurrentNode(node) {
        let tempNode = await this.findNode(node);
        this.currentNode = tempNode;
    }

    nodeMaker(cuid, checkpoint, inverse) {
        return Promise.resolve({id: cuid, checkpoint: checkpoint, inverse: inverse, children: []});
    }

    printTree() {
        return new Promise((resolve) => {
            let tempTree = this.simprovTree.model;
            console.log('%cSimprov%c:>> %cTree', 'color:#FF4500', 'color:#FF6347', 'color:#32CD32');
            console.log(`%c${treeify.asTree(tempTree, true)}`, 'color:#32CD32');
            resolve();
        });
    }

    classTreeInformation() {
        console.log('This is Class Tree');
    }
}