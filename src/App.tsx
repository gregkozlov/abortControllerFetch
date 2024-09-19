import { useState, useEffect } from "react";
import useFetch from "./hooks";
import { BASE_URL } from "./constants";
import { Post, User } from "./types";

function App() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [postsUrl, setPostsUrl] = useState<string | null>(null);
  const { data: posts, loading: postsLoading, error: postsError } = useFetch<Post[]>(postsUrl);

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/users`);
        if (!response.ok) {
          throw new Error("Error fetching users");
        }
        const data = await response.json();
        setUsers(data);
        setUsersError(null);
      } catch (err) {
        if (err instanceof Error) {
          setUsersError(err.message);
        } else {
          setUsersError("Error occurred");
        }
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleGetPosts = (userId: number) => {
    setPostsUrl(`${BASE_URL}/posts?userId=${userId}`);
  };

  if (usersLoading) return <p>Loading users...</p>;
  if (usersError) return <p>Error loading users: {usersError}</p>;

  return (
    <div>
      <h1>User List</h1>
      {users &&
        users.map(user => (
          <div key={user.id} style={{ marginTop: "10px" }}>
            <span>{user.name}</span>
            <button onClick={() => handleGetPosts(user.id)} style={{ marginLeft: "10px" }}>
              Get Posts
            </button>
          </div>
        ))}

      <h2>Posts</h2>
      {postsLoading && <p>Loading posts...</p>}
      {postsError && <p>Error loading posts: {postsError}</p>}
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
