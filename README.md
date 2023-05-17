Language Server Provider for ImHex's pattern language

## Features
- [X] Semantic syntax highlighting
- [X] Go to definition (Experimental. Don't expect it to work in the following scenarios)
    * names defined in a namespace
- [X] Find references (Experimental. Don't expect it to work in the following scenarios)
    * names defined in a namespace
- [ ] Inlay hints
- [ ] Completion
- [ ] Run code on imhex

## Installing
Download it from the [vscode marketplace](https://marketplace.visualstudio.com/items?itemName=calcoph.hexpat-language-server) or [releases section](https://github.com/Calcoph/vscode-hexpat-lsp/releases).

You must also install [hexpat-lsp](https://github.com/Calcoph/hexpat-lsp).

## Notes
* It is recommended to also install ImHex's grammar: [Github](https://github.com/Calcoph/vscode-hexpat)/[Vscode marketplace.](https://marketplace.visualstudio.com/items?itemName=calcoph.vscode-hexpat)
* Be sure to configure the imhex folder setting correctly if `#include`s don't work.