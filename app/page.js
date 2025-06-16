import LoginForm from "./_components/LoginForm";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      {/* Left half */}
      <div className="w-[45%] flex justify-center items-center bg-[#FFF8E7]">
        <div>
          <h1 className="text-4xl font-bold text-[#FF9966] italic">MitrLok</h1>
          <p>
            MitrLok helps you connect with your local community through shared passions.
          </p>
        </div>
      </div>

      {/* Right half */}
      <div className="w-[55%] flex justify-center items-center bg-[#c2eef4]">
        <LoginForm />
      </div>
    </div>
  );
}
