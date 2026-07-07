import { ComponentsThemeProvider } from "@/components/development/ComponentsThemeProvider";

export default function DocumentationComponentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ComponentsThemeProvider>{children}</ComponentsThemeProvider>;
}
