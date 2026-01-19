"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CRMDeal, CRMBoard } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DealFormModal from "@/ui/CRM/DealFormModal";
import BoardManagementModal from "@/ui/CRM/BoardManagementModal";
import ColumnManagementModal from "@/ui/CRM/ColumnManagementModal";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconChevronDown,
  IconSettings,
  IconColumns,
  IconGripVertical,
} from "@tabler/icons-react";

interface DealColumn {
  id: string;
  title: string;
  stage: string;
  color: string;
  order: number;
  boardId?: string;
}

export default function CRMDealsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [columns, setColumns] = useState<DealColumn[]>([]);
  const [boards, setBoards] = useState<CRMBoard[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBoardManagementOpen, setIsBoardManagementOpen] = useState(false);
  const [isColumnManagementOpen, setIsColumnManagementOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [dealToEdit, setDealToEdit] = useState<CRMDeal | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<CRMDeal | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<DealColumn | null>(null);

  useEffect(() => {
    fetchBoards();
  }, []);

  // Listen to URL changes for boardId
  useEffect(() => {
    const urlBoardId = searchParams?.get("boardId");
    if (urlBoardId && urlBoardId !== selectedBoardId) {
      setSelectedBoardId(urlBoardId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedBoardId) {
      fetchColumns();
      fetchDeals();
    }
  }, [selectedBoardId]);

  const fetchBoards = async () => {
    try {
      const response = await fetch("/api/crm/boards?type=deals");
      if (response.ok) {
        const data = await response.json();
        const boardsList = data.boards || [];
        setBoards(boardsList);

        // Check URL for boardId first, then use default or first board
        const urlBoardId = searchParams?.get("boardId");
        if (urlBoardId) {
          setSelectedBoardId(urlBoardId);
        } else {
          const defaultBoard = boardsList.find((b: CRMBoard) => b.isDefault);
          if (defaultBoard) {
            setSelectedBoardId(defaultBoard.id);
          } else if (boardsList.length > 0) {
            setSelectedBoardId(boardsList[0].id);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
    }
  };

  const fetchColumns = async () => {
    try {
      const response = await fetch(
        `/api/crm/deal-columns?boardId=${selectedBoardId}`
      );
      if (response.ok) {
        const data = await response.json();
        setColumns(data.columns || []);
      }
    } catch (error) {
      console.error("Error fetching columns:", error);
    }
  };

  const fetchDeals = async () => {
    try {
      console.log("Fetching deals...");

      // First check session
      const sessionResponse = await fetch("/api/auth/session");
      const session = await sessionResponse.json();
      console.log("Session:", session);

      const response = await fetch(`/api/crm/deals?boardId=${selectedBoardId}`);
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("Raw deals data:", data);
        console.log("Number of deals:", data.deals?.length);
        console.log("First deal object:", data.deals?.[0]);
        console.log("Second deal object:", data.deals?.[1]);
        const validDeals = (data.deals || []).filter(
          (deal: CRMDeal) => deal && deal.id
        );
        console.log("Valid deals:", validDeals);
        console.log(
          "Deal stages:",
          validDeals.map((d: CRMDeal) => ({ id: d.id, stage: d.stage }))
        );
        setDeals(validDeals);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch deals:", response.status, errorText);
        setDeals([]);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
      setDeals([]);
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  const getDealsByColumn = (stage: string) => {
    return deals
      .filter((deal) => deal.stage === stage)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const handleAddDeal = (stage: string) => {
    setSelectedStage(stage);
    setDealToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditDeal = (deal: CRMDeal) => {
    setSelectedStage(deal.stage);
    setDealToEdit(deal);
    setIsModalOpen(true);
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;

    try {
      const response = await fetch(`/api/crm/deals/${dealId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchDeals();
      } else {
        alert("Failed to delete deal");
      }
    } catch (error) {
      console.error("Error deleting deal:", error);
      alert("Failed to delete deal");
    }
  };

  const handleDragStart = (deal: CRMDeal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (stage: string) => {
    if (!draggedDeal || draggedDeal.stage === stage) {
      setDraggedDeal(null);
      return;
    }

    try {
      const response = await fetch(`/api/crm/deals/${draggedDeal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stage: stage,
        }),
      });

      if (response.ok) {
        await fetchDeals();
      } else {
        console.error("Failed to move deal");
        alert("Failed to move deal");
      }
    } catch (error) {
      console.error("Error moving deal:", error);
      alert("Failed to move deal");
    } finally {
      setDraggedDeal(null);
    }
  };

  // Column drag and drop handlers
  const handleColumnDragStart = (column: DealColumn) => {
    setDraggedColumn(column);
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleColumnDrop = async (targetColumn: DealColumn) => {
    if (!draggedColumn || draggedColumn.id === targetColumn.id) {
      setDraggedColumn(null);
      return;
    }

    // Reorder columns
    const newColumns = [...columns];
    const draggedIndex = newColumns.findIndex((c) => c.id === draggedColumn.id);
    const targetIndex = newColumns.findIndex((c) => c.id === targetColumn.id);

    // Remove dragged column and insert at target position
    newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, draggedColumn);

    // Update order values
    const updatedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index,
    }));

    // Optimistically update UI
    setColumns(updatedColumns);
    setDraggedColumn(null);

    // Save to database
    try {
      await Promise.all(
        updatedColumns.map((col) =>
          fetch(`/api/crm/deal-columns/${col.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: col.order }),
          })
        )
      );
    } catch (error) {
      console.error("Error updating column order:", error);
      // Revert on error
      fetchColumns();
    }
  };

  console.log("Render - Loading:", loading, "Deals count:", deals.length);

  if (loading) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Loading pipeline...</h1>
        <p className="text-zinc-400">Please wait while we fetch your deals.</p>
      </div>
    );
  }

  const totalValue = deals
    .filter((d) => d.stage !== "crm-deal-col-lost-0000-0000-0000-000000")
    .reduce((sum, deal) => sum + parseFloat(deal.value?.toString() || "0"), 0);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">CRM Pipeline</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Total Pipeline Value:{" "}
            <span className="text-green-400 font-semibold">
              ${totalValue.toLocaleString()}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => setIsColumnManagementOpen(true)}
            variant="outline"
            className="bg-zinc-700 border-zinc-600 text-white hover:bg-zinc-600"
          >
            <IconColumns size={16} className="mr-2" />
            Manage Columns
          </Button>
          <Button
            onClick={() => setIsBoardManagementOpen(true)}
            variant="outline"
            className="bg-zinc-700 border-zinc-600 text-white hover:bg-zinc-600"
          >
            <IconSettings size={16} className="mr-2" />
            Manage Boards
          </Button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {columns.map((column) => {
          const columnDeals = getDealsByColumn(column.stage);
          console.log(
            `Rendering column ${column.id} with ${columnDeals.length} deals`
          );
          const columnValue = columnDeals.reduce(
            (sum, deal) => sum + parseFloat(deal.value?.toString() || "0"),
            0
          );

          return (
            <div
              key={`column-${column.id}`}
              className="flex-shrink-0 w-80 bg-zinc-800 rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.stage)}
            >
              <div 
                className="flex items-center justify-between mb-4 cursor-move"
                draggable
                onDragStart={() => handleColumnDragStart(column)}
                onDragOver={handleColumnDragOver}
                onDrop={(e) => {
                  e.stopPropagation();
                  handleColumnDrop(column);
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <IconGripVertical className="h-4 w-4 text-zinc-500" />
                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                    <h3 className="font-semibold text-white">{column.title}</h3>
                    <span className="text-xs text-zinc-400">
                      ({columnDeals.length})
                    </span>
                  </div>
                  {columnValue > 0 && (
                    <p className="text-xs text-zinc-400 ml-5">
                      ${columnValue.toLocaleString()}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAddDeal(column.stage)}
                  className="h-8 w-8 p-0"
                >
                  <IconPlus size={16} />
                </Button>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
                {columnDeals
                  .filter((deal) => deal && deal.id)
                  .map((deal) => (
                    <Card
                      key={`deal-${deal.id}`}
                      draggable
                      onDragStart={() => handleDragStart(deal)}
                      onClick={() => router.push(`/crm/deals/${deal.deal_id}`)}
                      className="bg-zinc-700 border-zinc-600 hover:border-zinc-500 cursor-pointer transition-colors"
                    >
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm text-white flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-xs text-zinc-500 font-normal mb-1">
                              #{deal.deal_id}
                            </div>
                            <div>{deal.title}</div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDeal(deal);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <IconEdit size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDeal(deal.id);
                              }}
                              className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                            >
                              <IconTrash size={14} />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-1 text-xs">
                        {deal.contact && (
                          <p className="text-zinc-300">
                            👤 {deal.contact.name}
                          </p>
                        )}
                        {deal.value && (
                          <p className="text-green-400 font-semibold">
                            $
                            {parseFloat(deal.value.toString()).toLocaleString()}
                          </p>
                        )}
                        {deal.expectedCloseDate && (
                          <p className="text-zinc-400 flex items-center gap-1">
                            <IconCalendar size={12} />
                            {new Date(
                              deal.expectedCloseDate
                            ).toLocaleDateString()}
                          </p>
                        )}
                        {deal.notes && (
                          <p className="text-zinc-400 truncate">
                            💬 {deal.notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                {columnDeals.length === 0 && (
                  <div className="text-center py-8 text-zinc-500 text-sm">
                    No deals yet
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DealFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDeals}
        stage={selectedStage}
        boardId={selectedBoardId}
        dealToEdit={dealToEdit}
      />

      <BoardManagementModal
        isOpen={isBoardManagementOpen}
        onClose={() => setIsBoardManagementOpen(false)}
        onBoardsChanged={() => {
          fetchBoards();
        }}
      />

      <ColumnManagementModal
        isOpen={isColumnManagementOpen}
        onClose={() => setIsColumnManagementOpen(false)}
        boardId={selectedBoardId}
        onColumnsUpdated={() => {
          fetchColumns();
          fetchDeals();
        }}
      />
    </div>
  );
}
