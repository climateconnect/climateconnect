export default function RegisterPage() {
  return null;
}

export async function getServerSideProps({ params }) {
  return {
    redirect: {
      destination: `/projects/${params.projectId}?openRegistration=true`,
      permanent: false,
    },
  };
}
