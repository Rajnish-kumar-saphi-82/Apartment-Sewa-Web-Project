"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AlertContextType {
  showAlert: (message: string, title?: string) => Promise<void>;
  showConfirm: (
    message: string,
    title?: string,
    confirmText?: string,
    cancelText?: string
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
  const [title, setTitle] = useState("Alert");
  const [message, setMessage] = useState("");
  const [confirmText, setConfirmText] = useState("Accept");
  const [cancelText, setCancelText] = useState("Decline");
  
  
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const showAlert = (msg: string, titleStr: string = "Notice") => {
    return new Promise<void>((resolve) => {
      setType("alert");
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
    cancelBtnStr: string = "Decline"
  ) => {
    return new Promise<boolean>((resolve) => {
      setType("confirm");
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
                  <button className="ios-modal-btn confirm" onClick={handleConfirm}>
                    {confirmText}
                  </button>
                </>
              ) : (
                <button className="ios-modal-btn confirm full-width" onClick={handleConfirm}>
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
