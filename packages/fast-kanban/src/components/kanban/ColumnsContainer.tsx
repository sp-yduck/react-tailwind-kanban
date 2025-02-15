import React from "react";
import {
  DndContext,
  DragEndEvent,
  useDroppable,
  UniqueIdentifier,
  DragOverEvent,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useColumnItems, useKanbanCardItems } from "./Context";
import { ColumnItems } from "./types";

export function SortableColumnsContainer({
  className,
  data,
  columnRenderFunc,
}: {
  className?: string;
  data?: unknown;
  columnRenderFunc: (
    id: UniqueIdentifier,
    items: ColumnItems,
    data?: unknown
  ) => React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: "droppable" });
  const [cols, setCols] = useColumnItems();
  const [kanbanCards, setKanbanCards] = useKanbanCardItems();
  const sensors = useSensors(
    // mouse sensor with activation constraint
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    })
  );
  return (
    <DndContext onDragEnd={onDragEnd} onDragOver={onDragOver} sensors={sensors}>
      <SortableContext id="columns" items={cols}>
        <CardContent
          className={cn("flex space-x-4", className)}
          ref={setNodeRef}
        >
          {cols.map((col) =>
            columnRenderFunc(
              col.id,
              kanbanCards.filter((item) => item.column_id === col.id),
              data
            )
          )}
        </CardContent>
      </SortableContext>
    </DndContext>
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    // Im dropping a Column over another Column
    if (
      active.data.current?.type === "Column" &&
      over.data.current?.type === "Column"
    ) {
      if (activeId !== overId) {
        setCols((cols) => {
          const activeIndex = cols.findIndex((col) => col.id === activeId);
          const overIndex = cols.findIndex((col) => col.id === overId);
          return arrayMove(cols, activeIndex, overIndex);
        });
      }
    } else if (
      active.data.current?.type == "Task" &&
      over.data.current?.type === "Column"
    ) {
      // Im dropping a Task over a Column
      setKanbanCards((kanbanCards) => {
        const activeIndex = kanbanCards.findIndex(
          (card) => card.id === activeId
        );
        return kanbanCards.map((card, index) => {
          if (index === activeIndex) {
            return { ...card, column_id: overId };
          }
          return card;
        });
      });
    } else if (
      active.data.current?.type === "Task" &&
      over.data.current?.type === "Task"
    ) {
      // Im dropping a Task over another Task
      // sort the tasks in the same column
      if (active.data.current?.column_id === over.data.current?.column_id) {
        setKanbanCards((kanbanCards) => {
          const activeIndex = kanbanCards.findIndex(
            (card) => card.id === activeId
          );
          const overIndex = kanbanCards.findIndex((card) => card.id === overId);
          return arrayMove(kanbanCards, activeIndex, overIndex);
        });
      }
      // sort the tasks in different columns
      setKanbanCards((kanbanCards) => {
        const activeIndex = kanbanCards.findIndex(
          (card) => card.id === activeId
        );
        const overIndex = kanbanCards.findIndex((card) => card.id === overId);
        const activeCard = kanbanCards[activeIndex];
        const overCard = kanbanCards[overIndex];
        const newKanbanCards = kanbanCards.map((card) => {
          if (card.id === activeId) {
            return { ...card, column_id: overCard.column_id };
          } else if (card.id === overId) {
            return { ...card, column_id: activeCard.column_id };
          }
          return card;
        });
        return newKanbanCards;
      });
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!active || !over) return;
    if (active.id === over.id) return;
    if (
      active.data.current?.type === "Task" &&
      over.data.current?.type === "Column"
    ) {
      // change the column_id of the task to the column_id of the column being dragged over
      if (active.data.current?.column_id !== over.id) {
        setKanbanCards((kanbanCards) => {
          const activeIndex = kanbanCards.findIndex(
            (card) => card.id === active.id
          );
          return kanbanCards.map((card, index) => {
            if (index === activeIndex) {
              return { ...card, column_id: over.id };
            }
            return card;
          });
        });
      }
    } else if (
      active.data.current?.type === "Task" &&
      over.data.current?.type === "Task"
    ) {
      // change the column_id of the task to the column_id of the task being dragged over
      // and insert the task being dragged over to the position of the task being dragged
      const activeTask = kanbanCards.find((card) => card.id === active.id);
      const overTask = kanbanCards.find((card) => card.id === over.id);
      if (!activeTask || !overTask) return;
      const activeTaskColumnId = activeTask.column_id;
      const overTaskColumnId = overTask.column_id;
      if (activeTaskColumnId !== overTaskColumnId) {
        setKanbanCards((kanbanCards) => {
          const activeIndex = kanbanCards.findIndex(
            (card) => card.id === active.id
          );
          return kanbanCards.map((card, index) => {
            if (index === activeIndex) {
              return { ...card, column_id: overTaskColumnId };
            }
            return card;
          });
        });
      }
    }
  }
}
