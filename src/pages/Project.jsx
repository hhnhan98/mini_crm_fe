import { useEffect, useState } from "react";
import { getProjects } from "../api/project.api";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getProjects();
      setProjects(data);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Projects</h2>

      {projects.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
