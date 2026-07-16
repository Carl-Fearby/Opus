#!/usr/bin/env bash
#
# deploy.sh — bump, build, publish opus-react, update Application/package.json,
#             sync Application docs/catalog from Library, reinstall from npm,
#             then commit and push to git.
#
# Usage:
#   ./deploy.sh                 # bump patch (0.2.12 -> 0.2.13), build, publish, update app
#   ./deploy.sh patch|minor|major
#   ./deploy.sh 0.3.0           # publish an explicit version
#   ./deploy.sh --sync-app-only # local only: sync Application from Library (no publish)
#
# Flags:
#   --skip-app        Don't update / reinstall / sync the Application
#   --skip-git        Don't commit or push to git after a successful deploy
#   --dry-run         Bump + build only; do not publish, update app, or push git
#   --sync-app-only   Sync Application catalog/previews from Library (no npm publish)
#   --otp <code>      npm 2FA one-time password (only needed without NPM_TOKEN / .npmrc)
#
# Auth (no OTP prompt when configured):
#   - NPM_TOKEN env var, or
#   - .npmrc in the repo root (gitignored — see .npmrc.example)
#
# Notes:
#   - Run this from anywhere; paths are resolved relative to the script location.

set -euo pipefail

# ---- resolve paths -----------------------------------------------------------
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_DIR="$ROOT_DIR/Library/packages/opus-react"
APP_DIR="$ROOT_DIR/Application"
PKG_NAME="opus-react"

# ---- colours -----------------------------------------------------------------
if [[ -t 1 ]]; then
  BOLD=$'\033[1m'; DIM=$'\033[2m'; RED=$'\033[31m'; GREEN=$'\033[32m'
  YELLOW=$'\033[33m'; BLUE=$'\033[34m'; RESET=$'\033[0m'
else
  BOLD=""; DIM=""; RED=""; GREEN=""; YELLOW=""; BLUE=""; RESET=""
fi

step() { printf "\n${BOLD}${BLUE}==>${RESET} ${BOLD}%s${RESET}\n" "$1"; }
info() { printf "    ${DIM}%s${RESET}\n" "$1"; }
ok()   { printf "    ${GREEN}✓ %s${RESET}\n" "$1"; }
warn() { printf "    ${YELLOW}! %s${RESET}\n" "$1"; }
die()  { printf "\n${RED}✗ %s${RESET}\n" "$1" >&2; exit 1; }

load_npm_token() {
  if [[ -n "${NPM_TOKEN:-}" ]]; then
    return 0
  fi

  if [[ -f "$ROOT_DIR/.npmrc" ]]; then
    local token
    token="$(grep -E '^//registry\.npmjs\.org/:_authToken=' "$ROOT_DIR/.npmrc" | head -n1 | cut -d= -f2- | tr -d '[:space:]')"
    if [[ -n "$token" && "$token" != '\${NPM_TOKEN}' ]]; then
      export NPM_TOKEN="$token"
    fi
  fi
}

has_npm_token() {
  [[ -n "${NPM_TOKEN:-}" ]]
}

sync_application_from_library() {
  [[ -d "$APP_DIR" ]] || die "Application directory not found: ${APP_DIR}"

  step "Syncing Application from Library"
  cd "$APP_DIR"

  if [[ -f "$APP_DIR/scripts/sync-from-library.mjs" ]]; then
    node scripts/sync-from-library.mjs
    ok "Catalog, previews, and component links synced"
  else
    die "Missing ${APP_DIR}/scripts/sync-from-library.mjs"
  fi

  if npm run sync-versions >/dev/null; then
    ok "Version log synced"
  else
    die "Failed to sync version log into Application"
  fi
}

stage_application_sync_files() {
  local paths=(
    "Application/lib/controls"
    "Application/lib/ui"
    "Application/lib/playground/externalPreviewStorage.ts"
    "Application/lib/emojiCatalog.generated.ts"
    "Application/lib/emojiCatalog.ts"
    "Application/lib/emojiCatalog.types.ts"
    "Application/lib/emojiRecentStorage.ts"
    "Application/lib/theme/opusThemeTokens.ts"
    "Application/lib/theme/useStoredTheme.ts"
    "Application/lib/documentation/breadcrumbs.ts"
    "Application/lib/documentation/versionLog.ts"
    "Application/app/preview-theme.css"
    "Application/components/control-detail"
    "Application/components/development"
    "Application/scripts/sync-from-library.mjs"
  )

  for path in "${paths[@]}"; do
    if [[ -e "$ROOT_DIR/$path" ]]; then
      git add "$path"
    fi
  done
}

