import { S3Client } from "@aws-sdk/client-s3";

class S3ClientInstance {
  private static map: Map<string, S3Client> = new Map();

  private constructor() {
    // 私有构造函数，防止外部实例化
  }

  public static getInstance(storageConfig: {
    apiEndpoint: string | undefined;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  }): S3Client {
    const key = JSON.stringify(storageConfig);

    if (this.map.has(key)) {
      return this.map.get(key)!;
    }

    const instance = new S3Client({
      endpoint: storageConfig.apiEndpoint,
      region: storageConfig.region,
      credentials: {
        accessKeyId: storageConfig.accessKeyId,
        secretAccessKey: storageConfig.secretAccessKey,
      },
    });

    this.map.set(key, instance);
    return instance;
  }
}

export default S3ClientInstance;
