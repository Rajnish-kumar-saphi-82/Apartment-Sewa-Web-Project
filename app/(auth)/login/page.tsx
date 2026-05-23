"use client";

import { Building } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="login-background">

            <div className="login-wrapper">

                <div className="login-brand">

                    <Building className="login-brand-icon"/>

                    <h1 className="login-brand-name">
                        Apartment Sewa
                    </h1>
                </div>

                <div className="login-card">

                    <h2 className="login-title">
                        Login Page
                    </h2>

                    <p className="login-subtitle">
                        Access the property management portal
                    </p>
                </div>
            </div>
        </div>
    );
}