# ---- parse args --------------------------------------------------------------
BUMP="patch"
SKIP_APP=false
SKIP_GIT=false
DRY_RUN=false
SYNC_APP_ONLY=false
OTP=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    patch|minor|major) BUMP="$1"; shift ;;
    [0-9]*.[0-9]*.[0-9]*) BUMP="$1"; shift ;;
    --skip-app) SKIP_APP=true; shift ;;
    --skip-git) SKIP_GIT=true; shift ;;
    --dry-run)  DRY_RUN=true; shift ;;
    --sync-app-only) SYNC_APP_ONLY=true; shift ;;
    --otp) OTP="${2:-}"; [[ -z "$OTP" ]] && die "--otp requires a value"; shift 2 ;;
    -h|--help)
      sed -n '2,22p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) die "Unknown argument: $1" ;;
  esac
done

[[ -d "$PKG_DIR" ]] || die "Package directory not found: $PKG_DIR"
command -v npm >/dev/null 2>&1 || die "npm is not installed or not on PATH"
command -v git >/dev/null 2>&1 || die "git is not installed or not on PATH"
load_npm_token

if [[ "$SYNC_APP_ONLY" == true ]]; then
  sync_application_from_library
  printf "\n${BOLD}${GREEN}Done.${RESET} Application synced from Library."
  info "Restart the Application dev server if it is running."
  exit 0
fi

# ---- confirm npm auth --------------------------------------------------------
step "Checking npm authentication"
if has_npm_token; then
  ok "Using NPM_TOKEN from environment or ${ROOT_DIR}/.npmrc"
fi
if NPM_USER="$(npm whoami 2>/dev/null)"; then
  ok "Logged in as ${NPM_USER}"
else
  die "Not logged in to npm. Set NPM_TOKEN, add ${ROOT_DIR}/.npmrc, or run 'npm login'."
fi

# ---- bump version ------------------------------------------------------------
step "Bumping version (${BUMP})"
cd "$PKG_DIR"
OLD_VERSION="$(node -p "require('./package.json').version")"
npm version "$BUMP" --no-git-tag-version >/dev/null 2>&1 || die "npm version bump failed"
NEW_VERSION="$(node -p "require('./package.json').version")"
ok "${OLD_VERSION} -> ${NEW_VERSION}"

# ---- build -------------------------------------------------------------------
step "Building library"
npm run build
ok "Build complete"

if [[ "$DRY_RUN" == true ]]; then
  warn "Dry run: skipping publish, Application update, and git push."
  info "Version left bumped at ${NEW_VERSION} in ${PKG_DIR}/package.json"
  exit 0
fi

# ---- publish -----------------------------------------------------------------
step "Publishing ${PKG_NAME}@${NEW_VERSION} to npm"
PUBLISH_ARGS=(--access public)
if [[ -n "$OTP" ]]; then
  PUBLISH_ARGS+=(--otp "$OTP")
elif ! has_npm_token; then
  info "No NPM_TOKEN found — npm may prompt for your 2FA one-time password."
fi

# Ensure npm picks up the repo-root token when publishing.
if has_npm_token; then
  export NPM_CONFIG_USERCONFIG="$ROOT_DIR/.npmrc"
  if [[ ! -f "$NPM_CONFIG_USERCONFIG" ]]; then
    printf '//registry.npmjs.org/:_authToken=%s\n' "$NPM_TOKEN" > "$NPM_CONFIG_USERCONFIG"
  fi
fi

# Publish the workspace package from the Library root. The Library package.json is
# private (apps/docs only); opus-react itself is public. Publishing from the package
# subdirectory can still trip EPRIVATE via the private workspace root.
cd "$ROOT_DIR/Library"
if ! npm publish -w "$PKG_NAME" ${PUBLISH_ARGS[@]+"${PUBLISH_ARGS[@]}"}; then
  die "Publish failed. The version has been bumped locally to ${NEW_VERSION}; \
fix the issue and re-run 'npm publish -w ${PKG_NAME} --access public' from ${ROOT_DIR}/Library, or re-run this script."
fi
ok "Published ${PKG_NAME}@${NEW_VERSION}"

