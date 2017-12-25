<!--suppress TypeScriptUnresolvedVariable -->
<template>
    <ul class="fa-ul">
        <li>
            <i :class="genIcon" @click="toggle"></i>

            <span v-if="!isValue"
                  :class="{bold: isDb}">
                <input type="text" name="list_name" v-if="model.parent != null"
                       :value="model.name" @change="rename" @keydown="fitInput"
                       :style="'width: ' + model.name.length + 'ch'">
                <span v-else @click="toggle" class="toggle">{{model.name}}</span>
                <span v-if="model.parent != null && (isList || isDb)" @click="toggle" class="toggle">
                    [{{model.expanded ? '-' : '+'}}]
                </span>
            </span>
            <span v-else>
                <input type="text" name="list_value" @change="rename"
                       @keydown="fitInput" :value="model.name"
                       :style="'width: ' + model.name.length + 'ch'">
            </span>

            <ul class="fa-ul"
                v-show="model.expanded"
                v-if="!isValue">
                <!--suppress HtmlUnknownTag, CommaExpressionJS -->
                <item class="item"
                      v-for="(model, index) in model.children" :key="model.name"
                      :model="model" v-bind:index="index">
                </item>
                <li v-if="isRoot" class="add" childtype="db" @click="addChild">
                    <i class="fa-li fa fa-plus"></i>
                    <span>Add new db...</span>
                </li>
                <li v-if="isDb" class="add" childtype="list" @click="addChild">
                    <i class="fa-li fa fa-plus"></i>
                    <span>Add new list...</span>
                </li>
                <li v-if="isDb" class="add" childtype="key" @click="addChild">
                    <i class="fa-li fa fa-plus"></i>
                    <span>Add new key...</span>
                </li>
                <li v-if="isList" class="add" childtype="value" @click="addChild">
                    <i class="fa-li fa fa-plus"></i>
                    <span>Add new value...</span>
                </li>
            </ul>
        </li>
    </ul>
</template>

<script lang="ts">

    import Vue from "vue";
    import {ItemType, TreeDb, TreeDbList, TreeItem, TreeKey, TreeRoot, TreeValue} from "../tree/TreeItem";

    export default Vue.component("item",
        Vue.extend({
            template: '#item-template',
            props: {
                model: Object,
                sendCommand: Function
            },
            data: function () {
                return {}
            },
            computed: {
                isList(): boolean {
                    return this.checkType(ItemType.List);
                },
                isKey(): boolean {
                    return this.checkType(ItemType.Key);
                },
                isValue(): boolean {
                    return this.checkType(ItemType.Value);
                },
                isDb(): boolean {
                    return this.checkType(ItemType.Db);
                },
                isRoot(): boolean {
                    return this.checkType(ItemType.Root);
                },
                genIcon(): string {
                    return "fa-li fa " + this.model.icon + (this.isKey ? "" : " toggle");
                }
            },
            methods: {
                toggle() {
                    if (this.isDb || this.isList) {
                        this.model.expanded = !this.model.expanded
                    }
                },
                checkType(type: ItemType): boolean {
                    return this.model.type === type;
                },
                fitInput(e: any) {
                    /*  e.target.lastValue = e.target.lastValue == undefined ?
                          e.target.value : e.target.lastValue;*/
                    setTimeout(() => {
                        e.target.style.width = e.target.value.length + "ch";
                    }, 10);
                },
                rename(e: Event) {
                    let parents = this.getParents();
                    let token = parents.splice(0, 1)[0];
                    let newName = (<any>e.target).value;
                    let index = this.$vnode.data!.attrs!.index;
                    let oldName = <string>parents.pop();

                    let nhbrs = this.model.parent.children;
                    for (let i = 0; i < nhbrs.length; i++) {
                        if (nhbrs[i].name === newName) {
                            alert("Such value is already exist");
                            e.preventDefault();
                            this.model.name = oldName;
                            (<any>e.target).value = oldName;
                            return;
                        }
                    }

                    if (this.model.type === "value"
                        && this.model.parent.type === ItemType.List) {
                        oldName = index;
                    }

                    parents.push(oldName);

                    let command = `update ${token} ${newName}`;

                    for (let parent of parents) {
                        command += "." + parent;
                    }
                    // noinspection TypeScriptUnresolvedFunction
                    (<any>window).sendCommand(command);

                    if (!newName) {
                        this.model.parent.children.splice(index, 1);
                    }
                    (<any>e.target).blur();
                },
                addChild(e: any) {
                    let type = e.target.parentElement.getAttribute("childtype");
                    let name;
                    let count = -1;
                    do {
                        count++;
                        name = type + count;
                    } while (!this.checkName(name));

                    let parents = this.getParents();

                    let command: string | null = null;
                    let child: TreeItem | null = null;
                    let parent: TreeItem = this.model;
                    switch (type) {
                        case ItemType.Db:
                            command = `create ${parents[0]} ${name}`;
                            child = new TreeDb(name, parent);
                            break;
                        case ItemType.List:
                            command = `lput ${parents[0]} ${parents[1]} ${name}`;
                            child = new TreeDbList(name, parent);
                            break;
                        case ItemType.Key:
                            command = `put ${parents[0]} ${parents[1]} ${name} value`;
                            child = new TreeKey(name, "value", parent);
                            break;
                        case ItemType.Value:
                            command = `lput ${parents[0]} ${parents[1]} ${parents[2]} ${name}`;
                            child = new TreeValue(name, parent);
                            break;
                    }

                    if (command == null || child == null)
                        return;

                    // noinspection TypeScriptUnresolvedFunction
                    (<any>window).sendCommand(command);
                    this.model.children.push(child);
                },
                getParents(): string[] {
                    let parent = this.model;

                    let parents = [];

                    while (parent != null) {
                        parents.push(parent.name);
                        parent = parent.parent;
                    }

                    return parents.reverse();
                },
                checkName(name: string): boolean {
                    let children: TreeItem[] = this.model.children;
                    for (let child of children) {
                        if (child.name === name) {
                            return false;
                        }
                    }
                    return true;
                }
            }
        }));
</script>