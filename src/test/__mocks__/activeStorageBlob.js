export class BlobUpload {
  constructor({ file, directUploadData: { url, headers } }) {
    this.file = file;
    this.url = url;
    this.headers = headers;
  }

  async create(cb) {
    await new Promise((res) => setTimeout(() => res(), Math.random() * 3000));
    cb();
  }
}
