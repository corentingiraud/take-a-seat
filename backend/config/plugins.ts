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
      // This option replaces the plugin defaults rather than extending them,
      // so they are re-declared here. Two additions:
      //   - the advanced settings hold per-environment URLs (confirm-email and
      //     reset-password redirections), which an import would overwrite with
      //     whatever the committed file holds;
      //   - the whole "strapi_" prefix (which covers the default
      //     strapi_content_types_schema) is Strapi's own bookkeeping, including
      //     one-time migration flags. Importing those would tell an environment
      //     a repair already ran on its database when it did not.
      excludedConfig: [
        "core-store.plugin_users-permissions_grant",
        "core-store.plugin_upload_metrics",
        "core-store.plugin_upload_api-folder",
        "core-store.ee_information",
        "core-store.strapi_",
        "core-store.plugin_users-permissions_advanced",
      ],
    },
  },
});
