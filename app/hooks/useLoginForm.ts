"use client"

import { useState } from "react";

export default function useLoginForm() {

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    return {
        email,
        setEmail,
        password,
        setPassword,
    }
}