
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#090d16]">
      <Sidebar />

      <div className="ml-64 min-h-screen">
        <Topbar />

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
