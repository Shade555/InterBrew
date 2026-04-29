import SpeedRun from "../../components/challenge/os-challenge/SpeedRun.jsx";

export default function Page() {
  return (
    <main className="relative z-10 p-8 min-h-screen">
      {/* Keeping the background consistent with your other pages */}
      <div className="absolute inset-0 bg-[#09090b] -z-10" />
      
      <SpeedRun />
    </main>
  );
}