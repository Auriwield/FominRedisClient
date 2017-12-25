import {CommandLineHistory} from "./CommandLineHistory";
import {isNullOrUndefined} from "util";

export class CommandLine {
    private divider = "$ ";
    private commandLine: JQuery<HTMLElement>;
    private _onCommand: (command: string) => void;
    private auth: string;
    private history: CommandLineHistory;

    constructor(auth: string) {
        this.commandLine = $("#command-line");
        this.history = new CommandLineHistory();
        this.auth = auth;
        $(".reddis-cli").keydown((e) => this.onKeyDown(e));
        this.commandLine.click(() => this.onClick());
        this.print("");
    }

    print(text = "", prompt: boolean | string = true) {
        if (!text) text = "";
        if (this.lastLine().indexOf(this.prompt()) !== -1) {
            prompt = false;
        }
        let p = typeof prompt === "string" ? prompt : this.prompt();
        this.commandLine.val(this.text() + (prompt ? p : "") + text);

        let cl = this.commandLine[0];
        cl.scrollTop = cl.scrollHeight - cl.clientHeight;
    }

    println(text = "", prompt: boolean | string = true) {
        this.print(text + "\n", prompt);
        if (prompt) this.print();
    }

    clearLastLine() {
        this.commandLine.val(this.text().substring(0, this.lastNewLine()));
    }

    set onCommand(value: (command: string) => void) {
        this._onCommand = value;
    }

    private text(): string {
        return this.commandLine.val() as string;
    }

    private onKeyDown(event: any) {
        if (!this.isActive()
            || !this.isCursorOnLastLine()) {
            return false;
        }

        let cursorPosition = this.getCursorPositionOnLastLine();
        let promptLen = this.prompt().length;

        if (cursorPosition < promptLen ||
            (event.key === "Backspace" || event.key === "ArrowLeft") && cursorPosition <= promptLen) {
            return false;
        }

        if (event.key === "ArrowUp") {
            if (this.history.isOnLastPosition())
                this.history.cache = this.getCommand();
            this.clearLastLine();
            this.print(this.history.previous());
            return false;
        }

        if (event.key === "ArrowDown") {
            let text = this.history.next();
            if (isNullOrUndefined(text)) {
                return false;
            }

            this.clearLastLine();
            this.print(text);

            return false;
        }

        if (event.key === "Enter"
            && document.activeElement === this.commandLine[0]) {
            this.handleEnter();
            return false;
        }

        return true;
    }

    private onClick() {
        let cursorPosition = this.getCursorPositionOnLastLine();
        let promptLen = this.prompt().length;

        if (!this.isActive()
            || !this.isCursorOnLastLine()
            || cursorPosition <= promptLen) {
            this.commandLine.prop("selectionStart", this.lastNewLine() + promptLen);
        }
    }

    private isCursorOnLastLine(): boolean {
        let cursorPosition = this.commandLine.prop("selectionStart");
        return this.text().substring(cursorPosition).indexOf("\n") === -1;
    }

    private getCursorPositionOnLastLine() {
        let cursorPosition = this.commandLine.prop("selectionStart");
        return cursorPosition - this.lastNewLine();
    }

    private lastLine(): string {
        return this.text().substring(this.lastNewLine());
    }

    // returns index of last "\n" symbol,
    // if there is now "\n" returns 0
    private lastNewLine(): number {
        let lastNewLine = this.text().lastIndexOf("\n");
        return lastNewLine === -1 ? 0 : lastNewLine + 1;
    }

    private prompt() {
        return this.auth + this.divider;
    }

    private isActive(): boolean {
        return document.activeElement === this.commandLine[0];
    }

    private getCommand() {
        let text = this.text();
        let index = text.lastIndexOf("\n");
        let command = index === -1 ? text : text.substring(index + 1);
        return command.replace(this.prompt(), "");
    }

    private handleEnter() {
        if (!this._onCommand) {
            return;
        }

        let command = this.getCommand();
        this.println("", !command);

        if (!command) {
            return;
        }
        this.history.save(command);
        this._onCommand(command);
    }
}