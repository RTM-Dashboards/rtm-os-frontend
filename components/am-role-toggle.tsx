"use client";

import { type AMRole, SARAH } from "@/lib/am-role-mock-data";

interface RoleToggleProps {
  role: AMRole;
  onRoleChange: (role: AMRole) => void;
}

export function RoleToggle({ role, onRoleChange }: RoleToggleProps) {
  return (
    <div className="space-y-3">
      {/* Toggle bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl border w-fit bg-white border-slate-200 shadow-sm">
        <button
          onClick={() => onRoleChange("head")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            role === "head"
              ? "bg-indigo-600 text-white shadow"
              : "text-slate-500 hover:text-slate-700 bg-transparent"
          }`}
        >
          👔 Account Management Head View
        </button>
        <button
          onClick={() => onRoleChange("am")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            role === "am"
              ? "bg-blue-600 text-white shadow"
              : "text-slate-500 hover:text-slate-700 bg-transparent"
          }`}
        >
          👤 Account Manager View
        </button>
      </div>

      {/* Role label banner */}
      {role === "head" ? (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50">
          <span className="text-indigo-600 text-lg">👔</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Current View</p>
            <p className="text-sm font-semibold text-indigo-800">Viewing as Account Management Head</p>
          </div>
          <span className="ml-auto inline-flex rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
            Full Portfolio Access
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50">
          <span className="text-blue-600 text-lg">👤</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500">Current View</p>
            <p className="text-sm font-semibold text-blue-800">Viewing as Account Manager: {SARAH}</p>
          </div>
          <span className="ml-auto inline-flex rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
            My Clients Only
          </span>
        </div>
      )}
    </div>
  );
}
