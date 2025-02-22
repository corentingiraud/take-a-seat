import { Flex, Typography } from "@strapi/design-system";
import { useFetchClient, useNotification, useTable } from "@strapi/strapi/admin";
import { unstable_useContentManagerContext as useContentManagerContext } from '@strapi/strapi/admin';

export const MarkAsPaidAction = ({ documents }: { documents: any }) => {
  const { slug } = useContentManagerContext();
  const { put } = useFetchClient();
  const selectRow = useTable('DeleteAction', (state) => state.selectRow);
  const { toggleNotification } = useNotification();

  if (slug !== "api::booking.booking") return null;

  const onConfirm = async () => {
    const promises = [];
    for (const booking of documents) {
      if (booking.paymentStatus === "PAID") continue;

      const updatedBooking = {
        paymentStatus: "PAID",
      };
      promises.push(put(`/content-manager/collection-types/api::booking.booking/${booking.documentId}`, updatedBooking));
    }
    await Promise.all(promises);
    // TODO: find how to reload entries
    window.location.reload();
  }

  return {
    variant: 'default',
    label: "Marquer comme payé",
    dialog: {
      type: 'dialog',
      title: "Confirmation",
      content: (
        <Flex direction="column" alignItems="stretch" gap={2}>
          <Typography id="confirm-description" textAlign="center">
            Voulez-vous vraiment marquer ces entrées comme payées ?
          </Typography>
        </Flex>
      ),
      onConfirm: onConfirm,
    },
  };
};
