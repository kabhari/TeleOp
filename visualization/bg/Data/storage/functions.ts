import * as Minio from "minio";
import { OutgoingHttpHeaders } from "http";
import {
  S3Client,
  S3ClientConfig,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import Stream, { Readable } from "stream";
import utility from "../../../shared/utilities";

interface ObjectFromStorage {
  createStream(): Promise<Stream>;
  headers(): Promise<OutgoingHttpHeaders>;
}

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
    region: string,
    filename: string,
    data: Buffer | string,
    appendTime = false,
    size?: number,
    metadata?: Minio.ItemBucketMetadata
  ): Promise<any> {
    // save the data
    return await client.putObject(
      bucket,
      appendTime ? utility.appendTimeToFilename(filename) : filename,
      data,
      size,
      metadata
      // function (err, str: string) {
      //   if (err) {
      //     console.log("Unable to save object", err);
      //     return reject(err);
      //   }
      //   console.log("Saved the object");
      //   return resolve(str);
      // }
    );
    // });
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
          return console.log(err);
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
    data: Buffer | string
  ): Promise<boolean> {
    // Set the region
    const BUCKETS_REGION = process.env["BUCKETS_REGION"]!;

    const s3Configuration: S3ClientConfig = { region: BUCKETS_REGION };
    // Set the parameters
    let uploadParams = {
      Bucket: bucket,
      Key: filename,
      Body: data,
    };
    const s3 = new S3Client(s3Configuration);
    const success = await s3.send(new PutObjectCommand(uploadParams));

    // close connection
    s3.destroy();
    return true; // need refactoring to return based on `success`
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
    filename: string
  ): Promise<Buffer> {
    // Set the region
    const BUCKETS_REGION = process.env["BUCKETS_REGION"]!;

    const s3Configuration: S3ClientConfig = { region: BUCKETS_REGION };
    // Set the parameters
    let uploadParams = {
      Bucket: bucket,
      Key: filename,
    };
    const s3 = new S3Client(s3Configuration);
    const response = await s3.send(new GetObjectCommand(uploadParams));

    const stream = response.Body as Readable;
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.once("end", () => {
        // shutdown s3
        s3.destroy();
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
