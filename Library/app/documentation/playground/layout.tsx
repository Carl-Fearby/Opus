import { ComponentsThemeProvider } from "@/components/development/ComponentsThemeProvider";

export default function PlaygroundLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ComponentsThemeProvider>
      <div style={{ height: "100dvh", overflow: "hidden" }}>{children}</div>
    </ComponentsThemeProvider>
  );
}
