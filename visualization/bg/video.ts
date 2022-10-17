import { StreamVideoRequest } from "./../proto/coordinate";
import AppContext from "./appContext";
import { MinioFuncs, S3Funcs, StorageHelper } from "./data/storage/functions";
import { MinioClient, S3CloudClient } from "./data/storage/client";
import { BucketItem } from "minio";

export class VideoEvent {
  private static _createBucket: boolean = true;
  private static _bucket: string; // bucket name
  private static _minioClient = MinioClient.getMinioClient;
  private static _zipBucket: string = "cathpilot-bucket-test"; // s3 main bucket containing all data
  private static _BUCKETS_REGION = process.env["BUCKETS_REGION"]!;
  private static _recordingsBucketPrefix = "recording";
  private static _recordingsFilePrefix = "image";
  private static _zipfileSuffix = "_zipped";
  private static _framesBuffSizeFileSuffix = "_frames_buffer_size";

  static async manageVideoRecording(req: StreamVideoRequest) {
    // Recording started
    if (AppContext.isRecording) {
      if (this._createBucket) {
        // First stop the recording interactions momentarily until the bucket is created
        // Note: setting isRecording to false will start uploading stuff to minio and s3 and is incorrect, /n
        // the correct way to handle this is to set isRecording to `undefined`
        AppContext.isRecording = undefined;
        console.log("Recording started!");
        this._bucket = await MinioFuncs.createBucket(
          this._minioClient,
          this._recordingsBucketPrefix,
          this._BUCKETS_REGION,
          true // note: if set to false, all files end up in the same bucket (i.e. _recordings_bucket_prefix + timestamp)
        );
        console.log("A bucket is created!");
        AppContext.isRecording = true;
        this._createBucket = false;
      } else {
        MinioFuncs.create(
          this._minioClient,
          this._bucket,
          this._recordingsFilePrefix,
          req.data,
          true, // must set to true or else each object will replace the old one because it has the same name
          req.data.length,
          {
            "Content-Type": "png",
            recording: true,
          }
        );
      }
    } else {
      // Recording stopped
      console.log("Recording is stopped!");
      AppContext.isRecording = undefined;
      this._createBucket = true;
      let objects: Array<Buffer> = [];
      let files: Array<BucketItem> = [];

      // Stream data from the bucket
      // First list all the files
      const files_stream = MinioFuncs.listObjects(
        this._minioClient,
        this._bucket,
        "",
        true
      );
      files_stream.on("data", (file) => {
        files.push(file);
      });
      files_stream.on("error", (err) => {
        console.error(err);
      });
      files_stream.on("end", async () => {
        // Now we can read files
        for (let file_key in files) {
          await MinioFuncs.read(
            this._minioClient,
            this._bucket,
            files[file_key].name
          ).then((obj) => {
            objects.push(obj);
          });
        }
        console.log("Minio data is read successfully!");

        StorageHelper.zipAndUpload(
          this._zipBucket,
          objects,
          this._bucket + this._zipfileSuffix,
          this._bucket + this._framesBuffSizeFileSuffix,
          true,
          true,
          MinioClient.getMinioClient,
          S3CloudClient.getS3Client
        );
      });
    }
  }

  static async importVideoFromStorage(
    zipData: string,
    isCloud: Boolean = false
  ): Promise<Array<Buffer>> {
    const res = StorageHelper.unzipAndReturn(
      this._zipBucket,
      zipData + this._zipfileSuffix,
      zipData + this._framesBuffSizeFileSuffix,
      !isCloud,
      isCloud,
      MinioClient.getMinioClient,
      S3CloudClient.getS3Client
    );
    return res;
  }
}
