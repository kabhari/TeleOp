import { StreamVideoRequest } from "./../proto/coordinate";
import AppContext from "./appContext";
import zlib from "node:zlib";
import fs from "fs";
import { MinioFuncs, S3Funcs } from "./data/storage/functions";
import MinioClient from "./data/storage/client";
import { BucketItem } from "minio";

export class VideoEvent {
  private static _create_bucket: boolean = true;
  private static _bucket: string; // bucket name
  private static _minio_client = MinioClient.getMinioClient;
  private static _s3_main_bucket: string = "cathpilot-minio-bucket-test"; // s3 main bucket containing all data
  private static _BUCKETS_REGION = process.env["BUCKETS_REGION"]!;
  private static _recordings_bucket_prefix = "recording";
  private static _recordings_file_prefix = "image";
  private static _minio_zipfile_prefix = "zipped";
  private static _frames_buffer_size_file_suffix = "frames_buffer_size";

  static async manageVideoRecording(req: StreamVideoRequest) {
    // Recording started
    if (AppContext.isRecording) {
      if (this._create_bucket) {
        // First stop the recording interactions momentarily until the bucket is created
        // Note: setting isRecording to false will start uploading stuff to minio and s3 and is incorrect, /n
        // the correct way to handle this is to set isRecording to `undefined`
        AppContext.isRecording = undefined;
        console.log("Recording started!");
        this._bucket = await MinioFuncs.create_bucket(
          this._minio_client,
          this._recordings_bucket_prefix,
          this._BUCKETS_REGION,
          true // note: if set to false, all files end up in the same bucket (i.e. _recordings_bucket_prefix + timestamp)
        );
        console.log("A bucket is created!");
        AppContext.isRecording = true;
        this._create_bucket = false;
      } else {
        MinioFuncs.create(
          this._minio_client,
          this._bucket,
          this._BUCKETS_REGION,
          this._recordings_file_prefix,
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
      this._create_bucket = true;
      let objects: Array<Buffer> = [];
      let files: Array<BucketItem> = [];
      let frames_buffer_size: Array<number> = [];

      // Stream data from the bucket
      // First list all the files
      const files_stream = MinioFuncs.list_objects(
        this._minio_client,
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
            this._minio_client,
            this._bucket,
            files[file_key].name
          )
            .createStream()
            .then((obj_stream) => {
              obj_stream.on("data", (obj: Buffer) => {
                objects.push(obj);
              });
              obj_stream.on("error", (err) => {
                console.error(err);
              });
            });
        }
        console.log("Minio data is read successfully!");

        // Compress the data
        const data_zipped = zlib.deflateRawSync(Buffer.concat(objects));
        console.log("Data is zipped successfully!");

        // Upload the compressed data to Minio
        MinioFuncs.create(
          this._minio_client,
          this._bucket,
          this._BUCKETS_REGION,
          this._minio_zipfile_prefix + "_" + this._bucket,
          data_zipped,
          false, // note: if set to false, each object will replace the old one because it has the same name
          data_zipped.length,
          {
            "Content-Type": "zip",
            recording: true,
          }
        );
        console.log("Zipped data uploaded to Minio!");

        // Upload the compressed data to S3
        MinioFuncs.mirror_to_s3(
          this._s3_main_bucket,
          this._bucket,
          data_zipped
        );
        console.log("Zipped data uploaded to S3!");

        // upload frame sizes to s3, this is necessary for knowing where frames end in the buffer
        objects.forEach((o) => {
          frames_buffer_size.push(o.length);
        });
        MinioFuncs.mirror_to_s3(
          this._s3_main_bucket,
          this._bucket + "_" + this._frames_buffer_size_file_suffix,
          frames_buffer_size.toString()
        );
        console.log("Frame buffer sizes uploaded to s3!");
      });
    }
  }

  static async import_video_from_s3(
    s3_zip_data: string
  ): Promise<Array<Buffer>> {
    // Grab the sister file containing the frames buffer size
    let frame_buffer_size_file = await S3Funcs.download_from_s3(
      this._s3_main_bucket,
      s3_zip_data + "_" + this._frames_buffer_size_file_suffix
    );

    let video_frames_buffer_size = frame_buffer_size_file
      .toString()
      .split(",")
      .map(Number);

    // Grab the zip file off s3
    let zip_file_buffer = await S3Funcs.download_from_s3(
      this._s3_main_bucket,
      s3_zip_data
    );

    // inflate
    const unzipped = zlib.inflateRawSync(zip_file_buffer);

    console.log("unzipped: ", unzipped);
    let start_index = 0;
    let unconcat: Array<Buffer> = [];
    for (let i = 0; i < video_frames_buffer_size.length; i++) {
      unconcat.push(
        unzipped.slice(start_index, video_frames_buffer_size[i] + start_index)
        // unzipped.slice(start_index, objects[i].length + start_index)
      );
      start_index += video_frames_buffer_size[i];
      // start_index += objects[i].length;
    }
    console.log(
      "unconcat which should match with original data: ",
      JSON.parse(JSON.stringify(unconcat))
    );

    return unconcat;
  }
}
