export default ({ env }) => ({
  "users-permissions": {
    config: {
      register: {
        allowedFields: ["firstName", "lastName", "phone"],
      },
    },
  },
  "config-sync": {
    config: {
      // The advanced settings hold per-environment URLs (confirm-email and
      // reset-password redirections), so they stay in each environment's own
      // database instead of being overwritten by an import.
      // The five other entries are the plugin defaults, re-declared because
      // this option replaces them rather than extending them.
      excludedConfig: [
        "core-store.plugin_users-permissions_grant",
        "core-store.plugin_upload_metrics",
        "core-store.plugin_upload_api-folder",
        "core-store.strapi_content_types_schema",
        "core-store.ee_information",
        "core-store.plugin_users-permissions_advanced",
      ],
    },
  },
});
