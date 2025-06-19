import { User } from "@/models/user";

interface UserDetailsProps {
  user: User;
}

export const UserDetails = ({ user }: UserDetailsProps) => {
  return (
    <>
      <p>
        <span className="font-medium">Nom :</span> {user?.lastName}
      </p>
      <p>
        <span className="font-medium">Prénom :</span> {user?.firstName}
      </p>
      <p>
        <span className="font-medium">Nom d&apos;utilisateur :</span>{" "}
        {user?.username}
      </p>
      <p>
        <span className="font-medium">Email :</span> {user?.email}
      </p>
      <p>
        <span className="font-medium">Téléphone :</span> {user?.phone}
      </p>
      <p>
        <span className="font-medium">Compte confirmé :</span>{" "}
        {user?.confirmed ? "Oui" : "Non"}
      </p>
    </>
  );
};
