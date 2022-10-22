Language Server Provider for ImHex's pattern language

## Features
- [x] Semantic syntax highlighting
- [X] Go to definition (experimental (only on v0.2.2-alpha1). Don't expect it to work in the following scenarios)
    * names defined in a namespace
- [X] Find references (experimental (only on v0.2.2-alpha1). Don't expect it to work in the following scenarios)
    * names defined in a namespace
- [ ] Inlay hints
- [ ] Completion

## Installing
Download it from the [vscode marketplace](https://marketplace.visualstudio.com/items?itemName=calcoph.hexpat-language-server) or [releases section](https://github.com/Calcoph/vscode-hexpat-lsp/releases).

You must also install [hexpat-lsp](https://github.com/Calcoph/hexpat-lsp).

## Notes
* It is recommended to also install ImHex's grammar: [Github](https://github.com/Calcoph/vscode-hexpat)/[Vscode marketplace.](https://marketplace.visualstudio.com/items?itemName=calcoph.vscode-hexpat)
* Be sure to configure the imhex folder setting correctly if `#include`s don't work.