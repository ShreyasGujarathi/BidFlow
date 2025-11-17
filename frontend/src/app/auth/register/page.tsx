import { AuthForm } from "../../../components/forms/AuthForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <AuthForm mode="register" />
    </div>
  );
}

