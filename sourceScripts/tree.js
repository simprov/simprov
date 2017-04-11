import TreeModel from "tree-model";

export default class Tree {
    constructor() {
        this.tree = new TreeModel();
        this.rootNode = {};
        this.currentNode = {};
    }

    addRoot(node) {
        return new Promise((resolve) => {
            this.rootNode = this.tree.parse(node);
            this.currentNode = this.rootNode;
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

    getTree() {
        return Promise.resolve(this.rootNode.model);
    }

    nodeMaker(cuid, checkpoint, inverse) {
        return Promise.resolve({id: cuid, checkpoint:checkpoint, inverse: inverse, children: []});
    }

    printTree() {
        return new Promise((resolve) => {
            let tempTree = JSON.stringify(this.rootNode.model, null, '\t');
            console.log(tempTree);
            resolve();
        });
    }

    classTreeInformation() {
        console.log('Simprov:> This is Class Tree');
    }
}