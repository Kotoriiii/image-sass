"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { trpcClientReact } from "@/utils/api";

export default function StoragePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const { data: storages } = trpcClientReact.storages.listStorages.useQuery();

  const { data: apps } = trpcClientReact.apps.listApps.useQuery();

  const currentApp = apps?.filter((app) => app.id === id)[0];

  const utils = trpcClientReact.useUtils();

  const { mutate: changeStorage } =
    trpcClientReact.apps.changeStorage.useMutation({
      onSuccess: (data, { appId, storageId }) => {
        utils.apps.listApps.setData(void 0, (prev) => {
          if (!prev) {
            return prev;
          }

          return prev.map((p) =>
            p.id === appId ? { ...p, storageId: storageId } : p
          );
        });
      },
    });

  const { mutate: deleteStorage } =
    trpcClientReact.storages.deleteStorage.useMutation({
      onSuccess: (data, { storageId }) => {
        utils.storages.listStorages.setData(void 0, (prev) => {
          if (!prev) {
            return prev;
          }
          return prev.filter((p) => p.id !== storageId);
        });
      },
    });

  return (
    <div className="pt-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl mb-6">Storage</h1>
        <Button asChild>
          <Link href={`/dashboard/apps/${id}/setting/storage/new`}>
            <Plus></Plus>
          </Link>
        </Button>
      </div>
      <Accordion type="single" collapsible>
        {storages?.map((storage) => {
          return (
            <AccordionItem key={storage.id} value={String(storage.id)}>
              <AccordionTrigger
                className={
                  storage.id === currentApp?.storageId ? "text-destructive" : ""
                }
              >
                {storage.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-lg mb-6">
                  <div className="flex justify-between items-center">
                    <span>region</span>
                    <span>{storage.configuration.region}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>bucket</span>
                    <span>{storage.configuration.bucket}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>apiEndpoint</span>
                    <span>{storage.configuration.apiEndpoint}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    disabled={storage.id === currentApp?.storageId}
                    onClick={() => {
                      changeStorage({
                        appId: id,
                        storageId: storage.id,
                      });
                    }}
                  >
                    {storage.id === currentApp?.storageId ? "Used" : "Use"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteStorage({
                        storageId: storage.id,
                      });
                    }}
                  >
                    delete
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
