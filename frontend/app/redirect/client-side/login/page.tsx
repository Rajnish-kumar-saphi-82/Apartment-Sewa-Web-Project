"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const handleRedirect = () => {
    router.push("/login");
  };
  return (
    <div>
      <button onClick={handleRedirect}>Go To Login</button>
    </div>
  );
}
