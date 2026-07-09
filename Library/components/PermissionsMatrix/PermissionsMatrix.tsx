"use client";

import styles from "./PermissionsMatrix.module.css";

export type PermissionLevel = "none" | "read" | "write" | "admin";

export type PermissionsMatrixProps = {
  onChange: (role: string, resource: string, level: PermissionLevel) => void;
  permissions: Record<string, Record<string, PermissionLevel>>;
  resources: string[];
  roles: string[];
};

const levels: PermissionLevel[] = ["none", "read", "write", "admin"];

export function PermissionsMatrix({ onChange, permissions, resources, roles }: PermissionsMatrixProps) {
  return (
    <div className={styles.root} aria-label="Permissions matrix">
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.corner}>Role / Resource</th>
              {resources.map((resource) => (
                <th className={styles.head} key={resource}>
                  {resource}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role}>
                <th className={styles.rowHead} scope="row">
                  {role}
                </th>
                {resources.map((resource) => {
                  const level = permissions[role]?.[resource] ?? "none";
                  return (
                    <td className={styles.cell} key={`${role}-${resource}`}>
                      <select
                        aria-label={`${role} access to ${resource}`}
                        className={styles.select}
                        data-level={level}
                        onChange={(event) => onChange(role, resource, event.target.value as PermissionLevel)}
                        value={level}
                      >
                        {levels.map((entry) => (
                          <option key={entry} value={entry}>
                            {entry}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
