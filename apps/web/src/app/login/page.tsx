"use client";

import SignInForm from "@/components/sign-in-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7f4] via-[#eef6ef] to-[#d5f5e4] flex items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div className="bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-[16px] p-8 lg:p-10 border border-[#e5e7eb]">
          <SignInForm />
        </div>
        <div className="hidden lg:block rounded-[20px] bg-gradient-to-br from-[#16a34a]/30 to-[#7cd49a]/40 shadow-[0_20px_50px_rgba(0,0,0,0.06)]" />
      </div>
    </div>
  );
}
