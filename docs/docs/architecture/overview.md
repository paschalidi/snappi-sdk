# Snappi Architecture Overview

Snappi is a visual regression testing system built with a distributed architecture. It combines TypeScript for browser
automation with a Rust backend for image processing and storage management.

## Core Components

| Component      | Description                                   | Technologies    |
|----------------|-----------------------------------------------|-----------------|
| TypeScript SDK | Thin layer for browser automation and capture | TS, Playwright  |
| Rust Backend   | Core processing engine and API server         | Rust, actix-web |
| Message Queue  | Async job processing and distribution         | RabbitMQ        |
| Storage        | Image and data persistence                    | GCP, PostgreSQL |

## System Architecture

```mermaid
graph TD
    A[CLI/GitHub Action] -->|Uses| B[TS SDK]
    B -->|Captures & Uploads| C[Rust API]
    C -->|Queues Job| D[RabbitMQ]
    D -->|Processes| E[Rust Workers]
    E -->|Stores| F[GCP/DB]
    E -->|Updates| G[Run Status]
    A -->|Polls| G
```

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GHA as GitHub Action
    participant API as Rust API
    participant MQ as RabbitMQ
    participant W as Worker
    participant S as Storage
    participant DB as Database
    Dev ->> GHA: Push Code
    GHA ->> GHA: Build Storybook
    GHA ->> GHA: Capture Screenshots
    GHA ->> API: Upload Screenshots
    API ->> S: Store Images
    API ->> MQ: Queue Processing Job
    API ->> GHA: Return Run ID
    MQ ->> W: Process Job
    W ->> S: Fetch Images
    W ->> W: Compare Images
    W ->> S: Store Diffs
    W ->> DB: Store Results
    GHA ->> API: Poll Status
    API ->> DB: Fetch Results
    API ->> GHA: Return Results
    GHA ->> Dev: Update PR
```