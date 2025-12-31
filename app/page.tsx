import { ApplicationList } from "./components/ApplicationList";
import { Plus } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Applications</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage and monitor your deployed applications.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
          <Plus size={20} />
          New Application
        </button>
      </div>

      <ApplicationList />
    </div>
  );
}