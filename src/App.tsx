import { useState, useRef } from "react";
import useFetch from "./hooks";
import { BASE_URL } from "./constants";
import { Post, User } from "./types";

function App() {
  const { data, loading, error } = useFetch<User[]>(`${BASE_URL}/users`);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPosts = async (userId: number) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    setLoadingUserId(userId);
    try {
      const response = await fetch(`${BASE_URL}/posts?userId=${userId}`, { signal });
      const data = await response.json();
      if (!signal.aborted) {
        setPosts(data);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error("Error fetching posts:", error);
      }
    } finally {
      if (!signal.aborted) {
        setLoadingUserId(null);
      }
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error loading users: {error}</p>;

  return (
    <div>
      <h1>User List</h1>
      {data &&
        data.map(user => (
          <div key={user.id} style={{ marginTop: "10px" }}>
            <span>{user.name}</span>
            <button onClick={() => fetchPosts(user.id)} disabled={loadingUserId === user.id} style={{ marginLeft: "10px" }}>
              {loadingUserId === user.id ? "Loading..." : "Get Posts"}
            </button>
          </div>
        ))}

      <h2>Posts</h2>
      {posts && (
        <ul>
          {posts.map(post => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
