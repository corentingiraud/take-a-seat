import { Flex, Typography } from "@strapi/design-system";
import { useFetchClient, useNotification, useTable } from "@strapi/strapi/admin";
import { unstable_useContentManagerContext as useContentManagerContext } from '@strapi/strapi/admin';

export const MarkAsConfirmedAction = ({ documents }: { documents: any }) => {
  const { slug } = useContentManagerContext();
  const { put } = useFetchClient();

  if (slug !== "api::booking.booking") return null;

  const onConfirm = async () => {
    const promises = [];
    for (const booking of documents) {
      if (booking.bookingStatus === "CONFIRMED") continue;

      const updatedBooking = {
        bookingStatus: "CONFIRMED",
      };
      promises.push(put(`/content-manager/collection-types/api::booking.booking/${booking.documentId}`, updatedBooking));
    }
    await Promise.all(promises);
    // TODO: find how to reload entries
    window.location.reload();
  }

  return {
    variant: 'default',
    label: "Confirmer les réservations",
    dialog: {
      type: 'dialog',
      title: "Confirmation",
      content: (
        <Flex direction="column" alignItems="stretch" gap={2}>
          <Typography id="confirm-description" textAlign="center">
            Voulez-vous vraiment confirmer ces réservation ?
          </Typography>
        </Flex>
      ),
      onConfirm: onConfirm,
    },
  };
};
