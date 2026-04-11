import { Suspense } from "react";
import SigninComponent from "../../components/auth/signin";

function SigninLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-emerald-400 text-xl">Loading...</div>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={<SigninLoading />}>
      <SigninComponent />
    </Suspense>
  );
}
