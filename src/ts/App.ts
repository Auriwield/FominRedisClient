import {CommandLine} from "./CommandLine";
import {ReddisServer} from "./ReddisServer";
import {TreeView} from "./tree/TreeView";

$(() => {
    let auth = location.hash.substr(1);

    if (!auth) {
        auth = "gzaripov";
        location.hash = auth;
    }

    let cliServer = new ReddisServer();
    let treeServer = new ReddisServer();

    let commandLine: CommandLine = new CommandLine(auth);

    cliServer.onReady = () => {
        cliServer.send("AUTH " + auth);
    };

    cliServer.onTextReceived = text => {
        commandLine.println(text, ">>> ");
        updateTreeView();
    };

    commandLine.onCommand = command => {
        let parts = command.split(" ");
        parts.splice(1, 0, auth);
        return cliServer.send(parts.join(" "));
    };

    (<any>window).sendCommand =
        (command:string) => treeServer.send(command);

    let treeView = new TreeView();

    let updateTreeView = function () {
        if (treeServer.isConnecting) {
            setTimeout(() => updateTreeView(), 200);
            return;
        }
        treeServer.send("GET_DBS " + auth);
    };

    /*treeServer.onReady = () => {
        updateTreeView();
    };*/

    treeServer.onTextReceived = text => {
        treeView.updateTree(text, auth);
    };
});