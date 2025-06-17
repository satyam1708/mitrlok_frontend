import LoginForm from "../_components/LoginForm";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-teal-50 to-teal-100">
      <h1 className="text-3xl sm:text-4xl font-bold text-[#FF9966] italic mb-8 text-center select-none">
        MitrLok
      </h1>
      <LoginForm />
    </div>
  );
}
