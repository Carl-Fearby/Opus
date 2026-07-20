export type ContactDetailsAction =
  | "add-note"
  | "add-task"
  | "call"
  | "edit"
  | "email"
  | "export-contact"
  | "log-activity"
  | "reset-password"
  | "schedule-meeting";

export type ContactCompany = {
  department?: string;
  employees?: string;
  industry?: string;
  jobTitle?: string;
  name: string;
  primary?: boolean;
  website?: string;
};

export type ContactDetailsContact = {
  avatarSrc?: string;
  companies: ContactCompany[];
  dateCreated: string;
  dateLastEdited: string;
  email: string;
  lastContact: string;
  leadStatus: string;
  mobile: string;
  name: string;
  owner: string;
  password?: string;
  phone: string;
  role: string;
  source: string;
  status: string;
  tags: string[];
};

export type ContactDetailsProps = {
  contact?: Partial<ContactDetailsContact>;
  isStaffRecord?: boolean;
  onAction?: (action: ContactDetailsAction) => void;
  onPasswordReset?: () => void;
  showActions?: boolean;
  showStatus?: boolean;
};

export function getPrimaryCompany(companies: ContactCompany[] = []): ContactCompany | undefined {
  return companies.find((company) => company.primary) ?? companies[0];
}

export function resolveContactDetailsContact(
  contact?: Partial<ContactDetailsContact>,
  defaults: ContactDetailsContact,
): ContactDetailsContact {
  return {
    ...defaults,
    ...contact,
    companies: contact?.companies?.length ? contact.companies : defaults.companies,
    tags: contact?.tags ?? defaults.tags,
  };
}
