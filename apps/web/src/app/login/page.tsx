"use client";

import SignInForm from "@/components/sign-in-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f8fb] via-[#edf2fb] to-[#dbe8ff] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-[#e5e7eb] p-8 lg:p-10">
        <SignInForm />
      </div>
    </div>
  );
}
