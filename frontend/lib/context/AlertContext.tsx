"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AlertContextType {
  showAlert: (message: string, title?: string, intent?: "info" | "success" | "error") => Promise<void>;
  showConfirm: (
    message: string,
    title?: string,
    confirmText?: string,
    cancelText?: string,
    intent?: "info" | "success" | "error"
  ) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"alert" | "confirm">("alert");
  const [intent, setIntent] = useState<"info" | "success" | "error">("info");
  const [title, setTitle] = useState("Alert");
  const [message, setMessage] = useState("");
  const [confirmText, setConfirmText] = useState("Accept");
  const [cancelText, setCancelText] = useState("Decline");
  
  
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const showAlert = (msg: string, titleStr: string = "Notice", alertIntent: "info" | "success" | "error" = "info") => {
    return new Promise<void>((resolve) => {
      setType("alert");
      
      // Auto-infer intent from title if not explicitly provided
      let finalIntent = alertIntent;
      if (alertIntent === "info") {
        const t = titleStr.toLowerCase();
        if (t.includes("success")) finalIntent = "success";
        else if (t.includes("error") || t.includes("failed")) finalIntent = "error";
      }
      
      setIntent(finalIntent);
      setTitle(titleStr);
      setMessage(msg);
      setIsOpen(true);
      setResolvePromise(() => () => resolve());
    });
  };

  const showConfirm = (
    msg: string,
    titleStr: string = "Confirm",
    confirmBtnStr: string = "Accept",
    cancelBtnStr: string = "Decline",
    confirmIntent: "info" | "success" | "error" = "info"
  ) => {
    return new Promise<boolean>((resolve) => {
      setType("confirm");
      
      let finalIntent = confirmIntent;
      if (confirmIntent === "info") {
        const t = titleStr.toLowerCase();
        if (t.includes("success")) finalIntent = "success";
        else if (t.includes("error") || t.includes("delete") || t.includes("remove")) finalIntent = "error";
      }
      
      setIntent(finalIntent);
      setTitle(titleStr);
      setMessage(msg);
      setConfirmText(confirmBtnStr);
      setCancelText(cancelBtnStr);
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {isOpen && (
        <div className="ios-modal-overlay">
          <div className="ios-modal">
            <div className="ios-modal-content">
              <h3 className="ios-modal-title">{title}</h3>
              <p className="ios-modal-message">{message}</p>
            </div>
            
            <div className="ios-modal-actions">
              {type === "confirm" ? (
                <>
                  <button className="ios-modal-btn cancel" onClick={handleCancel}>
                    {cancelText}
                  </button>
                  <button className={`ios-modal-btn confirm ${intent}`} onClick={handleConfirm}>
                    {confirmText}
                  </button>
                </>
              ) : (
                <button className={`ios-modal-btn confirm full-width ${intent}`} onClick={handleConfirm}>
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};
