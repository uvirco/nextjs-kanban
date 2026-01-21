"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CRMDeal, CRMBoard } from "@/types/crm";
import { Button } from "@/components/ui/button";
import DealFormModal from "@/ui/CRM/DealFormModal";
import BoardManagementModal from "@/ui/CRM/BoardManagementModal";
import ColumnManagementModal from "@/ui/CRM/ColumnManagementModal";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSettings,
  IconColumns,
  IconGripVertical,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

interface DealColumn {
  id: string;
  title: string;
  stage: string;
  color: string;
  order: number;
  boardId?: string;
}

interface DealReference {
  id: string;
  dealId: number;
  boardId: string;
  stage: string;
  note: string;
  createdAt: string;
  deal?: CRMDeal;
}

export default function CRMPipelinePage() {
  const router = useRouter();
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [referenceCards, setReferenceCards] = useState<DealReference[]>([]);
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
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(
    new Set(),
  );
  const [isScrollDragging, setIsScrollDragging] = useState(false);
  const [scrollStartX, setScrollStartX] = useState(0);
  const [scrollStartLeft, setScrollStartLeft] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBoards();
  }, []);

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
        const defaultBoard = boardsList.find((b: CRMBoard) => b.isDefault);
        if (defaultBoard) {
          setSelectedBoardId(defaultBoard.id);
        } else if (boardsList.length > 0) {
          setSelectedBoardId(boardsList[0].id);
        }
        setBoards(boardsList);
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
    }
  };

  const fetchColumns = async () => {
    try {
      const response = await fetch(
        `/api/crm/deal-columns?boardId=${selectedBoardId}`,
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
      const response = await fetch(`/api/crm/deals?boardId=${selectedBoardId}`);
      if (response.ok) {
        const data = await response.json();
        const validDeals = (data.deals || []).filter(
          (deal: CRMDeal) => deal && deal.id,
        );
        setDeals(validDeals);
      } else {
        setDeals([]);
      }

      const refResponse = await fetch(
        `/api/crm/deal-references?boardId=${selectedBoardId}`,
      );
      if (refResponse.ok) {
        const refData = await refResponse.json();
        setReferenceCards(refData.references || []);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const getDealsByColumn = (stage: string) => {
    return deals
      .filter((deal) => deal.stage === stage)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const getReferencesByColumn = (stage: string) => {
    return referenceCards.filter((ref) => ref.stage === stage);
  };

  const handleAddDeal = (stage: string) => {
    setSelectedStage(stage);
    setDealToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditDeal = (deal: CRMDeal) => {
    // Navigate to deal detail page
    router.push(`/crm/deals/${deal.id}`);
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

    const newColumns = [...columns];
    const draggedIndex = newColumns.findIndex((c) => c.id === draggedColumn.id);
    const targetIndex = newColumns.findIndex((c) => c.id === targetColumn.id);

    [newColumns[draggedIndex], newColumns[targetIndex]] = [
      newColumns[targetIndex],
      newColumns[draggedIndex],
    ];

    const updatedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index,
    }));

    setColumns(updatedColumns);

    try {
      await Promise.all(
        updatedColumns.map((col) =>
          fetch(`/api/crm/deal-columns/${col.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: col.order }),
          }),
        ),
      );
    } catch (error) {
      console.error("Error reordering columns:", error);
      fetchColumns();
    }

    setDraggedColumn(null);
  };

  const collapseEmptyColumns = () => {
    const emptyColumnIds = columns
      .filter((col) => getDealsByColumn(col.stage).length === 0)
      .map((col) => col.id);
    
    const newCollapsed = new Set(collapsedColumns);
    emptyColumnIds.forEach((id) => newCollapsed.add(id));
    setCollapsedColumns(newCollapsed);
  };

  const expandNonEmptyColumns = () => {
    const nonEmptyColumnIds = columns
      .filter((col) => getDealsByColumn(col.stage).length > 0)
      .map((col) => col.id);
    
    const newCollapsed = new Set(collapsedColumns);
    nonEmptyColumnIds.forEach((id) => newCollapsed.delete(id));
    setCollapsedColumns(newCollapsed);
  };

  const handleScrollMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    
    // Don't start scroll drag if clicking on a deal card or button
    const target = e.target as HTMLElement;
    if (target.closest('[data-deal-card], button')) {
      return;
    }
    
    setIsScrollDragging(true);
    setScrollStartX(e.clientX);
    setScrollStartLeft(scrollContainerRef.current.scrollLeft);
  };

  useEffect(() => {
    if (!isScrollDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!scrollContainerRef.current) return;
      const delta = e.clientX - scrollStartX;
      scrollContainerRef.current.scrollLeft = scrollStartLeft - delta;
    };

    const handleMouseUp = () => {
      setIsScrollDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrollDragging, scrollStartX, scrollStartLeft]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-950 via-zinc-950 to-purple-950">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">CRM Pipeline</h1>
          <p className="text-zinc-400">
            {selectedBoard?.title || "Pipeline"} - Manage your sales deals
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsColumnManagementOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <IconColumns size={18} className="mr-2" />
            Manage Columns
          </Button>
          <Button
            onClick={collapseEmptyColumns}
            className="bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <IconChevronLeft size={18} className="mr-2" />
            Collapse Empty
          </Button>
          <Button
            onClick={expandNonEmptyColumns}
            className="bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <IconChevronDown size={18} className="mr-2" />
            Expand Non-Empty
          </Button>
          <Button
            onClick={() => handleAddDeal(columns[0]?.stage || "")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <IconPlus size={18} className="mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleScrollMouseDown}
        className={`flex gap-6 overflow-x-auto pb-4 min-h-[800px] ${isScrollDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {columns.map((column) => (
          <div
            key={column.id}
            className={`flex-shrink-0 ${collapsedColumns.has(column.id) ? 'w-16' : 'w-80'} bg-zinc-900 rounded-lg border border-zinc-800 cursor-move hover:border-zinc-700 transition-all`}
          >
            <div
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleColumnDragStart(column);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleColumnDragOver(e);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleColumnDrop(column);
              }}
              className={`p-4 border-b border-zinc-800 flex cursor-move ${collapsedColumns.has(column.id) ? 'flex-col items-center justify-start min-h-[250px]' : 'items-center justify-between'}`}
            >
              {!collapsedColumns.has(column.id) && (
              <div className="flex items-center gap-3 flex-1">
                <IconGripVertical size={18} className="text-zinc-500" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {column.title}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {getDealsByColumn(column.stage).length} deals
                  </p>
                </div>
              </div>
              )}
              <div className="flex gap-1 items-center">
                {collapsedColumns.has(column.id) && (
                  <p className="text-xs text-zinc-500 font-semibold">
                    {getDealsByColumn(column.stage).length}
                  </p>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const newCollapsed = new Set(collapsedColumns);
                    if (newCollapsed.has(column.id)) {
                      newCollapsed.delete(column.id);
                    } else {
                      newCollapsed.add(column.id);
                    }
                    setCollapsedColumns(newCollapsed);
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  {collapsedColumns.has(column.id) ? (
                    <IconChevronRight size={18} />
                  ) : (
                    <IconChevronDown size={18} />
                  )}
                </Button>
                {!collapsedColumns.has(column.id) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAddDeal(column.stage)}
                  className="text-zinc-400 hover:text-white"
                >
                  <IconPlus size={18} />
                </Button>
                )}
              </div>
              {collapsedColumns.has(column.id) && (
              <div className="transform -rotate-90 whitespace-nowrap mt-auto">
                <h3 className="text-lg font-semibold text-white">
                  {column.title}
                </h3>
              </div>
              )}
            </div>

            {!collapsedColumns.has(column.id) && (
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {getDealsByColumn(column.stage).map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onClick={() => handleEditDeal(deal)}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    setDraggedDeal(deal);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDrop(column.stage);
                  }}
                  data-deal-card
                  className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 cursor-grab hover:border-indigo-600 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white flex-1">
                      {deal.title}
                    </h4>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditDeal(deal)}
                        className="text-zinc-500 hover:text-white"
                      >
                        <IconEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="text-zinc-500 hover:text-red-500"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                  {deal.value && (
                    <p className="text-sm text-indigo-400 font-semibold mb-2">
                      ${deal.value}
                    </p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {deal.contact && (
                      <Badge variant="secondary" className="text-xs">
                        {deal.contact.name}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              {getReferencesByColumn(column.stage).map((ref) => (
                <div
                  key={ref.id}
                  className="p-3 bg-zinc-900 rounded-lg border border-dashed border-zinc-600 opacity-75"
                >
                  <p className="text-xs text-zinc-400">{ref.note}</p>
                </div>
              ))}
            </div>
            )}
          </div>
        ))}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <DealFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchDeals();
            setIsModalOpen(false);
          }}
          stage={selectedStage}
          boardId={selectedBoardId}
          dealToEdit={dealToEdit}
        />
      )}

      {isBoardManagementOpen && (
        <BoardManagementModal
          isOpen={isBoardManagementOpen}
          onClose={() => setIsBoardManagementOpen(false)}
          onBoardsChanged={() => {
            fetchBoards();
            setIsBoardManagementOpen(false);
          }}
        />
      )}

      {isColumnManagementOpen && (
        <ColumnManagementModal
          isOpen={isColumnManagementOpen}
          onClose={() => setIsColumnManagementOpen(false)}
          boardId={selectedBoardId}
          onColumnsUpdated={() => {
            fetchColumns();
            setIsColumnManagementOpen(false);
          }}
        />
      )}
    </div>
  );
}
