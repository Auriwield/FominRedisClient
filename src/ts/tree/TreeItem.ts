export interface TreeItem {
    name: string,
    type: ItemType,
    icon: string,
    parent: TreeItem | null
}

export enum ItemType {
    Root = "root",
    Db = "db",
    List = "list",
    Key = "key",
    Value = "value",
}

export class TreeList implements TreeItem {
    name: string;
    type = ItemType.List;
    icon: string;
    parent: TreeItem | null;
    children: TreeItem[];
    expanded: boolean;
}

export class TreeKey extends TreeList {
    name: string;
    type = ItemType.Key;
    icon = "fa-key";
    parent: TreeItem;
    expanded = true;
    private _children: TreeItem[];

    constructor(name: string, value: string, parent: TreeItem) {
        super();
        this.name = name;
        this._children = [new TreeValue(value, this)];
        this.parent = parent;
    }

    get children(): TreeItem[] {
        return (<TreeItem[]>[]).concat(this._children);
    }

    set children(value: TreeItem[]) {
    }
}

export class TreeValue implements TreeItem {
    name: string;
    type = ItemType.Value;
    icon = "fa-minus";
    parent: TreeItem;

    constructor(name: string, parent: TreeItem) {
        this.name = name;
        this.parent = parent;
    }
}

export class TreeRoot extends TreeList {
    type = ItemType.Root;
    icon = "fa-user";
    expanded = true;
    parent = null;

    constructor(name: string, children: TreeItem[] = []) {
        super();
        this.name = name;
        this.children = children;
    }
}

export class TreeDb extends TreeList {
    type = ItemType.Db;
    icon = "fa-database";
    expanded = false;

    constructor(name: string, parent: TreeItem, children: TreeItem[] = []) {
        super();
        this.name = name;
        this.parent = parent;
        this.children = children;
    }
}

export class TreeDbList extends TreeList {
    icon = "fa-bars";
    expanded = false;

    constructor(name: string, parent: TreeItem, children: TreeItem[] = []) {
        super();
        this.name = name;
        this.parent = parent;
        this.children = children;
    }
}