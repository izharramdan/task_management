import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import AddTaskForm from "./AddTaskForm";

const Board = () => {
  const [statuses, setStatuses] = useState([]);
  const [tasksByStatus, setTasksByStatus] = useState({});
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const tasksResponse = await axios.get("http://localhost:3000/tasks");
      const statusesResponse = await axios.get(
        "http://localhost:3000/statuses"
      );
      const usersResponse = await axios.get("http://localhost:3000/users");

      setStatuses(statusesResponse.data);

      const tasksWithUsers = tasksResponse.data.map((task) => {
        const assignedUser = usersResponse.data.find(
          (user) => user.id === task.assignedTo
        );
        return {
          ...task,
          assignedUser: assignedUser ? assignedUser.username : "Unassigned",
        };
      });

      const tasksByStatusObj = {};
      statusesResponse.data.forEach((status) => {
        tasksByStatusObj[status.id] = tasksWithUsers.filter(
          (task) => task.statusId === status.id
        );
      });

      setTasksByStatus(tasksByStatusObj);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError("Failed to fetch data");
    }
  };

  const updateTaskOnServer = async (updatedTask) => {
    try {
      await axios.put(
        `http://localhost:3000/tasks/${updatedTask.id}`,
        updatedTask
      );
    } catch (error) {
      console.error("Error updating task on server: ", error);
      setError("Failed to update task on server");
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination || destination.index === source.index) return;

    try {
      const sourceStatusId = source.droppableId;
      const destinationStatusId = destination.droppableId;

      const movedTask = tasksByStatus[sourceStatusId][source.index];

      const updatedSourceTasks = [...tasksByStatus[sourceStatusId]];
      updatedSourceTasks.splice(source.index, 1);

      const updatedDestinationTasks = [...tasksByStatus[destinationStatusId]];
      updatedDestinationTasks.splice(destination.index, 0, movedTask);

      setTasksByStatus({
        ...tasksByStatus,
        [sourceStatusId]: updatedSourceTasks,
        [destinationStatusId]: updatedDestinationTasks,
      });

      movedTask.statusId = destinationStatusId;
      await updateTaskOnServer(movedTask);
    } catch (error) {
      console.error("Error updating task: ", error);
      setError("Failed to update task");
    }
  };

  const handleAddTask = async (newTask) => {
    try {
      const response = await axios.post("http://localhost:3000/tasks", {
        ...newTask,
        statusId: "1", 
      });

      const updatedTasks = [...tasksByStatus["1"], response.data];
      setTasksByStatus({ ...tasksByStatus, 1: updatedTasks });

      setShowAddTaskForm(false);
    } catch (error) {
      console.error("Error adding task: ", error);
      setError("Failed to add task");
    }
  };

  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => setShowAddTaskForm(true)}
      >
        Add Task
      </button>
      {showAddTaskForm && (
        <AddTaskForm onSubmit={handleAddTask} users={users} />
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex justify-center">
          {statuses.map((status) => (
            <div key={status.id} className="border rounded m-2 p-2">
              <h2 className="text-lg font-bold mb-2">{status.name}</h2>
              <Droppable droppableId={status.id} key={status.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {tasksByStatus[status.id]?.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white border rounded p-2 ${
                              snapshot.isDragging && "opacity-50"
                            }`}
                          >
                            <div>Title: {task.title}</div>
                            <div>Description: {task.description}</div>
                            <div>Assigned To: {task.assignedUser}</div>
                            <div>Deadline: {task.deadline}</div>
                            
                            {task.subtasks && task.subtasks.length > 0 && (
                              <div>
                                Subtasks:
                                <ul>
                                  {task.subtasks.map((subtask) => (
                                    <li key={subtask.id}>{subtask.title}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;
