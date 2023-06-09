# TeleOp

## Setup
---
### Install

- Ensure you have the [Protocol Buffer Compiler](https://grpc.io/docs/protoc-installation/) installed globally. In case of Windows machines, please add `protoc` to your path.
- Run `npm run install`
- Run `npm run proto`

### Extensions

You may install the `Vue Volar extension Pack` if you're using Visual Stuido Code as your IDE & plan to edit the front-end code; otherwise, skip to the next step.

## Execute
---
Make sure to run `Visualization` module first followed by the `Collection` module:

### Visualization

- Run `npm run v:dev`

### Collection

- Run `npm run c:dev`

## Format
---
- Run `npm run format`

## Setting up environment variables
---
### Local machine

- Create an empty file called `.env` under the `collection` directory and add this line to the file to indicate the server and port number for our GRPC host:

```
GRPC_HOST=localhost:50051
```

- similarly, create an empty `.env` file under the `visualization` directory and add this to indicate server and port number for our GRPC host, MonogoDB, and Minio:

```
GRPC_HOST=localhost:50051
MONGO_HOST=mongodb://127.0.0.1/cathpilot
MINIO_HOST=localhost
MINIO_PORT=9000
VITE_MINIO_ENDPOINT=127.0.0.1:9000
MINIO_ACCESS_KEY=your_minio_access_key
MINIO_SECRET_KEY=your_minio_secret_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
BUCKETS_REGION=us-east-2
BUCKET_NAME=your_bucket_name
```

For more information, you can always refer to `.env.template` files under `visualization` and `collection` directories.

## MonogoDB
---
Please refer to our [README file](visualization/bg/Data/README.md) for more information.

## Minio
---
Please download Minio Server and run it before firing the app.
Example for Windows machine: `./minio.exe server ./`

## Data Flow
---
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./flow_dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./flow_light.svg">
  <img alt="TeleOp Data Flow">
</picture>

## Tips
---
- Make sure to run `c:dev` after the visualization module is up and running. If you encounter an error after running `npm run c:dev` too quickly, please try again. This won't be an issue in the prod version.
- Should you encounter the following (or similar) error in the visualization module after pulling in new changes or installing a new library, you may delete the `visualization > dist` directory and try running `npm run v:dev` again:
  - `Error: The following dependencies are imported but could not be resolved: Index.js (imported by C:/code/cathpilot/visualization/dist/bg/server-dev.html)`)

