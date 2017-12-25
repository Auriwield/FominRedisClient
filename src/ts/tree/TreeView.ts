import Vue from "vue";
import TreeComponent from "../components/TreeView.vue"
import {isArray} from "util";
import {ItemType, TreeDb, TreeDbList, TreeItem, TreeKey, TreeRoot, TreeValue} from "./TreeItem";

export class TreeView {
    private vue: Vue;
    private lastTree: any;

    constructor() {
        this.vue = new Vue({
            el: "#app",
            data: {
                treeData: {}
            },
            components: {
                TreeComponent
            }
        });
    }

    updateTree(data: any, auth: string) {
        let tree = new TreeRoot(auth);

        let dbs;
        try {
            dbs = JSON.parse(data);
        } catch (err) {
            return;
        }
        let oldTree = TreeView.getJsonFormat(this.vue.$data.treeData);
        tree.expanded = oldTree ? oldTree.expanded : true;
        for (let dbName in dbs) {

            let db = new TreeDb(dbName, tree);

            if (oldTree) {
                db.expanded = !!oldTree.dbs[dbName].expanded
            }

            for (let key in dbs[dbName]) {
                if (!isArray(dbs[dbName][key])) {
                    let dbKey = new TreeKey(key, dbs[dbName][key], db);
                    db.children.push(dbKey);
                    continue;
                }

                let dbList = new TreeDbList(key, db);

                if (oldTree && oldTree.dbs[dbName]) {
                    dbList.expanded = !!oldTree.dbs[dbName].lists[key];
                }

                for (let listItem of dbs[dbName][key]) {
                    dbList.children.push(new TreeValue(listItem, dbList));
                }

                db.children.push(dbList);
            }

            tree.children.push(db);
        }
        this.vue.$data.treeData = tree;
    }

    private static getJsonFormat(tree: TreeRoot): any {
        if (!tree || !tree.children) {
            return null;
        }

        let root: any = {
            dbs : {},
            expanded : tree.expanded
        };

        for (let item of tree.children) {
            let treeDb =  <TreeDb>item;
            root.dbs[treeDb.name] = {
                lists : {},
                expanded: treeDb.expanded
            };
            for (let dbItem of treeDb.children) {
                if (dbItem.type !== ItemType.List) {
                    continue;
                }
                let list = <TreeDbList>dbItem;
                root.dbs[treeDb.name].lists[list.name] = list.expanded;
            }
        }

        return root;
    }
}