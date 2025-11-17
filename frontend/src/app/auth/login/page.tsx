import { AuthForm } from "../../../components/forms/AuthForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <AuthForm mode="login" />
    </div>
  );
}

