import { getLocalePrefix } from "../../../public/lib/apiOperations";

export default function RegisterPage() {
  return null;
}

export async function getServerSideProps({ params, locale }) {
  const localePrefix = getLocalePrefix(locale);
  return {
    redirect: {
      destination: `${localePrefix}/projects/${params.projectId}?openRegistration=true`,
      permanent: false,
    },
  };
}
