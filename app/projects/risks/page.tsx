"use client";
import { useEffect, useState } from "react";
import { Risk } from "@/types/types";
import { supabase } from "@/lib/supabase";
import { Button } from "@nextui-org/button";
import { IconPlus } from "@tabler/icons-react";
import AddRiskModal from "./AddRiskModal";

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    const { data, error } = await supabase
      .from("risks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching risks:", error);
    } else {
      setRisks(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="p-6">Loading risks...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Risk Register</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <IconPlus size={16} className="mr-2" />
          Add Risk
        </Button>
      </div>

      <div className="bg-zinc-900 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-zinc-300">
          <thead className="bg-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Probability</th>
              <th className="px-4 py-3 text-left">Impact</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((risk) => (
              <tr key={risk.id} className="border-t border-zinc-800">
                <td className="px-4 py-3">{risk.title}</td>
                <td className="px-4 py-3">{risk.description || "-"}</td>
                <td className="px-4 py-3">{risk.probability}</td>
                <td className="px-4 py-3">{risk.impact}</td>
                <td className="px-4 py-3">{risk.status}</td>
                <td className="px-4 py-3">
                  <Button variant="flat" size="sm" onClick={() => {}}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
            {risks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No risks found. Add your first risk!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddRiskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchRisks();
        }}
      />
    </div>
  );
}