import { useRouter } from "next/router";
import { useEffect } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const { projectId } = router.query;

  useEffect(() => {
    if (projectId) {
      router.replace(`/projects/${projectId}?openRegistration=true`);
    }
  }, [projectId, router]);

  return null;
}
