"use client";

import React, { Suspense } from "react";
import VerifyUI from "./VerifyUI";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyUI />
    </Suspense>
  );
}
