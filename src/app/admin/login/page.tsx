import { site } from "@/lib/site";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid flex-1 place-items-center px-4 py-16">
      <div className="card w-full max-w-sm p-8">
        <p className="font-display text-2xl font-semibold">{site.shortName}</p>
        <h1 className="mt-1 text-sm font-normal text-muted" style={{ fontFamily: "inherit" }}>
          Spa admin
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
