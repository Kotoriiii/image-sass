"use client";

import { Button } from "@/components/ui/Button";

export default function CreateAppError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  if (error.message.includes("App name already exists")) {
    return (
      <div>
        <div className=" w-64 mx-auto p-8 flex justify-center items-center flex-col">
          <span>App name already exists</span>
          <Button onClick={reset}>Reset</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className=" w-64 mx-auto p-8 flex justify-center items-center flex-col">
        <span>Create App Failed</span>
        <Button onClick={reset}>Reset</Button>
      </div>
    </div>
  );
}
