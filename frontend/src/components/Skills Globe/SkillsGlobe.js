import React, { useEffect, useRef, useState } from 'react';
import { 
  FaReact, FaPython, FaJs, FaDocker, FaGitAlt, FaNodeJs,
  FaHtml5, FaCss3Alt, FaAws, FaDatabase, FaServer, FaLinux
} from 'react-icons/fa';
import { 
  SiTypescript, SiMongodb, SiPostgresql, SiRedis, 
  SiKubernetes, SiTensorflow, SiNumpy, SiPandas,
  SiJupyter, SiLinux, SiNginx, SiR
} from 'react-icons/si';
import { MdScience } from 'react-icons/md';
import bioData from '../../data/bio.json';
import styles from './SkillsGlobe.module.css';

/* ============================================================================
 * SKILLS GLOBE COMPONENT
 * ============================================================================
 * Interactive 3D globe showing skills and technologies dynamically from bio.json
 * Uses CSS variables for theming
 * ============================================================================
 */

// Icon mapping - maps icon strings to actual React icon components
const ICON_MAP = {
  FaReact, FaPython, FaJs, FaDocker, FaGitAlt, FaNodeJs,
  FaHtml5, FaCss3Alt, FaAws, FaDatabase, FaServer, FaLinux,
  SiTypescript, SiMongodb, SiPostgresql, SiRedis,
  SiKubernetes, SiTensorflow, SiNumpy, SiPandas,
  SiJupyter, SiLinux, SiNginx, SiR, MdScience
};

// Load skills from bio.json and transform into globe format
const loadSkillsFromBio = () => {
  return bioData.technicalSkills.map((skill, index) => ({
    name: skill.name,
    icon: ICON_MAP[skill.icon] || FaReact,
    size: 1.0 + (Math.random() * 0.3), // Vary size slightly
    color: skill.color,
    category: skill.category
  }));
};

const SKILLS = loadSkillsFromBio();

