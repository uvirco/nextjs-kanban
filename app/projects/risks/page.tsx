"use client";
import { useEffect, useState } from "react";
import { Risk } from "@/types/types";
import { supabase } from "@/lib/supabase";
import { Button } from "@nextui-org/button";
import { IconPlus, IconInfoCircle } from "@tabler/icons-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import AddRiskModal from "./AddRiskModal";

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

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
        <div className="flex gap-2">
          <Button onClick={() => setIsInfoModalOpen(true)} variant="flat">
            <IconInfoCircle size={16} className="mr-2" />
            Best Practices
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <IconPlus size={16} className="mr-2" />
            Add Risk
          </Button>
        </div>
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

      <Modal
        isOpen={isInfoModalOpen}
        onOpenChange={setIsInfoModalOpen}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-2xl font-bold">
              Best Practice Risk Management Features
            </h2>
          </ModalHeader>
          <ModalBody>
            <div className="prose prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: `
                <h3>1. Risk Detail Page</h3>
                <p>When clicking a risk, open a dedicated page with:</p>
                <ul>
                  <li><strong>Risk Score Calculation:</strong> Auto-calculate severity (Probability × Impact)</li>
                  <li><strong>Risk Matrix Visualization:</strong> Show where the risk sits on a heat map</li>
                  <li><strong>Timeline/History:</strong> Track status changes and updates</li>
                  <li><strong>Comments/Notes:</strong> Team discussions about the risk</li>
                  <li><strong>Related Tasks:</strong> Link to epics/tasks affected by this risk</li>
                  <li><strong>Action Items:</strong> Mitigation tasks with owners and due dates</li>
                  <li><strong>Attachments:</strong> Supporting documents</li>
                </ul>

                <h3>2. Risk Register Enhancements</h3>
                <ul>
                  <li><strong>Filters:</strong> By status, probability, impact, epic, owner</li>
                  <li><strong>Risk Matrix View:</strong> Visual heat map (probability vs impact grid)</li>
                  <li><strong>Dashboard:</strong> Charts showing risk distribution, trends over time</li>
                  <li><strong>Bulk Actions:</strong> Update multiple risks at once</li>
                  <li><strong>Export:</strong> To PDF/Excel for reporting</li>
                </ul>

                <h3>3. Additional Risk Tools</h3>
                <ul>
                  <li><strong>Risk Owner Assignment:</strong> Who's responsible for monitoring/mitigation</li>
                  <li><strong>Review Dates:</strong> When to reassess the risk</li>
                  <li><strong>Risk Categories:</strong> Technical, business, operational, etc.</li>
                  <li><strong>Contingency Plans:</strong> Backup plans if mitigation fails</li>
                  <li><strong>Risk Appetite/Threshold:</strong> Define acceptable risk levels</li>
                  <li><strong>Escalation Rules:</strong> Auto-notify when risks exceed thresholds</li>
                </ul>

                <h3>4. Integration with Epics</h3>
                <ul>
                  <li>Show risks on epic detail pages</li>
                  <li>Aggregate risk scores for epics</li>
                  <li>Dashboard showing epics with highest risk exposure</li>
                </ul>
              `,
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => setIsInfoModalOpen(false)}
              className="bg-blue-600 text-white"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