# ---- wait for registry availability -----------------------------------------
step "Waiting for ${PKG_NAME}@${NEW_VERSION} on the registry"
ATTEMPTS=30
until npm view "${PKG_NAME}@${NEW_VERSION}" version >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS - 1))
  if [[ $ATTEMPTS -le 0 ]]; then
    warn "Timed out waiting for the registry to report ${NEW_VERSION}."
    warn "It may still propagate shortly; try the Application install manually."
    break
  fi
  printf "    ${DIM}...not visible yet, retrying (%d)${RESET}\n" "$ATTEMPTS"
  sleep 4
done
npm view "${PKG_NAME}@${NEW_VERSION}" version >/dev/null 2>&1 && ok "Available on registry"

# ---- update the Application --------------------------------------------------
if [[ "$SKIP_APP" == true ]]; then
  warn "Skipping Application update (--skip-app)."
else
  if [[ ! -d "$APP_DIR" ]]; then
    warn "Application directory not found at ${APP_DIR}; skipping consumer update."
  else
    step "Updating Application to ${PKG_NAME}@^${NEW_VERSION}"
    cd "$APP_DIR"

    # Pin package.json to the registry version (never a local file: path).
    node -e "
const fs = require('fs');
const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const prev = pkg.dependencies?.['${PKG_NAME}'] ?? '(not set)';
pkg.dependencies['${PKG_NAME}'] = '^${NEW_VERSION}';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('    package.json: ' + prev + ' -> ^${NEW_VERSION}');
"

    rm -rf node_modules/"$PKG_NAME"
    if npm install; then
      INSTALLED="$(node -p "require('$PKG_NAME/package.json').version" 2>/dev/null || echo '?')"
      ok "Application now uses ${PKG_NAME}@${INSTALLED}"
    else
      die "Failed to install ${PKG_NAME}@${NEW_VERSION} in the Application."
    fi

    sync_application_from_library
  fi
fi

# ---- commit and push to git --------------------------------------------------
if [[ "$SKIP_GIT" == true ]]; then
  warn "Skipping git commit and push (--skip-git)."
else
  step "Committing and pushing to git"
  cd "$ROOT_DIR"
  git rev-parse --git-dir >/dev/null 2>&1 || die "Not a git repository: ${ROOT_DIR}"

  GIT_BRANCH="$(git branch --show-current)"
  [[ -n "$GIT_BRANCH" ]] || die "Detached HEAD — checkout a branch before deploying."

  GIT_FILES=(
    "Library/packages/opus-react/package.json"
    "Application/package.json"
    "Application/package-lock.json"
  )

  # Include root lockfile when npm workspaces track the package version there.
  if [[ -f "$ROOT_DIR/Library/package-lock.json" ]]; then
    GIT_FILES+=("Library/package-lock.json")
  fi

  STAGED=()
  for file in "${GIT_FILES[@]}"; do
    if [[ -f "$ROOT_DIR/$file" ]]; then
      git add "$file"
      STAGED+=("$file")
    fi
  done

  if [[ "$SKIP_APP" != true ]]; then
    stage_application_sync_files
  fi

  if git diff --cached --quiet; then
    warn "No staged changes — versions may already be committed."
  else
    COMMIT_MSG="chore: release ${PKG_NAME}@${NEW_VERSION}"
    git commit -m "$COMMIT_MSG"
    ok "Committed: ${COMMIT_MSG}"

    if git push origin "$GIT_BRANCH"; then
      ok "Pushed to origin/${GIT_BRANCH}"
    else
      die "git push failed. Commit is local — push manually with: git push origin ${GIT_BRANCH}"
    fi

    TAG="v${NEW_VERSION}"
    if git tag -a "$TAG" -m "Release ${PKG_NAME}@${NEW_VERSION}" 2>/dev/null; then
      if git push origin "$TAG"; then
        ok "Tagged and pushed ${TAG}"
      else
        warn "Tag ${TAG} created locally but push failed — run: git push origin ${TAG}"
      fi
    else
      warn "Tag ${TAG} already exists; skipped."
    fi
  fi
fi

printf "\n${BOLD}${GREEN}Done.${RESET} Deployed ${PKG_NAME}@${NEW_VERSION}."
if [[ "$SKIP_APP" != true ]]; then
  info "Restart the dev server if it's running to pick up the new package."
fi
