import { IconSettings } from "@tabler/icons-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <IconSettings size={32} className="text-blue-400" />
          System Settings
        </h1>
        <p className="text-zinc-400 mt-2">
          Configure system-wide settings and preferences
        </p>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-12">
        <div className="text-center">
          <IconSettings size={64} className="mx-auto mb-6 text-zinc-500 opacity-50" />
          <h2 className="text-2xl font-semibold text-zinc-300 mb-4">
            Settings Coming Soon
          </h2>
          <p className="text-zinc-400 text-lg mb-6">
            System settings and configuration options are currently under development.
          </p>
          <div className="bg-zinc-700 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-zinc-300 font-medium">TBC - To Be Continued</p>
            <p className="text-zinc-500 text-sm mt-1">
              This feature will be implemented in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}