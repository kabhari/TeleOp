import * as Minio from "minio";

export default class MinioClient {
  private static _minio_client: MinioClient;
  static URL_MINIO: string;
  static PORT_MINIO: number;
  static MINIO_ACCESS_KEY: string;
  static MINIO_SECRET_KEY: string;

  private constructor() {
    if (
      process.env["MINIO_HOST"] &&
      process.env["MINIO_PORT"] &&
      process.env["MINIO_ACCESS_KEY"] &&
      process.env["MINIO_SECRET_KEY"]
    ) {
      MinioClient.URL_MINIO = process.env["MINIO_HOST"];
      MinioClient.PORT_MINIO = +process.env["MINIO_PORT"];
      MinioClient.MINIO_ACCESS_KEY = process.env["MINIO_ACCESS_KEY"];
      MinioClient.MINIO_SECRET_KEY = process.env["MINIO_SECRET_KEY"];
    } else {
      console.error(
        "Please check the .env file to ensure it includes the Minio host, access key, as well as secret key",
        process.env
      );
      process.exit(1);
    }

    MinioClient._minio_client = new Minio.Client({
      endPoint: MinioClient.URL_MINIO,
      port: MinioClient.PORT_MINIO,
      accessKey: MinioClient.MINIO_ACCESS_KEY,
      secretKey: MinioClient.MINIO_SECRET_KEY,
      useSSL: false,
    });
  }

  // Setter
  public static setMinioClient(minioClient: MinioClient) {
    MinioClient._minio_client = minioClient;
  }

  // Getter
  public static getMinioClient(): MinioClient {
    return MinioClient._minio_client;
  }

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): MinioClient {
    if (MinioClient._minio_client == undefined) {
      MinioClient._minio_client = new MinioClient();
    }
    return MinioClient._minio_client;
  }
}
