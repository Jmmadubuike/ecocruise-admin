// File: components/providers/ToastProvider.tsx
"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return <Toaster position="top-right" toastOptions={{ duration: 4000 }} />;
}

// File: utils/toast.ts
import toast from "react-hot-toast";

export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);
export const showInfo = (message: string) => toast(message);
