import React, { useEffect, useState } from "react";
import { marked } from "marked";
import styles from "./Projects.module.css";
import ScrollBar from "../components/ScrollBar";
import { useLoading } from "../context/LoadingContext";

const API_URL = process.env.NODE_ENV === "production"
  ? "https://francois0203-website-backend.onrender.com/api/repos"
  : "http://localhost:3000/api/repos"; // Automatically switch based on environment

const Projects = () => {
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState(null);
  const [expandedRepo, setExpandedRepo] = useState(null);
  const { setIsLoading } = useLoading(); // Access the loading context

  useEffect(() => {
    const fetchRepositories = async () => {
      setIsLoading(true); // Start the loading spinner
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setRepos(data);
      } catch (err) {
        console.error("Error fetching repositories:", err.message);
        setError(err.message);
      } finally {
        setIsLoading(false); // Stop the loading spinner
      }
    };

    fetchRepositories();
  }, [setIsLoading]);

  const toggleReadme = (repoId) => {
    setExpandedRepo(expandedRepo === repoId ? null : repoId);
  };

  if (error) {
    return <p className={styles.error}>Error: {error}</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Projects</h1>
      <ScrollBar>
        <div className={styles.projectGrid}>
          {repos.length === 0 ? (
            <p>No repositories found.</p>
          ) : (
            repos.map((repo) => (
              <div key={repo.id} className={styles.projectCard}>
                <h2>{repo.name}</h2>
                <p>{repo.description || "No description provided."}</p>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  View Repository
                </a>
                <button
                  className={styles.readmeToggle}
                  onClick={() => toggleReadme(repo.id)}
                >
                  {expandedRepo === repo.id ? "Hide README" : "Show README"}
                </button>
                {expandedRepo === repo.id && repo.readme && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked(repo.readme),
                    }}
                    className={styles.markdown}
                  ></div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollBar>
    </div>
  );
};

export default Projects;