// Helper function to get CSS variable value
const getCSSVariable = (variable) => {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

const SkillsGlobe = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });
  const [visibleNodes, setVisibleNodes] = useState([]);
  const animationRef = useRef(null);
  const rotationRef = useRef({ x: 0, y: 0, autoRotate: true });
  const mouseRef = useRef({ x: 0, y: 0, isDragging: false });
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const skillNodesRef = useRef([]);
  const connectionsRef = useRef([]);

  // Initialize skill positions on a sphere
  useEffect(() => {
    const nodes = SKILLS.map((skill, index) => {
      const phi = Math.acos(-1 + (2 * index) / SKILLS.length);
      const theta = Math.sqrt(SKILLS.length * Math.PI) * phi;
      
      return {
        ...skill,
        x: Math.cos(theta) * Math.sin(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(phi),
        scale: 1,
        index,
      };
    });
    skillNodesRef.current = nodes;

    // Create stable connections between nearby nodes
    const connections = [];
    nodes.forEach((node, i) => {
      nodes.forEach((otherNode, j) => {
        if (i < j) {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const dz = node.z - otherNode.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          // Connect nodes that are close to each other
          if (distance < 1.2) {
            connections.push([i, j]);
          }
        }
      });
    });
    connectionsRef.current = connections;
  }, []);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        // Match the CSS max-width breakpoints and maintain aspect ratio
        let height;
        if (width >= 1440) {
          height = 1000; // Large Desktop: 1600x1000
        } else if (width >= 1024) {
          height = 800; // Desktop: 1200x800
        } else if (width >= 768) {
          height = 700; // Tablet: 900x700
        } else if (width >= 480) {
          height = 500; // Small tablet: 600x500
        } else {
          height = 400; // Mobile: 400x400
        }
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Mouse/Touch interaction - Fixed for proper rotation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e) => {
      mouseRef.current.isDragging = true;
      rotationRef.current.autoRotate = false;
      const rect = container.getBoundingClientRect();
      lastMouseRef.current = {
        x: (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left,
        y: (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top,
      };
    };

    const handleMouseMove = (e) => {
      if (!mouseRef.current.isDragging) return;
      
      const rect = container.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top;
      
      // Calculate delta from last position
      const deltaX = x - lastMouseRef.current.x;
      const deltaY = y - lastMouseRef.current.y;
      
      // Update rotation based on drag delta
      rotationRef.current.y += deltaX * 0.01;
      rotationRef.current.x += deltaY * 0.01;
      
      lastMouseRef.current = { x, y };
    };

    const handleMouseUp = () => {
      mouseRef.current.isDragging = false;
      rotationRef.current.autoRotate = true;
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);
    container.addEventListener('touchstart', handleMouseDown);
    container.addEventListener('touchmove', handleMouseMove);
    container.addEventListener('touchend', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseUp);
      container.removeEventListener('touchstart', handleMouseDown);
      container.removeEventListener('touchmove', handleMouseMove);
      container.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const radius = Math.min(dimensions.width, dimensions.height) / 2.5;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Get CSS variable for colors
    const getPrimaryTextColor = () => getCSSVariable('--primary-text-color');

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Update rotation smoothly
      if (rotationRef.current.autoRotate) {
        rotationRef.current.y += 0.002;
      }

      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);
      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);

      // Transform and sort nodes by z-depth
      const transformedNodes = skillNodesRef.current.map(node => {
        // Rotate around Y axis
        let x = node.x * cosY - node.z * sinY;
        let z = node.x * sinY + node.z * cosY;
        let y = node.y;

        // Rotate around X axis
        const newY = y * cosX - z * sinX;
        z = y * sinX + z * cosX;
        y = newY;

        const scale = (z + 2) / 3; // Perspective scale
        const screenX = centerX + x * radius;
        const screenY = centerY + y * radius;

        return {
          ...node,
          screenX,
          screenY,
          depth: z,
          scale: scale * node.size,
          visible: z > -0.5, // Only show nodes on front hemisphere
        };
      }).sort((a, b) => a.depth - b.depth);

      // Get primary text color from CSS variable
      const primaryColor = getPrimaryTextColor();
      
      // Draw stable connections using primary text color
      ctx.strokeStyle = primaryColor;
      ctx.globalAlpha = 0.15;
      ctx.lineWidth = 1;
      
      connectionsRef.current.forEach(([i, j]) => {
        const nodeA = transformedNodes.find(n => n.index === i);
        const nodeB = transformedNodes.find(n => n.index === j);
        
        // Only draw if both nodes are visible
        if (nodeA && nodeB && nodeA.visible && nodeB.visible) {
          ctx.beginPath();
          ctx.moveTo(nodeA.screenX, nodeA.screenY);
          ctx.lineTo(nodeB.screenX, nodeB.screenY);
          ctx.stroke();
        }
      });
      
      ctx.globalAlpha = 1;

      // Update visible nodes for React icon overlay
      const visibleNodesData = transformedNodes
        .filter(node => node.visible)
        .map(node => ({
          ...node,
          size: 25 * node.scale,
          opacity: 0.3 + node.depth * 0.4
        }));
      
      setVisibleNodes(visibleNodesData);

      // Draw circles as backgrounds for the icons
      visibleNodesData.forEach(node => {
        // Draw circle background with skill-specific color
        ctx.fillStyle = node.color;
        ctx.globalAlpha = node.opacity * 0.25;
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, node.size * 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]);

  return (
    <div className={styles.container} ref={containerRef}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className={styles.canvas}
      />
      {/* React Icon Overlays */}
      {visibleNodes.map((node, index) => {
        const IconComponent = node.icon;
        const iconSize = node.size * 1.2;
        
        return (
          <IconComponent
            key={`${node.name}-${index}`}
            className={styles.iconOverlay}
            style={{
              position: 'absolute',
              left: `${node.screenX}px`,
              top: `${node.screenY}px`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${iconSize}px`,
              color: node.color,
              opacity: node.opacity * 0.9,
              filter: `drop-shadow(0 0 ${node.size * 0.5}px ${node.color})`,
              pointerEvents: 'none',
              zIndex: Math.round(node.depth * 100) + 100,
              transition: 'none'
            }}
          />
        );
      })}
    </div>
  );
};

export default SkillsGlobe;