"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ProjectCard from "./project-card";

// Yahan onMoveProject add kiya gaya hai
export function ProjectGrid({ projects, folderMap, onMoveProject }) {
  const router = useRouter();

  const handleEditProject = (projectId) => {
    router.push(`/editor/${projectId}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          folderMap={folderMap}
          onEdit={() => handleEditProject(project._id)}
          onMove={() => onMoveProject(project)} // <-- Ye function card ko pass kiya
        />
      ))}
    </div>
  );
}