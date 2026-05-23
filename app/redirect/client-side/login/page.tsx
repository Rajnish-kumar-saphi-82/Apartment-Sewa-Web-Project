"use client";

import { useRouter } from "next/router";

export default function Page() {

    const router = useRouter();

    const handleRedirect = () => {
        router.push("/login");
    }
    return (
        <div></div>
    );
}