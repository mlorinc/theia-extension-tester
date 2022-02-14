import { TreeItemNotFound } from "extension-tester-page-objects";
import { TreeNode } from "./TreeNode";

export class TreeStructure<T extends TreeNode> {
    private root: TreeStructureNode<T>;
    private activeNode: TreeStructureNode<T>;
    private relativeSearchNode: TreeStructureNode<T>;

    constructor() {
        this.root = new TreeStructureNode(undefined, undefined, 0);
        this.activeNode = this.root;
        this.relativeSearchNode = this.root;
    }

    private findHelper(start: TreeStructureNode<T>, path: string[]): TreeStructureNode<T> | undefined {
        let currentNode = start;

        for (const p of path) {
            currentNode = currentNode.get(p);
        }

        if (currentNode === start) {
            return undefined;
        }

        return currentNode;
    }

    find(...path: string[]): T | undefined {
        const node = this.findHelper(this.root, path);
        return node?.data.node;
    }

    resetRelativeSearch(): void {
        this.relativeSearchNode = this.root;
    }

    relativeSearch(label: string): T | undefined {
        const node = this.findHelper(this.relativeSearchNode, [label]);

        if (node) {
            this.relativeSearchNode = node;
            return node.data.node;  
        }

        return undefined;
    }

    getLastAddedNode(): T {
        return this.activeNode.data.node;
    }

    async add(node: T): Promise<void> {
        const newNodeDepth = await node.getTreeDepth() + 1;
        const nodeData = await TreeStructureNodeData.create(node);
        let currentNode: TreeStructureNode<T> | undefined;

        // new node is child
        if (this.activeNode.depth < newNodeDepth) {
            const newNode = await this.activeNode.add(nodeData);
            this.activeNode = newNode;
        }
        // the node is sibling or its parent is sibling
        else {
            currentNode = this.activeNode.parent;
            while (currentNode && currentNode.depth >= newNodeDepth) {
                currentNode = currentNode.parent;
            }

            if (currentNode === undefined) {
                throw new Error('Unexpected undefined value.');
            }

            const newNode = await currentNode.add(nodeData);
            this.activeNode = newNode;
        }
    }

    nodeToString(node: TreeStructureNode<T>): string {
        const childrenString = [];
        let label = '\t'.repeat(node.depth) + ((node === this.root) ? ('root') : (node.data.label))
        label += ': {\n';
        label += '\t'.repeat(node.depth + 1) + 'depth: ' + node.depth + '\n';


        for (const child of Object.values(node.children)) {
            childrenString.push(this.nodeToString(child));
        }
        label += childrenString.join('\n');
        label += '\t'.repeat(node.depth) + '}\n'

        return label;
    }

    toString(): string {
        return this.nodeToString(this.root);
    }
}



class TreeStructureNode<T extends TreeNode> {
    private _parent: TreeStructureNode<T> | undefined;
    private _children: {[label: string]: TreeStructureNode<T>};
    private _data: TreeStructureNodeData<T> | undefined;
    private _depth: number;

    constructor(parent: TreeStructureNode<T> | undefined, data: TreeStructureNodeData<T> | undefined, depth: number) {
        this._parent = parent;
        this._children = {};
        this._data = data;
        this._depth = depth;
    }

    public get parent() : TreeStructureNode<T> | undefined {
        return this._parent;
    }
    
    public get children() : {[label: string]: TreeStructureNode<T>} {
        return this._children;
    }
    
    public get depth() : number {
        return this._depth;
    }
    
    
    public get data() : TreeStructureNodeData<T> {
        if (this._data === undefined) {
            throw new Error('Data are undefined.');
        }

        return this._data;
    }
    
    get(label: string): TreeStructureNode<T> {
        const data = this.children[label];

        if (data === undefined) {
            throw new TreeItemNotFound([label]);
        }

        return data;
    }

    async add(child: TreeStructureNodeData<T>): Promise<TreeStructureNode<T>> {
        if (Object.keys(this.children).includes(child.label)) {
            return this._children[child.label];
        }

        const node = new TreeStructureNode(this, child, this.depth + 1);
        this._children[child.label] = node;        
        return node;
    }
}

class TreeStructureNodeData<T extends TreeNode> {
    constructor(public readonly label: string, public readonly node: T) {

    }

    static async create<T extends TreeNode>(node: T): Promise<TreeStructureNodeData<T>> {
        return new TreeStructureNodeData(await node.getLabel(), node);
    }
}