// The site reports the library's own version, not whichever build npm happened
// to install. scripts/sync-library-version.mjs regenerates the value from
// Library/packages/opus-react/package.json and runs before every build.
export { libraryVersion } from "../generated/libraryVersion";
