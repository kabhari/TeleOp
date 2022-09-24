import { connect } from "mongoose";
import "dotenv/config";
import AppContext from "./appContext";
import MinioClient from "./data/minio/client";

async function run_bg() {
  const appContext = AppContext.getInstance();

  await connect(AppContext.URL_MONGODB);
  AppContext.session.save();

  // Minio (@Mohammad: Im not sure if it's better to have a separate wrapper for Minio and Mongo or include them all in AppContext.
  // To me, it sounds like it's better to have them separate but open to discuss!)
  const minioClient = MinioClient.getMinioClient;
  if (minioClient) {
    console.log("Minio Client started.");
  }

  console.log("Node Process Initiated, is Dev?", AppContext.isDev);
}

run_bg().catch((err) => {
  console.error("fatal error in BG", err);
});
