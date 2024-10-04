import { S3Client } from "@aws-sdk/client-s3";

class S3ClientSingleton {
  private static instance: S3Client | null = null;

  private constructor() {
    // 私有构造函数，防止外部实例化
  }

  public static getInstance(storageConfig: {
    apiEndpoint: string | undefined;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  }): S3Client {
    if (!S3ClientSingleton.instance) {
      S3ClientSingleton.instance = new S3Client({
        endpoint: storageConfig.apiEndpoint,
        region: storageConfig.region,
        credentials: {
          accessKeyId: storageConfig.accessKeyId,
          secretAccessKey: storageConfig.secretAccessKey,
        },
      });
    }
    return S3ClientSingleton.instance;
  }
}

export default S3ClientSingleton;
