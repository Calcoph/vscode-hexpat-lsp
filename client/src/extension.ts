/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from "path";
import {
    languages,
    workspace,
    EventEmitter,
    ExtensionContext,
    window,
    InlayHintsProvider,
    TextDocument,
    CancellationToken,
    Range,
    InlayHint,
    TextDocumentChangeEvent,
    Location,
    ProviderResult,
    debug,
    DebugAdapterDescriptorFactory,
    DebugAdapterDescriptor,
    DebugAdapterExecutable,
    DebugSession,
    Event,
    Task,
    tasks,
    ShellExecution,
    TaskDefinition,
} from "vscode";

import { LoggingDebugSession } from "vscode-debugadapter";

import {
    Disposable,
    Executable,
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind,
} from "vscode-languageclient/node";

import {
    AddressInfo
} from "net";

let client: LanguageClient;
// type a = Parameters<>;

export async function activate(context: ExtensionContext) {
    //Write to output.
    const traceOutputChannel = window.createOutputChannel("Hexpat Language Server trace");
    const command = process.env.HEXPAT_SERVER_PATH || "hexpat-language-server";
    const run: Executable = {
        command,
        options: {
        env: {
            ...process.env,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            RUST_LOG: "debug",
        },
        },
    };
    const serverOptions: ServerOptions = {
        run,
        debug: run,
    };
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    // Options to control the language client
    let clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: "file", language: "hexpat" }],
        synchronize: {
        // Notify the server about file changes to '.clientrc files contained in the workspace
        fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
        },
        traceOutputChannel,
    };
    
    // Create the language client and start the client.
    client = new LanguageClient("hexpat-language-server", "hexpat language server", serverOptions, clientOptions);
    activateInlayHints(context);
    client.start();

    context.subscriptions.push(debug.registerDebugAdapterDescriptorFactory("ImHex", new FakeDebugFactory()));
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}

export function activateInlayHints(ctx: ExtensionContext) {
    const maybeUpdater = {
        hintsProvider: null as Disposable | null,
        updateHintsEventEmitter: new EventEmitter<void>(),

        async onConfigChange() {
        this.dispose();

        const event = this.updateHintsEventEmitter.event;
        this.hintsProvider = languages.registerInlayHintsProvider(
            { scheme: "file", language: "hexpat" },
            new (class implements InlayHintsProvider {
            onDidChangeInlayHints = event;
            resolveInlayHint(hint: InlayHint, token: CancellationToken): ProviderResult<InlayHint> {
                return {
                label: hint.label,
                ...hint
                };
            }
            async provideInlayHints(
                document: TextDocument,
                range: Range,
                token: CancellationToken
            ): Promise<InlayHint[]> {
                const hints = (await client
                .sendRequest("custom/inlay_hint", { path: document.uri.toString() })
                .catch(err => null)) as [number, number, string][];
                if (hints == null) {
                return [];
                } else {
                return hints.map(item => {
                    const [start, end, label] = item;
                    let startPosition = document.positionAt(start);
                    let endPosition = document.positionAt(end);
                    return {
                    position: endPosition,
                    paddingLeft: true,
                    label: [
                        {
                        value: label,
                        location: new Location(document.uri, startPosition),
                        },
                    ],
                    };
                });
                }
            }
            })()
        );
        },

        onDidChangeTextDocument({ contentChanges, document }: TextDocumentChangeEvent) {
        // debugger
        // this.updateHintsEventEmitter.fire();
        },

        dispose() {
        this.hintsProvider?.dispose();
        this.hintsProvider = null;
        this.updateHintsEventEmitter.dispose();
        },
    };

    workspace.onDidChangeConfiguration(maybeUpdater.onConfigChange, maybeUpdater, ctx.subscriptions);
    workspace.onDidChangeTextDocument(maybeUpdater.onDidChangeTextDocument, maybeUpdater, ctx.subscriptions);

    maybeUpdater.onConfigChange().catch(console.error);
}

class FakeDebugFactory implements DebugAdapterDescriptorFactory {

    // Just a fake debugger to make VSCode shut up about errors
    createDebugAdapterDescriptor(session: DebugSession, executable: DebugAdapterExecutable): ProviderResult<DebugAdapterDescriptor> {
        if (!executable) {
			const command = "echo";
			const args = [
				"a",
			];
			const options = {};
			executable = new DebugAdapterExecutable(command, args, options);
		}

		return executable;
    }
    
}

interface ImHexTaskDefinition extends TaskDefinition {
  /**
   * The task name
   */
  task: string;
}

let taksPromise: Thenable<Task[]> | undefined = undefined;
tasks.registerTaskProvider('imhex-task', {
    provideTasks: () => {
      if (!taksPromise) {
        taksPromise = getTasks();
      }
      return taksPromise;
    },
    resolveTask(_task: Task): Task | undefined {
      return undefined;
    }
});

async function getTasks(): Promise<Task[]> {
	const workspaceFolders = workspace.workspaceFolders;
	const result: Task[] = [];
	if (!workspaceFolders || workspaceFolders.length === 0) {
		return result;
	}
	for (const workspaceFolder of workspaceFolders) {
		const folderString = workspaceFolder.uri.fsPath;
		if (!folderString) {
			continue;
		}

        const taskName = "Run On Imhex";
        const kind: ImHexTaskDefinition = {
            type: 'imhex-task',
            task: taskName
        };

        const task = new Task(kind, workspaceFolder, taskName, 'imhex-task', new ShellExecution("${command:hexpat-language-server.runOnImHex} ${file}"));
        result.push(task);
	}
	return result;
}
