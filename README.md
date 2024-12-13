# Project Setup

This project provides a development environment using Next.js and Rust. Next.js is located in the project root directory, and Rust is in the `bibliography-parser/` directory to use as a wasm.

## Setting Up the Development Environment

This project uses VS Code Dev Containers to set up the development environment. Please follow these steps.

### Prerequisites

- Docker installed
- VS Code installed
- VS Code Remote - Containers extension installed

### Steps

1. Clone the repository.

    ```sh
    git clone https://github.com/chantakan/bibtex2text-converter.git
    cd bibtex-converter
    ```

2. Open the project in VS Code.

    ```sh
    code .
    ```

3. Open VS Code's command palette (`Ctrl+Shift+P`) and select `Remote-Containers: Reopen in Container`.

4. The Dev Container will start and install necessary dependencies.

## Next.js Development

Use the following commands for Next.js development.

### Start Development Server

```sh
npm run dev
```
Access the application in your browser at http://localhost:3000

### Build
```bash
npm run build
```

### Start in Production Mode
```bash
npm start
```

## Rust Development
*We are currently unsure of the implementation of WASM in TURBOPACK, so the application of this one has not yet been determined.


For Rust development, navigate to the bibliography-parser/ directory.

### Build
```bash
cd bibliography-parser
cargo build
```

### Run
```bash
cargo run
```

### Test
```bash
cargo test
```

Would you like me to clarify or adjust any part of the translation?