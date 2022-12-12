import { S3CloudClient } from "./client";
import * as Minio from "minio";
import {
  S3Client,
  S3ClientConfig,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import utility from "../../../shared/utilities";
import zlib from "node:zlib";

/****************************
 * MINIO
 ****************************/
export class MinioFuncs {
  // create a bucket
  public static async createBucket(
    client: Minio.Client,
    bucket_suffix: string,
    region: string,
    appendTime = false
  ): Promise<string> {
    // assemble the name
    const bucket = appendTime
      ? utility.appendTimeToFilename(bucket_suffix)
      : bucket_suffix;

    // Make the bucket if not exist
    let exist = await client.bucketExists(bucket);
    console.log(exist);

    if (!!!exist) {
      console.log("creating bucket: ", bucket);
      await client.makeBucket(bucket, region);
    }

    return bucket;
  }

  // create an object
  public static async create(
    client: Minio.Client,
    bucket: string,
    filename: string,
    data: Buffer | string,
    appendTime = false,
    size?: number,
    metadata?: Minio.ItemBucketMetadata
  ): Promise<Minio.UploadedObjectInfo> {
    // save the data
    return await client.putObject(
      bucket,
      appendTime ? utility.appendTimeToFilename(filename) : filename,
      data,
      size,
      metadata
    );
  }

  // read an object
  public static async read(
    client: Minio.Client,
    bucket: string,
    filename: string
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      let buffArray: Array<Buffer> = [];
      client.getObject(bucket, filename, (err, dataStream) => {
        if (err) {
          throw new Error("An error occured in downloading the file from Minio")
        }
        dataStream.on("data", function (chunk) {
          buffArray.push(chunk);
        });
        dataStream.on("end", function () {
          resolve(Buffer.concat(buffArray));
        });
        dataStream.on("error", function (err) {
          reject(err);
        });
      });
    });
  }

  // delete an object
  public static async delete(
    client: Minio.Client,
    bucket: string,
    filename: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return client.removeObject(bucket, filename, function (err) {
        if (err) {
          console.log("Unable to remove object: ", err);
          return reject(err);
        }
        console.log("Removed the object");
        return resolve(true);
      });
    });
  }

  // copy an object from minio to s3
  public static async mirrorToS3(
    bucket: string,
    filename: string,
    data: Buffer | string,
    s3: S3Client,
    contentType?: string
  ): Promise<void> {
    // Set the parameters
    let uploadParams = {
      Bucket: bucket,
      Key: filename,
      Body: data,
      ContentType: contentType
    };
    try {
      await s3.send(new PutObjectCommand(uploadParams)); 
    } catch(e) {
      if(e instanceof Error)
        throw new Error (e.message);
    }
  }

  // list objects in a bucket
  public static listObjects(
    client: Minio.Client,
    bucket: string,
    prefix?: string | undefined,
    recursive?: boolean | undefined
  ): Minio.BucketStream<Minio.BucketItem> {
    return client.listObjectsV2(bucket, prefix, recursive);
  }
}

/****************************
 * S3
 ****************************/
export class S3Funcs {
  public static async downloadFile(
    bucket: string,
    filename: string,
    s3: S3Client
  ): Promise<Buffer> {
    // Set the parameters
    let uploadParams = {
      Bucket: bucket,
      Key: filename,
    };
    const response = await s3.send(new GetObjectCommand(uploadParams));

    const stream = response.Body as Readable;
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.once("end", () => {
        // resolve
        resolve(Buffer.concat(chunks));
      });
      stream.once("error", reject);
    });

    /* NOTE: after switching to node version >= 17.5.0 we can simplify the code above by: --> 
    // const stream = response.Body as Readable;
    // return Buffer.concat(await stream.toArray());
    */
  }
}

/**************************
 * Helper Functions
 ****************************/
