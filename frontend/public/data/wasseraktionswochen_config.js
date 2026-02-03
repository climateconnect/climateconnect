/**
 * Configuration for Wasseraktionswochen special event page
 * Note: JS file so that next.config.js can import it
 */

const WASSERAKTIONSWOCHEN_PARENT_SLUG = "wasseraktionswochen-143-2932026";
const WASSERAKTIONSWOCHEN_PATH = "/hubs/em/wasseraktionswochen";

/**
 * Check if Wasseraktionswochen feature is enabled (server-side only)
 * Use this in getServerSideProps
 */
const isWasseraktionswochenEnabled = () => {
  return process.env.WASSERAKTIONSWOCHEN_FEATURE === "true";
};

module.exports = {
  WASSERAKTIONSWOCHEN_PARENT_SLUG,
  WASSERAKTIONSWOCHEN_PATH,
  isWasseraktionswochenEnabled,
};
