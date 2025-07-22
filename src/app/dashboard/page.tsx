import Header from "@/components/ui/Header";

export default function Dashboard() {
  return (
    // wag galawin ung className !!! "m-auto w-full h-full"
    <div className="m-auto w-full h-full grid grid-cols-4 gap-1">

      <div className="col-span-1 border border-red-500">
        <h1>Sidebar</h1>
      </div>

      <div className="col-span-3 border border-red-500">
        <h1>Main Content</h1>
      </div>
      
    </div>
  );
}