export class StorageHelper {
  public static async zipAndUpload(
    zipBucket: string,
    data: Array<Buffer>,
    zipFilename: string,
    buffSizeFilename: string,
    isDisk: Boolean,
    isCloud: Boolean,
    minioClient: Minio.Client,
    s3Client: S3Client
  ): Promise<Boolean> {
    // init
    let frames_buffer_size: Array<number> = [];
    // Compress the data
    const data_zipped = zlib.deflateRawSync(Buffer.concat(data));
    console.log("Data is zipped successfully!");

    // Frame buffer size array necessary for knowing where frames end in the buffer
    data.forEach((o) => {
      frames_buffer_size.push(o.length);
    });

    if (isDisk) {
      // Upload the compressed data to Minio
      MinioFuncs.create(
        minioClient,
        zipBucket,
        zipFilename,
        data_zipped,
        false, // note: if set to false, each object will replace the old one because it has the same name
        data_zipped.length,
        {
          "Content-Type": "application/gzip",
          recording: true,
        }
      );
      console.log("Zipped data uploaded to Minio!");

      // Upload frame sizes to minio
      MinioFuncs.create(
        minioClient,
        zipBucket,
        buffSizeFilename,
        frames_buffer_size.toString(),
        false // note: if set to false, each object will replace the old one because it has the same name
      );
      console.log("Frame buffer sizes uploaded to Minio!");
    }

    if (isCloud) {
      // Upload the compressed data to S3
      MinioFuncs.mirrorToS3(
        zipBucket, 
        zipFilename, 
        data_zipped, 
        s3Client,
        'application/gzip');
      console.log("Zipped data uploaded to S3!");

      // Upload frame sizes to S3
      MinioFuncs.mirrorToS3(
        zipBucket,
        buffSizeFilename,
        frames_buffer_size.toString(),
        s3Client,
        'application/gzip'
      );
      console.log("Frame buffer sizes uploaded to s3!");
    }

    return true;
  }

  /* Since it doesn't make sense to read off both cloud and disk, 
   * the idea here is that it tries to read off cloud if cloud toggle is on
   * otherwise it defaults to disk assuming disk toggle is on 
   * otherwise returns empty buffer */
  public static async unzipAndReturn(
    zipBucket: string,
    zipFilename: string,
    buffSizeFilename: string,
    isDisk: Boolean,
    isCloud: Boolean,
    minioClient: Minio.Client,
    s3Client: S3Client
  ): Promise<Array<Buffer>> {
    let zipFileBuffer: any;
    let frameBufferSizeFile: any;

    if (isCloud) {
      // s3
      console.log("Reading data from the cloud");
      // Grab the zip file off s3
      zipFileBuffer = await S3Funcs.downloadFile(
        zipBucket,
        zipFilename,
        s3Client
      );

      // Grab the corresponfing file containing the frames buffer size
      frameBufferSizeFile = await S3Funcs.downloadFile(
        zipBucket,
        buffSizeFilename,
        s3Client
      );
    } else if (isDisk) {
      // minio
      console.log("Reading data from the disk");
      // Grab the zip file off minio
      zipFileBuffer = await MinioFuncs.read(minioClient, zipBucket, zipFilename);

      // Grab the corresponfing file containing the frames buffer size
      frameBufferSizeFile = await MinioFuncs.read(minioClient, zipBucket, buffSizeFilename);
    } else {
      // both isCloud and isDisk === false!
      console.warn("Please select either disk or cloud to download data.");
      return [];
    }

    let video_frames_buffer_size = frameBufferSizeFile
      .toString()
      .split(",")
      .map(Number);

    // inflate
    const unzipped = zlib.inflateRawSync(zipFileBuffer);
    let start_index = 0;
    let unconcat: Array<Buffer> = [];
    for (let i = 0; i < video_frames_buffer_size.length; i++) {
      unconcat.push(
        unzipped.slice(start_index, video_frames_buffer_size[i] + start_index)
      );
      start_index += video_frames_buffer_size[i];
    }

    return unconcat;
  }

  public static async uploadSingleFile(
    bucket: string, 
    filename: string,
    data: any,
    meta: Minio.ItemBucketMetadata,
    isCloud: Boolean,
    isDisk: Boolean,
    minioClient: Minio.Client,
    s3Client: S3Client,
    contentType: string
  ){
    // TODO: Create a bucket if doesnt exist -- it's impossible in current case but has to be done to guarantee robustness
    
    // append timestamp to the filename to prevent overriding
    const filenameWithTimestamp = utility.appendTimeToFilename(filename);
    
    if(isDisk) {
    MinioFuncs.create(
      minioClient,
      bucket,
      filenameWithTimestamp,
      data,
      false,
      data.length,
      meta
    );
    }

    if(isCloud){
      // Upload frame sizes to S3
      MinioFuncs.mirrorToS3(
        bucket,
        filenameWithTimestamp,
        data,
        s3Client,
        contentType
      );
    }

    if(!isCloud && !isDisk) {
      // both isCloud and isDisk === false!
      throw new Error("Please select either disk or cloud to download data.");
    }
  }
}
