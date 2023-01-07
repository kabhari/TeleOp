import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import * as Minio from "minio";

export class MinioClient {
  private static _minio_client: Minio.Client;
  private URL_MINIO: string;
  private PORT_MINIO: number;
  private MINIO_ACCESS_KEY: string;
  private MINIO_SECRET_KEY: string;

  private constructor() {
    if (
      process.env["MINIO_HOST"] &&
      process.env["MINIO_PORT"] &&
      process.env["MINIO_ACCESS_KEY"] &&
      process.env["MINIO_SECRET_KEY"]
    ) {
      this.URL_MINIO = process.env["MINIO_HOST"];
      this.PORT_MINIO = +process.env["MINIO_PORT"];
      this.MINIO_ACCESS_KEY = process.env["MINIO_ACCESS_KEY"];
      this.MINIO_SECRET_KEY = process.env["MINIO_SECRET_KEY"];
    } else {
      console.error(
        "Please check the .env file (minio) to ensure it includes the Minio host, access key, as well as secret key",
        process.env
      );
      process.exit(1);
    }

    MinioClient._minio_client = new Minio.Client({
      endPoint: this.URL_MINIO,
      port: this.PORT_MINIO,
      accessKey: this.MINIO_ACCESS_KEY,
      secretKey: this.MINIO_SECRET_KEY,
      useSSL: false,
    });
  }

  public static get getMinioClient(): Minio.Client {
    if (!!!this._minio_client) {
      new MinioClient();
    }

    return this._minio_client;
  }
}

export class S3CloudClient {
  private static _s3_client: S3Client;
  private BUCKETS_REGION: string;
  private AWS_ACCESS_KEY_ID: string;
  private AWS_SECRET_ACCESS_KEY: string;

  private constructor() {
    if (
      process.env["BUCKETS_REGION"] &&
      process.env["AWS_ACCESS_KEY_ID"] &&
      process.env["AWS_SECRET_ACCESS_KEY"]
    ) {
      this.BUCKETS_REGION = process.env["BUCKETS_REGION"];
      this.AWS_ACCESS_KEY_ID = process.env["AWS_ACCESS_KEY_ID"];
      this.AWS_SECRET_ACCESS_KEY = process.env["AWS_SECRET_ACCESS_KEY"];
    } else {
      console.error(
        "Please check the .env file (s3) to ensure it includes the Minio host, access key, as well as secret key",
        process.env
      );
      process.exit(1);
    }
    // TODO AWS KEY AND SECRET
    const s3Configuration: S3ClientConfig = { region: this.BUCKETS_REGION };
    S3CloudClient._s3_client = new S3Client(s3Configuration);
  }

  public static get getS3Client(): S3Client {
    if (!!!this._s3_client) {
      new S3CloudClient();
    }

    return this._s3_client;
  }
}
