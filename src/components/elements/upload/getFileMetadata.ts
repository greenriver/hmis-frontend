import { FileChecksum } from '@rails/activestorage/src/file_checksum';

import { DirectUploadInput } from '@/types/gqlTypes';

function calculateChecksum(file: File) {
  return new Promise((resolve, reject) => {
    FileChecksum.create(file, (error: Error, checksum: string) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(checksum);
    });
  });
}

export const getFileMetadata = (file: File): Promise<DirectUploadInput> => {
  return new Promise((resolve) => {
    calculateChecksum(file).then((checksum) => {
      resolve({
        checksum,
        filename: file.name,
        contentType: file.type,
        byteSize: file.size,
      } as DirectUploadInput);
    });
  });
};
