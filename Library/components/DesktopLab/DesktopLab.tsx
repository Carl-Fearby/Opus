"use client";

import { Desktop, type DesktopWindowItem } from "@/components/Desktop";
import { Badge } from "@/components/Badge";
import { CatalogIcon } from "@/components/CatalogIcon";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Heading } from "@/components/Heading";
import { Text } from "@/components/Text";
import { demoVideoTracks } from "@/lib/controls/videoDemoData";
import styles from "./DesktopLab.module.css";

export type DesktopLabProps = {
  dockAutoHide?: boolean;
  dockSize?: number;
  onDockSizeChange?: (size: number) => void;
  onAction?: (action: string) => void;
};

function ExplorerContent({ onAction }: { onAction?: (action: string) => void }) {
  return (
    <div className={styles.explorer}>
      <aside>
        {["Home", "Documents", "Pictures", "Shared"].map((label) => (
          <button key={label} onClick={() => onAction?.(`Open ${label}`)} type="button"><CatalogIcon iconName="folder" />{label}</button>
        ))}
      </aside>
      <main>
        <Heading level={2} size={200}>Recent documents</Heading>
        <div className={styles.files}>
          {["CRM brief.pdf", "Q3 forecast.xlsx", "Brand assets", "Customer notes.docx"].map((name, index) => (
            <button key={name} onClick={() => onAction?.(`Open ${name}`)} type="button">
              <CatalogIcon iconName={index === 2 ? "folder" : "file-lines"} />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

function ActivityContent({ onAction }: { onAction?: (action: string) => void }) {
  return (
    <div className={styles.activity}>
      <Heading level={2} size={200}>Activity</Heading>
      {[
        ["Emma Davis", "Proposal approved", "success"],
        ["Michael Brown", "New task assigned", "accent"],
        ["Olivia Wilson", "Invoice needs review", "warning"],
      ].map(([name, detail, tone]) => (
        <button key={name} onClick={() => onAction?.(`Open activity for ${name}`)} type="button">
          <CatalogIcon iconName="bell" />
          <span><strong>{name}</strong><small>{detail}</small></span>
          <Badge label="Open" size="sm" tone={tone as "success" | "accent" | "warning"} />
        </button>
      ))}
    </div>
  );
}

function SettingsContent({ onAction }: { onAction?: (action: string) => void }) {
  const settings = [
    { detail: "Appearance, colour and wallpaper", icon: "palette", id: "appearance", label: "Appearance" },
    { detail: "Alerts, sounds and badges", icon: "bell", id: "notifications", label: "Notifications" },
    { detail: "Privacy and account protection", icon: "shield-halved", id: "privacy", label: "Privacy & Security" },
    { detail: "Keyboard, display and accessibility", icon: "universal-access", id: "accessibility", label: "Accessibility" },
  ];

  return (
    <div className={styles.settings}>
      <Heading level={2} size={200}>Settings</Heading>
      <Text>Choose an area to configure your workspace.</Text>
      <div className={styles.settingsList}>
        {settings.map((setting) => (
          <button
            key={setting.id}
            onClick={() => onAction?.(`Open ${setting.label} settings`)}
            type="button"
          >
            <CatalogIcon iconName={setting.icon} />
            <span>
              <strong>{setting.label}</strong>
              <small>{setting.detail}</small>
            </span>
            <CatalogIcon iconName="chevron-right" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ContactsContent({ onAction }: { onAction?: (action: string) => void }) {
  const contacts = [
    { company: "Acme Ltd", initials: "ED", name: "Emma Davis", status: "Online" },
    { company: "Initech", initials: "MB", name: "Michael Brown", status: "In a meeting" },
    { company: "Global Corp", initials: "OW", name: "Olivia Wilson", status: "Away" },
    { company: "Northstar", initials: "NP", name: "Noah Patel", status: "Online" },
  ];

  return (
    <div className={styles.contacts}>
      <header>
        <div>
          <Heading level={2} size={200}>Contacts</Heading>
          <Text>Your recent CRM contacts.</Text>
        </div>
        <button onClick={() => onAction?.("Add contact")} type="button">
          <CatalogIcon iconName="plus" />
          Add contact
        </button>
      </header>
      <div className={styles.contactList}>
        {contacts.map((contact) => (
          <button
            key={contact.name}
            onClick={() => onAction?.(`Open contact ${contact.name}`)}
            type="button"
          >
            <span className={styles.contactAvatar}>{contact.initials}</span>
            <span>
              <strong>{contact.name}</strong>
              <small>{contact.company}</small>
            </span>
            <small>{contact.status}</small>
            <CatalogIcon iconName="chevron-right" />
          </button>
        ))}
      </div>
    </div>
  );
}

function VideoContent({ onAction }: { onAction?: (action: string) => void }) {
  return (
    <div className={styles.video}>
      <VideoPlayer
        edgeToEdge
        onAction={(action) => onAction?.(`Video ${action}`)}
        showShare
        showTitle
        tracks={demoVideoTracks}
      />
    </div>
  );
}

export function DesktopLab({
  dockAutoHide = false,
  dockSize = 40,
  onDockSizeChange,
  onAction,
}: DesktopLabProps) {
  const apps = [
    {
      content: <ExplorerContent onAction={onAction} />,
      dock: true,
      icon: "folder-open",
      id: "files",
      label: "Documents",
      open: true,
      rect: { height: 390, width: 560, x: 120, y: 54 },
      shortcut: true,
      tone: "blue",
      zIndex: 2,
    },
    {
      content: <ActivityContent onAction={onAction} />,
      dock: true,
      icon: "bell",
      id: "activity",
      label: "Notifications",
      open: true,
      rect: { height: 290, width: 330, x: 410, y: 225 },
      shortcut: false,
      zIndex: 3,
    },
    {
      content: <SettingsContent onAction={onAction} />,
      dock: true,
      icon: "gear",
      id: "settings",
      label: "Settings",
      open: false,
      rect: { height: 360, width: 470, x: 210, y: 92 },
      shortcut: true,
      tone: "blue",
      zIndex: 4,
    },
    {
      content: <ContactsContent onAction={onAction} />,
      dock: true,
      icon: "users",
      id: "contacts",
      label: "Contacts",
      open: false,
      rect: { height: 380, width: 500, x: 170, y: 74 },
      shortcut: true,
      tone: "blue",
      zIndex: 5,
    },
    {
      content: <VideoContent onAction={onAction} />,
      dock: true,
      icon: "circle-play",
      id: "video",
      label: "Video Player",
      open: false,
      rect: { height: 430, width: 650, x: 195, y: 88 },
      shortcut: true,
      tone: "blue",
      zIndex: 6,
    },
  ];
  const windows: DesktopWindowItem[] = apps.map((app) => ({
    content: app.content,
    icon: app.icon,
    id: app.id,
    open: app.open,
    rect: app.rect,
    title: app.label,
    tone: app.tone as "blue" | "purple" | undefined,
    zIndex: app.zIndex,
  }));

  return (
    <Desktop
      dockAutoHide={dockAutoHide}
      dockItems={apps.filter((app) => app.dock).map(({ icon, id, label, tone }) => ({
        icon,
        id,
        label,
        tone: tone as "blue" | "purple" | undefined,
      }))}
      onAction={(action, id) => onAction?.(`${action} ${id}`)}
      onDockSizeChange={onDockSizeChange}
      dockSize={dockSize}
      shortcuts={apps.filter((app) => app.shortcut).map(({ icon, id, label, tone }) => ({
        icon,
        id,
        label,
        tone: tone as "blue" | "purple" | undefined,
      }))}
      wallpaper="aurora"
      windows={windows}
    />
  );
}
