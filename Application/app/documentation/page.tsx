import { DocumentationHub } from "@/components/documentation/DocumentationContent";
import { getAllSlugs } from "@/lib/controls/registry";

export default function DocumentationPage() {
  return <DocumentationHub catalogueCount={getAllSlugs().length} />;
}
