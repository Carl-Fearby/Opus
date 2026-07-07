export const DOCUMENTATION_BASE_PATH = "/documentation";
export const COMPONENTS_BASE_PATH = `${DOCUMENTATION_BASE_PATH}/components`;
export const GUIDE_BASE_PATH = `${DOCUMENTATION_BASE_PATH}/guide`;
export const VERSION_BASE_PATH = `${DOCUMENTATION_BASE_PATH}/version`;

export function documentationPath() {
  return DOCUMENTATION_BASE_PATH;
}

export function guidePath(slug?: string) {
  if (!slug || slug === "index") {
    return GUIDE_BASE_PATH;
  }

  return `${GUIDE_BASE_PATH}/${slug}`;
}

export function isGuidePath(pathname: string) {
  return pathname === GUIDE_BASE_PATH || pathname.startsWith(`${GUIDE_BASE_PATH}/`);
}
