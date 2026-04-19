import { useQuery } from "@tanstack/react-query";
import { getProjects } from "./api/project.api";

function App() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error...</p>;

  return (
    <div>
      <h1>Projects</h1>
      {data?.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}

export default App;
