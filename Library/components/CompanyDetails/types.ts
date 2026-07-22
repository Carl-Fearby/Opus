import type { TabsVariant } from "@/components/fields/types";

export type CompanyDetailsAction =
  | "add-contact"
  | "add-note"
  | "add-task"
  | "call"
  | "edit"
  | "email"
  | "export-company"
  | "log-activity"
  | "schedule-meeting"
  | "visit-website";

export type CompanyContactPerson = {
  avatarSrc?: string;
  email?: string;
  id: string;
  jobTitle?: string;
  name: string;
  phone?: string;
  primary?: boolean;
  role?: string;
};

export type CompanyBranch = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  id: string;
  label: string;
  phone?: string;
  postcode: string;
  primary?: boolean;
  type?: string;
};

export type CompanyDetailsCompany = {
  annualRevenue?: string;
  branches: CompanyBranch[];
  dateCreated: string;
  dateLastEdited: string;
  email: string;
  employees: string;
  industry: string;
  logoSrc?: string;
  name: string;
  owner: string;
  phone: string;
  source: string;
  status: string;
  tags: string[];
  type: string;
  website: string;
};

export type CompanyDetailsProps = {
  company?: Partial<CompanyDetailsCompany>;
  contacts?: CompanyContactPerson[];
  onAction?: (action: CompanyDetailsAction) => void;
  showActions?: boolean;
  showStatus?: boolean;
  tabsVariant?: TabsVariant;
};

export function getPrimaryBranch(branches: CompanyBranch[]): CompanyBranch | undefined {
  return branches.find((branch) => branch.primary) ?? branches[0];
}

export function resolveCompanyDetailsCompany(
  company: Partial<CompanyDetailsCompany> | undefined,
  defaults: CompanyDetailsCompany,
): CompanyDetailsCompany {
  return {
    ...defaults,
    ...company,
    branches: company?.branches ?? defaults.branches,
    tags: company?.tags ?? defaults.tags,
  };
}
