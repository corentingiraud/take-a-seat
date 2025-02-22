import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { MarkAsPaidAction } from './components/MarkAsPaidAction';
import { MarkAsConfirmedAction } from './components/MarkAsConfirmed';

export default {
  register(app: any) {
    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  bootstrap(app: any) {
    app.getPlugin('content-manager').apis.addBulkAction([MarkAsPaidAction, MarkAsConfirmedAction])
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
