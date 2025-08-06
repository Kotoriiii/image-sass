import { redirect } from "next/navigation";
import { getServerSession } from "@/server/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { ThemeProvider } from "./apps/ThemeProvider";
import { ThemeToggle } from "./apps/ThemeToggle";
import SignOutButton from "./SignOutButton";

export default async function DashboardLayout({
  children,
  nav,
}: Readonly<{
  children: React.ReactNode;
  nav: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <ThemeProvider>
      <div className="h-screen">
        <nav className="h-[80px] border-b relative">
          <div className="container flex gap-2 justify-end items-center h-full">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src={session.user.image!} />
                  <AvatarFallback>
                    {session.user.name?.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <SignOutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="absolute h-full top-0 left-1/2 -translate-x-1/2 flex justify-center items-center">
            {nav}
          </div>
        </nav>
        <main className="h-[calc(100%-80px)]">{children}</main>
      </div>
    </ThemeProvider>
  );
}
