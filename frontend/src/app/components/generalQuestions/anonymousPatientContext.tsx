import {
  PatientProfileResponse,
  useGetAnonymousPatientSession,
} from "@/app/api/profile/profile";
import { createContext } from "react";

type AnonymousPatientContextType = {
  anonymousPatient: PatientProfileResponse | null;
};

export const AnonymousPatientContext =
  createContext<AnonymousPatientContextType>({
    anonymousPatient: null,
  });

const AnonymousPatientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data, isLoading } = useGetAnonymousPatientSession();

  if (isLoading) {
    return <p> Loading... </p>;
  }

  return (
    <AnonymousPatientContext value={{ anonymousPatient: data ?? null }}>
      {children}
    </AnonymousPatientContext>
  );
};

export default AnonymousPatientProvider;
