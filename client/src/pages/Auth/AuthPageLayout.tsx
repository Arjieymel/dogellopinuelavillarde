import type { FC, ReactNode } from "react";
import download from "../../assets/img/download.jpg";

interface AuthPageLayoutProps {
  children: ReactNode;
}

const AuthPageLayout: FC<AuthPageLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen flex flex-row bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">

      {/* subtle ambient background layers (do not affect image layout) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(37,99,235,0.10),transparent_55%)]" />

      {/* LEFT SIDE - FORM SECTION (UNCHANGED IMAGE POSITION INSIDE HEADER) */}
      <div className="relative flex flex-col justify-center items-center w-full lg:w-1/2 px-6 py-10 lg:py-0">

        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-blue-100/70">

          {/* HEADER */}
          <div className="flex flex-col items-center mb-8">
            <img
              className="h-16 mb-3 drop-shadow-sm"
              src={download}
              alt="Man Power"
            />

            <h2 className="text-2xl font-bold text-gray-900 text-center tracking-tight">
              Sign in to your account
            </h2>

            <p className="text-sm text-gray-600 mt-1 text-center">
              Welcome back! Please enter your credentials to continue.
            </p>
          </div>

          {/* FORM CONTENT */}
          {children}

        </div>
      </div>

      {/* RIGHT SIDE - IMAGE SECTION (UNCHANGED POSITION) */}
      <div className="relative hidden lg:flex w-1/2 h-screen items-center justify-center bg-white/60 backdrop-blur-sm overflow-hidden">

        {/* subtle modern overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/12 via-transparent to-blue-900/12" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />

        {/* optional soft blur glow */}
        <div className="absolute w-96 h-96 bg-blue-300/20 rounded-full blur-3xl top-1/4 right-1/4" />
        <div className="absolute w-72 h-72 bg-sky-300/15 rounded-full blur-3xl bottom-1/4 left-1/4" />

        <img
          className="relative object-contain w-full h-full p-10"
          src={download}
          alt="Company Logo"
        />
      </div>

    </div>
  );
};

export default AuthPageLayout;