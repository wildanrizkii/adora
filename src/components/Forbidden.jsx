"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const Forbidden = () => {
  const router = useRouter();

  useEffect(() => {
    document.body.classList.add("loaded");
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="grid h-screen place-content-center bg-gradient-to-br from-emerald-50 to-emerald-100 px-4">
      <div className="text-center">
        <h1 className="text-[10rem] font-black text-emerald-500 drop-shadow-md mb-6">
          403
        </h1>

        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
          Oops! Sorry.
        </h2>

        <p className="mt-4 text-lg text-slate-600">
          You don't have access to this page.
        </p>

        <button
          onClick={() => router.push("/")}
          className="mt-8 inline-block rounded-lg bg-emerald-500 px-6 py-3 text-base font-medium text-white shadow-lg transition-all duration-300 hover:bg-emerald-600 hover:scale-105 focus:outline-none focus:ring focus:ring-emerald-300"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Forbidden;
