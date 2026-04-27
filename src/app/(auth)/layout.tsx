export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
      {children}
    </div>
  );
}
