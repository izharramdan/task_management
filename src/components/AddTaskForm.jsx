import React, { useState, useEffect } from "react";
import axios from "axios";

const AddTaskForm = ({ onSubmit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [staffUsers, setStaffUsers] = useState([]);
  const defaultStatusId = "1";

  useEffect(() => {
    fetchStaffUsers();
  }, []);

  const fetchStaffUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/users");
      const staffUsers = response.data.filter((user) => user.role === "Staff");
      setStaffUsers(staffUsers);
    } catch (error) {
      console.error("Error fetching staff users: ", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      deadline,
      assignedTo,
      statusId: defaultStatusId,
    });
    setTitle("");
    setDescription("");
    setDeadline("");
    setAssignedTo("");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div>
        <label className="block">
          <span className="text-gray-700">Title:</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          />
        </label>
      </div>
      <div>
        <label className="block">
          <span className="text-gray-700">Description:</span>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          />
        </label>
      </div>
      <div>
        <label className="block">
          <span className="text-gray-700">Deadline:</span>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          />
        </label>
      </div>
      <div>
        <label className="block">
          <span className="text-gray-700">Assigned To:</span>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          >
            <option value="">Select user</option>
            {staffUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Submit
      </button>
    </form>
  );
};

export default AddTaskForm;
