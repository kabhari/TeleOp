import * as Minio from "minio";

export default class MinioClient {
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
        "Please check the .env file to ensure it includes the Minio host, access key, as well as secret key",
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
