"use client";

import { useRouter } from "next/navigation";

export default function Page() {

    const router = useRouter();

    const handleRedirect = () => {
        router.push("/register");
    }
    return (
        <div>
            <button onClick={handleRedirect}>
                Go To Register
            </button>
        </div>
    );
}