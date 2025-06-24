"use client";

import { createContext, useCallback, useContext, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmDialogContextType = (options?: ConfirmOptions) => Promise<boolean>;

const ConfirmDialogContext = createContext<ConfirmDialogContextType>(() => {
  throw new Error("useConfirm must be used within ConfirmDialogProvider");
});

export const useConfirm = () => useContext(ConfirmDialogContext);

export const ConfirmDialogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<(value: boolean) => void>(
    () => () => {},
  );

  const confirm = useCallback((options?: ConfirmOptions) => {
    setOptions(options || {});
    setVisible(true);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleClose = (result: boolean) => {
    setVisible(false);
    resolver(result);
  };

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      <AlertDialog open={visible} onOpenChange={setVisible}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {options.title || "Merci de confirmer votre action"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {options.description || "Cette action est irréversible."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleClose(false)}>
              {options.cancelText || "Non"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleClose(true)}>
              {options.confirmText || "Oui"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmDialogContext.Provider>
  );
};
