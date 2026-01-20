"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { toast } from "sonner";
import RichTextEditor from "@/ui/RichTextEditor";

interface Epic {
  id: string;
  title: string;
}

interface AddRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddRiskModal({ isOpen, onClose, onSuccess }: AddRiskModalProps) {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    epicId: "",
    probability: "",
    impact: "",
    mitigationPlan: "",
    status: "Open",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchEpics();
    }
  }, [isOpen]);

  const fetchEpics = async () => {
    const { data, error } = await supabase
      .from("Task")
      .select("id, title")
      .eq("taskType", "EPIC");

    if (error) {
      console.error("Error fetching epics:", error);
    } else {
      setEpics(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.epicId) newErrors.epicId = "Epic is required";
    if (!formData.probability) newErrors.probability = "Probability is required";
    if (!formData.impact) newErrors.impact = "Impact is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("risks")
      .insert([{
        title: formData.title,
        description: formData.description || null,
        epic_id: formData.epicId,
        probability: formData.probability,
        impact: formData.impact,
        mitigation_plan: formData.mitigationPlan || null,
        status: formData.status,
      }]);

    if (error) {
      console.error("Error adding risk:", error);
      toast.error("Failed to add risk");
    } else {
      toast.success("Risk added successfully");
      onSuccess();
      setFormData({
        title: "",
        description: "",
        epicId: "",
        probability: "",
        impact: "",
        mitigationPlan: "",
        status: "Open",
      });
    }

    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onClose}
      isDismissable={false}
      hideCloseButton={false}
    >
      <ModalContent>
        <ModalHeader>
          <h2>Add New Risk</h2>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
                placeholder="Risk title"
                isInvalid={!!errors.title}
                errorMessage={errors.title}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Epic *</label>
              <div onClick={(e) => e.stopPropagation()}>
                <Select
                  selectedKeys={formData.epicId ? [formData.epicId] : []}
                  onSelectionChange={(keys) => handleChange("epicId", Array.from(keys)[0] as string)}
                  placeholder="Select an epic"
                  aria-label="Epic"
                  isInvalid={!!errors.epicId}
                  errorMessage={errors.epicId}
                >
                  {epics.map((epic) => (
                    <SelectItem key={epic.id} value={epic.id}>
                      {epic.title}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Risk description"
                rows={3}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Probability *</label>
                <div onClick={(e) => e.stopPropagation()}>
                  <Select
                    selectedKeys={formData.probability ? [formData.probability] : []}
                    onSelectionChange={(keys) => handleChange("probability", Array.from(keys)[0] as string)}
                    placeholder="Select probability"
                    aria-label="Probability"
                    isInvalid={!!errors.probability}
                    errorMessage={errors.probability}
                  >
                    <SelectItem key="Low">Low</SelectItem>
                    <SelectItem key="Medium">Medium</SelectItem>
                    <SelectItem key="High">High</SelectItem>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Impact *</label>
                <div onClick={(e) => e.stopPropagation()}>
                  <Select
                    selectedKeys={formData.impact ? [formData.impact] : []}
                    onSelectionChange={(keys) => handleChange("impact", Array.from(keys)[0] as string)}
                    placeholder="Select impact"
                    aria-label="Impact"
                    isInvalid={!!errors.impact}
                    errorMessage={errors.impact}
                  >
                    <SelectItem key="Low">Low</SelectItem>
                    <SelectItem key="Medium">Medium</SelectItem>
                    <SelectItem key="High">High</SelectItem>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mitigation Plan</label>
              <RichTextEditor
                content={formData.mitigationPlan}
                onChange={(content) => handleChange("mitigationPlan", content)}
                placeholder="How to mitigate this risk"
                className="bg-zinc-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <div onClick={(e) => e.stopPropagation()}>
                <Select
                  defaultSelectedKeys={["Open"]}
                  selectedKeys={[formData.status]}
                  onSelectionChange={(keys) => handleChange("status", Array.from(keys)[0] as string)}
                  aria-label="Status"
                >
                  <SelectItem key="Open">Open</SelectItem>
                  <SelectItem key="Mitigated">Mitigated</SelectItem>
                  <SelectItem key="Closed">Closed</SelectItem>
                </Select>
              </div>
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            color="primary"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "Adding..." : "Add Risk"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}