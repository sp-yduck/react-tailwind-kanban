import { KanbanProvider } from "fast-kanban";
import DefaultKanban from "./components/DefaultKanban";
import JiraStyleKanban from "./components/JiraStyleKanban";

function App() {
  const initialColumnItems = [
    { id: "backlog" },
    { id: "to do" },
    { id: "in progress" },
    { id: "done" },
  ];
  const initialKanbanCardItems = [
    { id: "1", column_id: "backlog" },
    { id: "2", column_id: "backlog" },
    { id: "3", column_id: "to do" },
    { id: "4", column_id: "in progress" },
    { id: "5", column_id: "done" },
  ];

  return (
    <div className="py-12 space-y-12">
      <div className="text-5xl font-bold text-center">Fast Kanban</div>
      <div>
        <div className="bg-gray-100 p-8">
          <div className="text-xl px-2 py-4">Default UI</div>
          <KanbanProvider>
            <DefaultKanban
              columnItems={initialColumnItems}
              kanbanCardItems={initialKanbanCardItems}
            />
          </KanbanProvider>
        </div>
        <div className="p-8">
          <div className="text-xl px-2 py-4">Jira Style UI</div>
          <div>
            <KanbanProvider>
              <JiraStyleKanban
                columnItems={initialColumnItems}
                kanbanCardItems={initialKanbanCardItems}
              />
            </KanbanProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
