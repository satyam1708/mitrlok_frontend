"use client";

import React, { Suspense } from "react";
import VerifyUI from "../_components/VerifyUI";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyUI />
    </Suspense>
  );
}
