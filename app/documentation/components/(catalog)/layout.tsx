import { ComponentsDocsShell } from "@/components/development/ComponentsShell";

export default function DocumentationComponentsCatalogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ComponentsDocsShell>{children}</ComponentsDocsShell>;
}
