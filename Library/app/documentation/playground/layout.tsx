import { ComponentsThemeProvider } from "@/components/development/ComponentsThemeProvider";

export default function PlaygroundLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ComponentsThemeProvider>{children}</ComponentsThemeProvider>;
}
