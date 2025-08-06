"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { type S3StorageConfiguration } from "@/server/db/schema";
import { trpcClientReact } from "@/utils/api";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";

export default function CreateNewStorageAPI() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<S3StorageConfiguration & { name: string }>();

  const { mutate } = trpcClientReact.storages.createStorage.useMutation();

  const onSubmit: SubmitHandler<
    S3StorageConfiguration & { name: string }
  > = data => {
    mutate(data);
    router.push(`/dashboard/apps/${id}/setting/storage`);
  };

  return (
    <div className="container pt-10 pl-8 pr-8 ml-auto mr-auto">
      <h1 className="text-3xl mb-6 max-w-md mx-auto">Create Storage</h1>
      <form
        className="flex flex-col gap-4 max-w-md mx-auto"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <Label>Name</Label>
          <Input
            {...register("name", {
              required: "Name is required",
            })}
          ></Input>
          <span className="text-red-500">{errors.name?.message}</span>
        </div>

        <div>
          <Label>Bucket</Label>
          <Input
            {...register("bucket", {
              required: "Bucket is required",
            })}
          ></Input>
          <span className="text-red-500">{errors.bucket?.message}</span>
        </div>

        <div>
          <Label>AccessKeyId</Label>
          <Input
            {...register("accessKeyId", {
              required: "accessKeyId is required",
            })}
          ></Input>
          <span className="text-red-500">{errors.accessKeyId?.message}</span>
        </div>

        <div>
          <Label>SecretAccessKey</Label>
          <Input
            type="password"
            {...register("secretAccessKey", {
              required: "secretAccessKey is required",
            })}
          ></Input>
          <span className="text-red-500">
            {errors.secretAccessKey?.message}
          </span>
        </div>

        <div>
          <Label>Region</Label>
          <Input
            {...register("region", {
              required: "region is required",
            })}
          ></Input>
          <span className="text-red-500">{errors.region?.message}</span>
        </div>

        <div>
          <Label>ApiEndpoint</Label>
          <Input {...register("apiEndpoint")}></Input>
          <span className="text-red-500">{errors.apiEndpoint?.message}</span>
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
