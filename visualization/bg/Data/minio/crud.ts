import * as Minio from "minio";
import { OutgoingHttpHeaders } from "http";
import Stream from "stream";

interface ObjectFromStorage {
  createStream(): Promise<Stream>;
  headers(): Promise<OutgoingHttpHeaders>;
}

export default class MinioCrud {
  /* public methods */
  // create an object
  public static async create(
    client: Minio.Client,
    bucket: string,
    region: string,
    filename: string,
    data: string,
    appendTime = false
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // Make the bucket if not exist
      let exist = client.bucketExists(bucket);
      if (!!!exist) {
        client.makeBucket(bucket, region);
      }

      // save the data
      return client.putObject(
        bucket,
        appendTime ? new this().appendTimeToFilename(filename) : filename,
        data,
        function (err, str: string) {
          if (err) {
            console.log("Unable to save object", err);
            return reject(err);
          }
          console.log("Saved the object");
          return resolve(str);
        }
      );
    });
  }

  // read an object
  public static read(
    client: Minio.Client,
    bucket: string,
    filename: string
  ): ObjectFromStorage {
    return {
      createStream: () => {
        return new Promise((resolve, reject) => {
          return client.getObject(
            bucket,
            filename,
            (err: any, dataStream: Stream) => {
              if (err) {
                console.error(err);
                return reject("Encountered Error while getting file");
              }
              return resolve(dataStream);
            }
          );
        });
      },
      headers: async () => {
        const stat: any = await new Promise((resolve, reject) => {
          return client.statObject(bucket, filename, (err: any, stat: any) => {
            if (err) {
              reject(err);
            }
            return resolve(stat);
          });
        });

        return {
          "Content-Type": stat.metaData["content-type"],
          "Content-Encoding": stat.metaData["content-encoding"],
          "Cache-Control": stat.metaData["cache-control"],
          "Content-Length": stat.size,
          "Record-ID": stat.metaData["record-id"],
        };
      },
    };
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

  /* private methods */
  private appendTimeToFilename(filename: string) {
    let date = new Date();
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - offset * 60 * 1000);
    return filename + "_" + date.toISOString().replaceAll(/[:\.]/g, "_");
  }
}
