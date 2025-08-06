export default function SigninLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-96 min-h-64 border border-black rounded container py-5 pl-8 pr-8 ml-auto mr-auto">
        {children}
      </div>
    </div>
  );
}
