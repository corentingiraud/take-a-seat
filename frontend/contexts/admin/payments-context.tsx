"use client";

import { createContext } from "vm";

import { ReactNode, useContext } from "react";

interface AdminPaymentsContextType {}

interface AdminPaymentsProviderProps {
  children: ReactNode;
}

export const AdminPaymentsContext = createContext<
  AdminPaymentsContextType | undefined
>(undefined);

export const AdminPaymentsProvider: React.FC<AdminPaymentsProviderProps> = ({
  children,
}) => {
  return (
    <AdminPaymentsContext.Provider>{children}</AdminPaymentsContext.Provider>
  );
};

export const useAdminPayments = (): AdminPaymentsContextType => {
  const context = useContext(AdminPaymentsContext);

  if (!context) {
    throw new Error(
      "useAdminPayments must be used within an AdminPaymentsProvider",
    );
  }

  return context;
};
