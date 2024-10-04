"use client";

import { toast } from "sonner";
import Link from "next/link";
import { GithubOutlined, GitlabOutlined } from "@ant-design/icons";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";

const formSchema = z.object({
  email: z.string().email({
    message: "not vaild email",
  }),
  password: z.string().min(1, {
    message: "cannot be empty",
  }),
});

export default function Signin() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast("暂时未实现此功能,请用第三方登录");
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Link href="/auth/register">
            <Button
              size="lg"
              variant="link"
              className="w-full mt-2"
              type="button"
            >
              Don&apos;t have account?
            </Button>
          </Link>
          <Button className="w-full" type="submit">
            Submit
          </Button>
        </form>
      </Form>
      <div className="flex items-center py-3">
        <div className="flex-grow border-t border-gray-300" />
        <span className="px-3 text-gray-500">or</span>
        <div className="flex-grow border-t border-gray-300" />
      </div>
      <div className="flex flex-col justify-center items-center gap-2">
        <Button
          size="lg"
          variant="ghost"
          onClick={() =>
            signIn("gitlab", {
              callbackUrl:
                process.env.NODE_ENV === "production"
                  ? `${process.env.NEXT_PUBLIC_BASE_PATH}/dashboard`
                  : "/dashboard",
            })
          }
        >
          <GitlabOutlined />
          <span className="ml-2">Sign with Gitlab</span>
        </Button>
        <Button
          size="lg"
          variant="ghost"
          onClick={() =>
            signIn("github", {
              callbackUrl:
                process.env.NODE_ENV === "production"
                  ? `${process.env.NEXT_PUBLIC_BASE_PATH}/dashboard`
                  : "/dashboard",
            })
          }
        >
          <GithubOutlined />
          <span className="ml-2">Sign with GitHub</span>
        </Button>
      </div>
    </>
  );
}
