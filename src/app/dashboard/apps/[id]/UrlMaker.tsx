/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Silder";
import copy from "copy-to-clipboard";
import { useState } from "react";
import { toast } from "sonner";

export function UrlMaker({ id }: { id: string }) {
  const [width, setWidth] = useState(100);

  const [rotate, setRotate] = useState(0);

  const [url, setUrl] = useState(
    `${
      process.env.NEXT_PUBLIC_BASE_PATH || ""
    }/image/${id}?width=${width}&rotate=${rotate}`
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Rotate:</span>
          <Slider
            className="relative flex h-5 w-[200px] touch-none select-none items-center"
            value={[rotate]}
            onValueChange={(v) => setRotate(v[0] ?? 0)}
            max={180}
            min={-180}
            step={5}
          ></Slider>
        </div>
        <div>
          <label htmlFor="widthInput" className="mr-2">
            {`Width:`}
          </label>
          <input
            id="widthInput"
            type="number"
            value={width}
            max={2000}
            min={100}
            className="input input-bordered input-sm"
            onChange={(e) => setWidth(Number(e.target.value))}
          />
        </div>
        <Button
          onClick={() =>
            setUrl(
              `${
                process.env.NEXT_PUBLIC_BASE_PATH || ""
              }/image/${id}?width=${width}&rotate=${rotate}`
            )
          }
        >
          Make
        </Button>
      </div>
      <div>
        <div className="flex justify-center items-center p-2">
          <img
            src={url}
            alt="generate url"
            className=" max-w-full max-h-[60vh]"
          ></img>
        </div>
      </div>
      <div className="flex justify-between items-center gap-2">
        <Input
          value={`${process.env.NEXT_PUBLIC_SITE_URL}${url}`}
          readOnly
        ></Input>
        <Button
          onClick={() => {
            copy(`${process.env.NEXT_PUBLIC_SITE_URL}${url}`);
            toast("Copy Succeed!");
          }}
        >
          Copy
        </Button>
      </div>
    </div>
  );
}
