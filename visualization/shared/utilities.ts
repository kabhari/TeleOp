export default class utility {
  public static appendTimeToFilename(filename: string) {
    let date = new Date();
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - offset * 60 * 1000);
    return (
      filename +
      "-" +
      date.toISOString().toLowerCase().replaceAll(/[:\.]/g, "-")
    );
  }
}
