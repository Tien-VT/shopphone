"use client";

import { Suspense } from "react";
import { CustomerNewsPage } from "@/components/customer/news";

function NewsPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <i className="fa-solid fa-circle-notch fa-spin text-[30px] text-brand-purple"></i>
      </div>
    }>
      <CustomerNewsPage />
    </Suspense>
  );
}

export default NewsPageWithSuspense;