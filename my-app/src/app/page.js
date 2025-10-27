"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [myText, setMyText] = useState("");
  const [ws, setWs] = useState(null);
  const [polls, setPolls] = useState([]);
  const [userVotes, setUserVotes] = useState({}); // ✅ Track user vote states

  // --- WebSocket Setup ---
  useEffect(() => {
    const socket = new WebSocket("wss://task-backend-production-601a.up.railway.app/ws");

    socket.onopen = () => {
      console.log("✅ Connected to WebSocket");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "poll") {
        setPolls((prev) => [...prev, data.poll]);
      } 
      else if (data.type === "vote") {
        setPolls((prev) =>
          prev.map((p) => (p.id === data.poll.id ? data.poll : p))
        );
      }
      else if (data.type === "delete_poll") {
        setPolls((prev) => prev.filter((p) => p.id !== data.pollId));
      }
    };

    socket.onerror = (err) => console.error("⚠️ WebSocket error:", err);
    socket.onclose = (e) => {
      console.log("⚠️ Connection closed. Reconnecting...");
      setTimeout(() => window.location.reload(), 1500);
    };

    setWs(socket);
    return () => socket.close();
  }, []);

  // --- Add New Poll ---
  const addPoll = () => {
    if (!myText.trim() || !ws) return;
    ws.send(JSON.stringify({ type: "poll", poll: { question: myText.trim() } }));
    setMyText("");
  };

  // --- Vote on a Poll ---
  const votePoll = (id, voteType) => {
    if (!ws) return;

    const prevVote = userVotes[id];

    if (prevVote === voteType) return; // ✅ disable double vote

    ws.send(
      JSON.stringify({
        type: "vote",
        pollId: id,
        vote: voteType,
        removePrev: !!prevVote, // ✅ request backend to reverse old vote
      })
    );

    setUserVotes({ ...userVotes, [id]: voteType });
  };

  // --- Delete Poll ---
  const deletePoll = (id) => {
    if (!ws) return;
    ws.send(JSON.stringify({ type: "delete_poll", pollId: id }));

    setPolls((prev) => prev.filter((p) => p.id !== id));
    const updatedVotes = { ...userVotes };
    delete updatedVotes[id];
    setUserVotes(updatedVotes);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black text-black dark:text-white font-sans gap-6 p-4">
      <h1 className="text-3xl font-semibold mb-2">Real-time Poll</h1>

      {/* Input Section */}
      <div className="bg-white/10 p-4 rounded-lg border border-gray-300 w-full max-w-md flex gap-2">
        <input
          type="text"
          value={myText}
          onChange={(e) => setMyText(e.target.value)}
          placeholder="What's on your mind?"
          className="px-2 py-1 border rounded-md w-full text-black dark:text-white bg-white/90 dark:bg-gray-800"
          onKeyDown={(e) => e.key === "Enter" && addPoll()}
        />
        <button
          onClick={addPoll}
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all"
        >
          Add
        </button>
      </div>

      {/* Polls List */}
      <div className="bg-white/10 p-4 rounded-lg border border-gray-300 w-full max-w-md shadow-sm">
        <p className="mb-2 font-medium">Active Polls:</p>
        {polls.length === 0 ? (
          <p className="text-gray-500 text-sm">No polls yet. Add one!</p>
        ) : (
          <ul className="text-sm space-y-2 max-h-64 overflow-y-auto">
            {polls.map((p) => (
              <li
                key={p.id}
                className="flex justify-between items-center border-b pb-1"
              >
                <span className="truncate">{p.question}</span>
                <div className="flex gap-2">
                  
                  {/* Like Button */}
                  <button
                    onClick={() => votePoll(p.id, "like")}
                    disabled={userVotes[p.id] === "like"}
                    className={`px-2 py-1 rounded-md transition-all
                      ${userVotes[p.id] === "like"
                        ? "bg-green-700 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"}`}
                  >
                    Like:- {p.likes}
                  </button>

                  {/* Dislike Button */}
                  <button
                    onClick={() => votePoll(p.id, "dislike")}
                    disabled={userVotes[p.id] === "dislike"}
                    className={`px-2 py-1 rounded-md transition-all
                      ${userVotes[p.id] === "dislike"
                        ? "bg-red-700 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600"}`}
                  >
                    Dislike:- {p.dislikes}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => deletePoll(p.id)}
                    className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Delete
                  </button>

                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
