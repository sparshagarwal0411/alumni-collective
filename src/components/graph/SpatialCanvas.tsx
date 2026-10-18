import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import ForceGraph3D, { ForceGraphMethods } from 'react-force-graph-3d';
import * as THREE from 'three';
import {
  X,
  Route,
  Hand,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { GraphNode, GraphLink } from '@/types/database';
import { useNetworkStore } from '@/store/useNetworkStore';
import { dijkstraService } from '@/services/dijkstraService';

interface SpatialCanvasProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeSelect?: (node: GraphNode | null) => void;
  currentUserId?: string;
  className?: string;
}

// Robust Skill criteria matching across taxonomy slugs and synonyms
function matchSkillCriteria(nodeTags: string[], filterSkill: string): boolean {
  const norm = filterSkill.toLowerCase().trim();
  const synonyms: Record<string, string[]> = {
    'distributed systems': ['systems-infrastructure', 'distributed', 'cloud', 'kafka', 'microservices'],
    'rust': ['rust'],
    'pytorch': ['pytorch', 'ai-ml-engineering', 'python'],
    'kubernetes': ['kubernetes', 'cloud-platforms', 'systems-infrastructure'],
    'typescript': ['typescript', 'full-stack-product', 'react', 'next.js'],
    'machine learning': ['ai-ml-engineering', 'machine-learning', 'python', 'pytorch'],
    'go': ['go', 'microservices', 'systems-infrastructure'],
    'react': ['react', 'full-stack-product', 'next.js', 'ui-ux'],
    'low-latency c++': ['c++', 'cuda', 'systems-infrastructure', 'quant-algorithmic-trading'],
    'postgresql': ['postgresql', 'supabase', 'databases'],
  };

  const targets = synonyms[norm] || [norm];
  return (nodeTags || []).some((t) => {
    const slug = t.toLowerCase();
    return targets.some((tgt) => slug.includes(tgt) || tgt.includes(slug));
  });
}

// High-DPI canvas texture for clear, prominent executive nameplates
function createNodeLabelTexture(
  node: GraphNode,
  dark: boolean,
  focused: boolean,
  hovered: boolean,
  isSource: boolean,
  isPathNode: boolean,
  isBridgeNode: boolean
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 170;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const pad = 6;
  const w = canvas.width - pad * 2;
  const h = canvas.height - pad * 2;
  const cornerRadius = 14;

  // Background Box
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(pad, pad, w, h, cornerRadius);
  } else {
    ctx.rect(pad, pad, w, h);
  }

  // Card Fill: Solid, high opacity for maximum contrast & readability
  if (dark) {
    ctx.fillStyle = focused || hovered ? 'rgba(26, 23, 20, 0.98)' : 'rgba(18, 16, 14, 0.96)';
  } else {
    ctx.fillStyle = focused || hovered ? 'rgba(255, 255, 255, 0.99)' : 'rgba(246, 242, 233, 0.97)';
  }
  ctx.fill();

  // Card Border: Golden highlight on path/focus, Blue for You, Amber for bridge, crisp subtle border default
  ctx.lineWidth = focused || isPathNode ? 4.5 : isBridgeNode || hovered ? 3.5 : 2.0;
  if (focused || isPathNode) {
    ctx.strokeStyle = dark ? '#E5A95A' : '#C97D10'; // Warm Golden Highlight
  } else if (isSource) {
    ctx.strokeStyle = dark ? '#60A5FA' : '#2563EB'; // Blue for You
  } else if (isBridgeNode) {
    ctx.strokeStyle = dark ? '#E5A95A' : '#B87216'; // Bridge Mentor
  } else if (hovered) {
    ctx.strokeStyle = dark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(20, 18, 16, 0.90)';
  } else {
    ctx.strokeStyle = dark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(20, 18, 16, 0.28)';
  }
  ctx.stroke();

  // Top Row: Role Badge Pill ONLY for Current User [YOU], and Class/Branch
  const roleY = pad + 16;
  const roleH = 24;

  if (isSource) {
    const roleText = 'YOU';
    ctx.font = 'bold 14px "Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif';
    const roleW = ctx.measureText(roleText).width + 18;
    const roleX = pad + 20;

    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(roleX, roleY, roleW, roleH, 4);
    } else {
      ctx.rect(roleX, roleY, roleW, roleH);
    }
    ctx.fillStyle = dark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.15)';
    ctx.fill();

    ctx.fillStyle = dark ? '#93C5FD' : '#1D4ED8';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(roleText, roleX + 9, roleY + roleH / 2);
  }

  // Top Right: Branch Tag & Class (Bold solid black in light mode)
  const classText = node.gradYear ? `Class of '${String(node.gradYear).slice(-2)}` : (node.branch || '');
  ctx.font = 'bold 16px "Space Grotesk", monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = dark ? '#E8DEC8' : '#000000';
  ctx.fillText(classText, pad + w - 20, roleY + roleH / 2);

  // Middle Row: Big Bold Full Name (Increased to 38px)
  const displayName = isSource ? `${node.name} (You)` : node.name;
  ctx.font = 'bold 38px "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  if (dark) {
    ctx.fillStyle = focused || isPathNode ? '#FFD580' : isSource ? '#93C5FD' : '#FFFFFF';
  } else {
    ctx.fillStyle = focused || isPathNode ? '#B36B15' : isSource ? '#1D4ED8' : '#000000';
  }

  const maxTextW = w - 40;
  let truncatedName = displayName;
  if (ctx.measureText(truncatedName).width > maxTextW) {
    while (truncatedName.length > 3 && ctx.measureText(truncatedName + '…').width > maxTextW) {
      truncatedName = truncatedName.slice(0, -1);
    }
    truncatedName += '…';
  }
  ctx.fillText(truncatedName, pad + 20, pad + 82);

  // Bottom Row: Subtitle (Solid bold black in light mode, white in dark mode)
  let subtitle = '';
  if (node.company) {
    subtitle = `${node.company} · ${node.headline || node.branch || 'Campus'}`;
  } else if (node.headline) {
    subtitle = `${node.headline} · ${node.branch || 'Campus'}`;
  } else {
    subtitle = `${node.branch || 'NSUT'} · Batch of ${node.gradYear || 2025}`;
  }

  ctx.font = 'bold 20px "Space Grotesk", monospace';
  if (dark) {
    ctx.fillStyle = focused || isPathNode ? '#FFFFFF' : '#E8DEC8';
  } else {
    ctx.fillStyle = '#000000';
  }

  let truncatedSub = subtitle;
  if (ctx.measureText(truncatedSub).width > maxTextW) {
    while (truncatedSub.length > 3 && ctx.measureText(truncatedSub + '…').width > maxTextW) {
      truncatedSub = truncatedSub.slice(0, -1);
    }
    truncatedSub += '…';
  }
  ctx.fillText(truncatedSub, pad + 20, pad + 130);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const SpatialCanvas: React.FC<SpatialCanvasProps> = ({
  nodes,
  links,
  onNodeSelect,
  currentUserId = 'usr-stud-01',
  className = '',
}) => {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const textureCacheRef = useRef<Map<string, THREE.CanvasTexture>>(new Map());

  // Navigation & Pan Drag State
  const [isPanMode, setIsPanMode] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const isDraggingPanRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNode, setLocalHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Realtime canvas dimensions tracking for responsive, glitch-free horizontal panel resizing
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = (w: number, h: number) => {
      const floorW = Math.floor(w);
      const floorH = Math.floor(h);
      if (floorW > 0 && floorH > 0) {
        setDimensions((prev) => (prev.width === floorW && prev.height === floorH ? prev : { width: floorW, height: floorH }));
        if (fgRef.current) {
          const fg = fgRef.current as any;
          if (typeof fg.width === 'function') fg.width(floorW);
          if (typeof fg.height === 'function') fg.height(floorH);
        }
      }
    };

    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      updateSize(rect.width, rect.height);
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        updateSize(width, height);
      }
    });

    ro.observe(container);

    return () => ro.disconnect();
  }, []);

  // Reactive Dark/Light Mode Theme Detection
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    updateTheme();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          updateTheme();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('storage', updateTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', updateTheme);
    };
  }, []);

  // Cleanup texture cache on unmount
  useEffect(() => {
    const cache = textureCacheRef.current;
    return () => {
      cache.forEach((tex) => tex.dispose());
      cache.clear();
    };
  }, []);

  // Zustand Store
  const {
    focusedNodeId,
    hoveredNodeId,
    shortestPathNodeIds,
    isCalculatingPath,
    activeFilters,
    setFocusedNode,
    setHoveredNode,
    setShortestPath,
    clearPath,
    setIsCalculatingPath,
  } = useNetworkStore();

  // Pre-calculate path nodes set & consecutive edge key set for O(1) checks
  const pathNodeSet = useMemo(() => new Set(shortestPathNodeIds), [shortestPathNodeIds]);

  const bridgeNodeIds = useMemo(() => {
    return new Set(shortestPathNodeIds.filter((id) => id !== currentUserId && id !== focusedNodeId));
  }, [shortestPathNodeIds, currentUserId, focusedNodeId]);

  const pathEdgeSet = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < shortestPathNodeIds.length - 1; i++) {
      const u = shortestPathNodeIds[i];
      const v = shortestPathNodeIds[i + 1];
      set.add(`${u}->${v}`);
      set.add(`${v}->${u}`);
    }
    return set;
  }, [shortestPathNodeIds]);

  // Compute node degree (hub/kendra detection)
  const nodeDegrees = useMemo(() => {
    const deg = new Map<string, number>();
    for (const link of links) {
      const s = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const t = typeof link.target === 'object' ? (link.target as any).id : link.target;
      deg.set(s, (deg.get(s) || 0) + 1);
      deg.set(t, (deg.get(t) || 0) + 1);
    }
    return deg;
  }, [links]);

  // Common Ground / Shared Points Calculation
  const commonGround = useMemo(() => {
    if (!focusedNodeId || focusedNodeId === currentUserId) return null;
    const user = nodes.find((n) => n.id === currentUserId);
    const target = nodes.find((n) => n.id === focusedNodeId);
    if (!user || !target) return null;

    const sharedTags: string[] = [];
    if (user.branch === target.branch) {
      sharedTags.push(`Branch: ${user.branch}`);
    }
    const userTags = user.tags || [];
    const targetTags = target.tags || [];

    userTags.forEach((ut) => {
      if (targetTags.some((tt) => tt.toLowerCase() === ut.toLowerCase())) {
        sharedTags.push(ut);
      }
    });

    const hops = shortestPathNodeIds.length > 1 ? shortestPathNodeIds.length - 1 : 0;
    const bridgeNames = shortestPathNodeIds
      .filter((id) => id !== currentUserId && id !== focusedNodeId)
      .map((id) => nodes.find((n) => n.id === id)?.name || id);

    return {
      sharedTags,
      hops,
      bridgeNames,
      targetName: target.name,
      targetCompany: target.company,
      targetBranch: target.branch,
    };
  }, [focusedNodeId, currentUserId, nodes, shortestPathNodeIds]);

  // Filter Matching Logic - handles all criteria with robust synonym matching
  const matchingNodeIds = useMemo(() => {
    const { company, sector, branch, skills, gradYearRange, searchQuery } = activeFilters;
    const hasFilters =
      company || sector || branch || skills.length > 0 || gradYearRange || searchQuery.trim().length > 0;

    if (!hasFilters) return null; // all match

    const matches = new Set<string>();
    const query = searchQuery.toLowerCase().trim();

    for (const node of nodes) {
      if (company && node.company !== company) continue;
      if (branch && node.branch !== branch) continue;
      if (gradYearRange && (node.gradYear < gradYearRange[0] || node.gradYear > gradYearRange[1])) continue;
      if (skills.length > 0 && !skills.some((s) => matchSkillCriteria(node.tags || [], s))) continue;
      if (sector && !(node.tags || []).some((t) => t.toLowerCase().includes(sector.toLowerCase()))) continue;
      if (query) {
        const text = `${node.name} ${node.company || ''} ${node.city || ''} ${node.branch} ${node.headline || ''} ${(node.tags || []).join(' ')}`.toLowerCase();
        if (!text.includes(query)) continue;
      }
      matches.add(node.id);
    }
    return matches;
  }, [nodes, activeFilters]);

  // Texture Cache accessor
  const getCachedTexture = useCallback(
    (
      node: GraphNode,
      dark: boolean,
      focused: boolean,
      hovered: boolean,
      isSource: boolean,
      isPathNode: boolean,
      isBridgeNode: boolean
    ) => {
      const key = `${node.id}_${dark ? 'd' : 'l'}_${focused ? 'f' : hovered ? 'h' : 'n'}_${isSource ? 'y' : 'o'}_${isPathNode ? 'p' : 'np'}_${isBridgeNode ? 'b' : 'nb'}`;
      let tex = textureCacheRef.current.get(key);
      if (!tex) {
        tex = createNodeLabelTexture(node, dark, focused, hovered, isSource, isPathNode, isBridgeNode);
        textureCacheRef.current.set(key, tex);
      }
      return tex;
    },
    []
  );

  // Memoize graphData to prevent recreation and physics reset on every re-render
  const graphData = useMemo(() => ({ nodes, links }), [nodes, links]);

  // Set initial camera framing & configure physics forces on canvas mount
  useEffect(() => {
    if (!fgRef.current) return;
    fgRef.current.cameraPosition({ x: 0, y: 0, z: 280 }, { x: 0, y: 0, z: 0 }, 0);

    const charge = fgRef.current.d3Force('charge') as any;
    if (charge) {
      charge.strength(-85).distanceMax(300);
    }
    const link = fgRef.current.d3Force('link') as any;
    if (link) {
      link.distance(75).strength(0.65);
    }
  }, [graphData]);

  // Set initial camera framing & configure physics forces on canvas mount (Increased graph size)
  useEffect(() => {
    if (!fgRef.current) return;
    fgRef.current.cameraPosition({ x: 0, y: 0, z: 220 }, { x: 0, y: 0, z: 0 }, 0);

    const charge = fgRef.current.d3Force('charge') as any;
    if (charge) {
      charge.strength(-140).distanceMax(450);
    }
  }, [graphData]);

  // OrbitControls setup (Auto-rotation toggleable)
  useEffect(() => {
    if (!fgRef.current) return;
    const controls = fgRef.current.controls() as any;
    if (controls) {
      controls.autoRotate = isRotating && !isPanMode;
      controls.autoRotateSpeed = 0.8;
      controls.enablePan = true;
      controls.screenSpacePanning = true;
      controls.enableRotate = !isPanMode;
    }
  }, [isPanMode, isRotating]);

  // Reset Camera Coordinates
  const handleResetCamera = useCallback(() => {
    if (!fgRef.current) return;
    fgRef.current.cameraPosition({ x: 0, y: 0, z: 220 }, { x: 0, y: 0, z: 0 }, 800);
  }, []);

  // Mathematical 2D Screen Pan Handler (Captures Left-drag in Pan Mode or Right-drag anytime)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMouseDown = (e: MouseEvent) => {
      // Only capture events occurring directly on the WebGL canvas, NEVER on toolbar buttons or overlays
      const target = e.target as HTMLElement;
      if (target.tagName !== 'CANVAS') return;

      // Pan on right-click OR on left-click when in Pan Mode
      if ((isPanMode && e.button === 0) || e.button === 2) {
        isDraggingPanRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingPanRef.current && fgRef.current && container) {
        const dx = e.clientX - lastMousePosRef.current.x;
        const dy = e.clientY - lastMousePosRef.current.y;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };

        const fg = fgRef.current as any;
        const camera = fg.camera?.() as THREE.PerspectiveCamera | undefined;
        const controls = fg.controls?.() as any;

        if (camera && controls) {
          const rect = container.getBoundingClientRect();
          const target = controls.target || new THREE.Vector3(0, 0, 0);
          const dist = camera.position.distanceTo(target);
          const vFov = (camera.fov * Math.PI) / 180;
          const heightAtDist = 2 * Math.tan(vFov / 2) * Math.max(10, dist);
          const worldPerPixel = heightAtDist / Math.max(1, rect.height);

          const moveX = -dx * worldPerPixel;
          const moveY = dy * worldPerPixel;

          const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
          const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

          const offset = right.multiplyScalar(moveX).add(up.multiplyScalar(moveY));
          camera.position.add(offset);
          if (controls.target) {
            controls.target.add(offset);
          }
          controls.update?.();
        }
        e.preventDefault();
      }
    };

    const onMouseUp = () => {
      isDraggingPanRef.current = false;
    };

    container.addEventListener('mousedown', onMouseDown, { capture: true });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      container.removeEventListener('mousedown', onMouseDown, { capture: true });
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isPanMode]);

  // Position tooltip relative to container on mouse move
  useEffect(() => {
    const handleMouseMoveTooltip = (e: MouseEvent) => {
      if (!hoveredNode || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    window.addEventListener('mousemove', handleMouseMoveTooltip);
    return () => window.removeEventListener('mousemove', handleMouseMoveTooltip);
  }, [hoveredNode]);

  // Prevent browser context menu on right-click to guarantee smooth right-drag panning
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleContext = (e: MouseEvent) => e.preventDefault();
    container.addEventListener('contextmenu', handleContext);
    return () => container.removeEventListener('contextmenu', handleContext);
  }, []);

  // Camera Pan Choreography on Node Focus
  useEffect(() => {
    if (focusedNodeId && fgRef.current) {
      const fg = fgRef.current as any;
      const simData = typeof fg.graphData === 'function' ? fg.graphData() : null;
      const simNodes = simData?.nodes || nodes;
      const targetNode = simNodes.find((n: any) => n.id === focusedNodeId);

      if (targetNode && typeof targetNode.x === 'number') {
        const nx = targetNode.x;
        const ny = targetNode.y;
        const nz = targetNode.z;

        fg.cameraPosition(
          { x: nx, y: ny, z: nz + 130 },
          { x: nx, y: ny, z: nz },
          900 // smooth 900ms ease pan
        );
      }
    }
  }, [focusedNodeId, nodes]);

  // Dijkstra Shortest-Path Trigger
  const triggerDijkstra = useCallback(
    async (targetNode: GraphNode) => {
      if (!currentUserId || targetNode.id === currentUserId) {
        clearPath();
        return;
      }

      setIsCalculatingPath(true);
      try {
        const result = await dijkstraService.findShortestPath(currentUserId, targetNode.id, links);
        setShortestPath(result.path, result.totalWeight);
      } catch (e) {
        console.error('Failed to calculate shortest path:', e);
        clearPath();
      } finally {
        setIsCalculatingPath(false);
      }
    },
    [currentUserId, links, setShortestPath, clearPath, setIsCalculatingPath]
  );

  // Reactive Effect: Whenever focusedNodeId changes from anywhere (3D canvas or left list pane), trigger Dijkstra!
  useEffect(() => {
    if (focusedNodeId && focusedNodeId !== currentUserId) {
      const target = nodes.find((n) => n.id === focusedNodeId);
      if (target) {
        triggerDijkstra(target);
      }
    } else if (!focusedNodeId) {
      clearPath();
    }
  }, [focusedNodeId, currentUserId, nodes, triggerDijkstra, clearPath]);

  // Handle Node Click
  const handleNodeClick = useCallback(
    (node: any) => {
      const graphNode = node as GraphNode;
      const isAlreadyFocused = focusedNodeId === graphNode.id;

      if (isAlreadyFocused) {
        setFocusedNode(null);
        clearPath();
        if (onNodeSelect) onNodeSelect(null);
      } else {
        setFocusedNode(graphNode.id);
        if (onNodeSelect) onNodeSelect(graphNode);
        triggerDijkstra(graphNode);
      }
    },
    [focusedNodeId, setFocusedNode, clearPath, onNodeSelect, triggerDijkstra]
  );

  // Handle Background Click
  const handleBackgroundClick = useCallback(() => {
    setFocusedNode(null);
    clearPath();
    if (onNodeSelect) onNodeSelect(null);
  }, [setFocusedNode, clearPath, onNodeSelect]);

  // Three.js Node Custom Object (Strict MeshBasicMaterial + Informative Billboard Sprite)
  const nodeThreeObject = useCallback(
    (node: any) => {
      const graphNode = node as GraphNode;
      const isFocused = graphNode.id === focusedNodeId;
      const isHovered = graphNode.id === hoveredNodeId;
      const isPath = pathNodeSet.has(graphNode.id);
      const isBridge = bridgeNodeIds.has(graphNode.id);
      const isSourceUser = graphNode.id === currentUserId;

      // Filter matching state
      const isMatch = matchingNodeIds === null || matchingNodeIds.has(graphNode.id);

      // Tiny sleek anchor pin radius (cards dominate readability)
      const degree = nodeDegrees.get(graphNode.id) || 1;
      let radius = graphNode.role === 'alumni' ? 1.4 : 1.2;
      if (degree > 4) radius += 0.3;

      if (isSourceUser) radius = 1.8;
      else if (isFocused) radius = 2.0;
      else if (isPath) radius = 1.8;
      else if (isBridge) radius = 1.6;
      else if (isHovered) radius += 0.5;

      // Color & Opacity Logic (Theme-adaptive)
      let color = isDark ? '#E8DEC8' : '#262320';
      let opacity = 1.0;

      if (isSourceUser) {
        color = isDark ? '#60A5FA' : '#2563EB'; // Clear Blue for "You"
      } else if (isFocused || isPath || isBridge) {
        color = isDark ? '#E5A95A' : '#C97D10'; // Warm Golden Highlight
      } else if (!isMatch) {
        color = isDark ? '#2A2623' : '#BFB5A3'; // Dimmed charcoal in dark, stone in light
        opacity = isDark ? 0.18 : 0.25;
      } else if (graphNode.role === 'student') {
        color = isDark ? '#D4A373' : '#8C532B'; // Warm ochre/sienna for students
      }

      const group = new THREE.Group();

      // Tiny Sphere Mesh
      const geometry = new THREE.SphereGeometry(radius, 20, 20);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: opacity < 1.0,
        opacity,
        wireframe: false,
      });
      group.add(new THREE.Mesh(geometry, material));

      // Small Golden Orbital Halo Ring
      if (isFocused || isPath || isSourceUser || isBridge) {
        const ringGeo = new THREE.RingGeometry(radius + 0.6, radius + 1.2, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(
            isSourceUser
              ? isDark
                ? '#60A5FA'
                : '#2563EB'
              : isDark
                ? '#E5A95A'
                : '#C97D10'
          ),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
        });
        group.add(new THREE.Mesh(ringGeo, ringMat));
      }

      // Prominent, executive nameplate card (Scaled to 48 x 12.75 for maximum legibility)
      const texture = getCachedTexture(graphNode, isDark, isFocused, isHovered, isSourceUser, isPath, isBridge);
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: !isMatch ? (isDark ? 0.16 : 0.20) : isHovered || isFocused || isPath ? 1.0 : 0.96,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(48, 12.75, 1);
      sprite.position.set(0, -(radius + 8.5), 0);
      sprite.renderOrder = 999;
      group.add(sprite);

      return group;
    },
    [
      focusedNodeId,
      hoveredNodeId,
      pathNodeSet,
      bridgeNodeIds,
      currentUserId,
      matchingNodeIds,
      nodeDegrees,
      isDark,
      getCachedTexture,
    ]
  );

  // Link Color (Dark mode: connections are white; Light mode: connections are black; 100% Opaque Golden highlight for Dijkstra path)
  const linkColor = useCallback(
    (link: any) => {
      const s = typeof link.source === 'object' ? link.source.id : link.source;
      const t = typeof link.target === 'object' ? link.target.id : link.target;
      const isPathEdge = pathEdgeSet.has(`${s}->${t}`);

      if (isPathEdge) {
        return isDark ? 'rgba(245, 175, 45, 1.0)' : 'rgba(217, 119, 6, 1.0)'; // 100% OPAQUE GOLD BEAM
      }

      const isConnectedToHovered = hoveredNodeId && (s === hoveredNodeId || t === hoveredNodeId);
      const isConnectedToFocused = focusedNodeId && (s === focusedNodeId || t === focusedNodeId);

      if (isConnectedToHovered || isConnectedToFocused) {
        return isDark ? 'rgba(255, 255, 255, 1.0)' : 'rgba(20, 18, 16, 1.0)';
      }

      // If a node is focused, keep unrelated background edges visible at 12% for context
      if (focusedNodeId) {
        return isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(20, 18, 16, 0.12)';
      }

      // Resting edge visibility: clear white in dark mode, clear black in light mode
      return isDark ? 'rgba(255, 255, 255, 0.38)' : 'rgba(20, 18, 16, 0.38)';
    },
    [pathEdgeSet, focusedNodeId, hoveredNodeId, isDark]
  );

  // Link Width (Solid, prominent stroke for opaque golden route)
  const linkWidth = useCallback(
    (link: any) => {
      const s = typeof link.source === 'object' ? link.source.id : link.source;
      const t = typeof link.target === 'object' ? link.target.id : link.target;
      if (pathEdgeSet.has(`${s}->${t}`)) return 3.2; // Solid, bold, 100% opaque golden route

      const isConnectedToHovered = hoveredNodeId && (s === hoveredNodeId || t === hoveredNodeId);
      const isConnectedToFocused = focusedNodeId && (s === focusedNodeId || t === focusedNodeId);
      if (isConnectedToHovered || isConnectedToFocused) return 2.0;

      if (focusedNodeId) return 0.7;

      return 1.2;
    },
    [pathEdgeSet, hoveredNodeId, focusedNodeId]
  );

  // Link Directional Particles (Disabled to eliminate jittery trace)
  const linkDirectionalParticles = useCallback(() => 0, []);

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative w-full h-full ${isDark ? 'bg-[#0E0D0C]' : 'bg-[#E8DEC8]'} overflow-hidden select-none cursor-default ${className}`}
    >
      {/* ── 3D Force Graph WebGL Engine ── */}
      <ForceGraph3D
        ref={fgRef as any}
        width={dimensions.width > 0 ? dimensions.width : undefined}
        height={dimensions.height > 0 ? dimensions.height : undefined}
        graphData={graphData}
        controlType="orbit"
        backgroundColor={isDark ? '#0E0D0C' : '#E8DEC8'}
        nodeThreeObject={nodeThreeObject}
        nodeLabel={() => ''} // custom HTML tooltip below
        onNodeHover={(node: any) => {
          if (isPanMode) return;
          const graphNode = node ? (node as GraphNode) : null;
          setLocalHoveredNode(graphNode);
          setHoveredNode(graphNode ? graphNode.id : null);
        }}
        onNodeClick={isPanMode ? undefined : handleNodeClick}
        onBackgroundClick={handleBackgroundClick}
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkOpacity={1.0}
        linkDirectionalParticles={linkDirectionalParticles}
        showNavInfo={false}
        enableNodeDrag={!isPanMode}
        enableNavigationControls={!isPanMode}
        warmupTicks={70}
        cooldownTicks={120}
        d3AlphaDecay={0.025}
        d3VelocityDecay={0.4}
      />

      {/* ── Flat Monospace Tooltip ── */}
      {hoveredNode && (
        <div
          className="pointer-events-none absolute z-30 transition-transform duration-75 ease-out"
          style={{
            left: `${tooltipPos.x + 14}px`,
            top: `${tooltipPos.y + 14}px`,
            transform: 'translate(0, 0)',
          }}
        >
          <div className="border border-border-ui bg-surface1 px-3.5 py-2.5 text-text-primary shadow-2xl backdrop-blur-md max-w-xs font-mono text-xs">
            <div className="flex items-center justify-between gap-3 border-b border-border-ui pb-1.5">
              <span className="font-bold text-sm text-text-primary tracking-tight">
                {hoveredNode.name}
              </span>
              <span
                className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 border ${
                  hoveredNode.role === 'alumni'
                    ? 'border-accent text-accent'
                    : 'border-blue-400 text-blue-400'
                }`}
              >
                {hoveredNode.role}
              </span>
            </div>

            <div className="mt-2 space-y-1 text-[11px]">
              {hoveredNode.company && (
                <div className="text-text-primary font-semibold">
                  {hoveredNode.company} · {hoveredNode.headline || 'Engineer'}
                </div>
              )}
              <div className="text-text-muted">
                {hoveredNode.branch} · Class of '{String(hoveredNode.gradYear).slice(-2)}
              </div>
              <div className="flex items-center gap-2 pt-1 text-[10px] text-accent">
                <span>{hoveredNode.bountyPoints} pts earned</span>
                <span>·</span>
                <span>{hoveredNode.distinctAlumniCount} connections</span>
              </div>
            </div>

            <div className="mt-2 pt-1.5 border-t border-border-ui text-[9px] text-text-muted flex items-center gap-1.5">
              <Route className="h-3 w-3 text-accent" />
              <span>Click to select · View connection path</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Top-Left: Shortest Route & Common Ground HUD Banner ── */}
      {commonGround && (
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 border border-amber-500/80 bg-surface1/95 p-3.5 backdrop-blur-md shadow-2xl text-text-primary font-mono text-xs max-w-md">
          <div className="flex items-center justify-between gap-3 border-b border-border-ui pb-2">
            <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-wider text-[11px]">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              <span>
                {isCalculatingPath
                  ? 'Finding Shortest Path...'
                  : commonGround.hops > 0
                  ? `Shortest Route (Gold) · ${commonGround.hops} ${commonGround.hops === 1 ? 'hop' : 'hops'}`
                  : 'Island Profile · Unconnected'}
              </span>
            </div>
            <button
              onClick={() => {
                setFocusedNode(null);
                clearPath();
              }}
              title="Clear Route"
              className="p-1 hover:text-amber-500 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Route Hop Breadcrumb or Island Guidance */}
          {commonGround.hops > 0 ? (
            <div className="text-[11px] text-text-muted flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="font-bold text-blue-400">You</span>
              {commonGround.bridgeNames.map((bName, i) => (
                <React.Fragment key={i}>
                  <span className="text-amber-400 font-bold">➔</span>
                  <span className="font-semibold text-amber-300">{bName}</span>
                </React.Fragment>
              ))}
              <span className="text-amber-400 font-bold">➔</span>
              <span className="font-bold text-amber-400">{commonGround.targetName}</span>
            </div>
          ) : (
            <p className="text-[11px] text-text-muted leading-relaxed">
              No verified trust path exists to <strong className="text-text-primary">{commonGround.targetName}</strong> yet. Claim a microtask or connect through mutual campus peers to build a direct bridge.
            </p>
          )}

          {/* Common Points Highlighting */}
          {commonGround.sharedTags.length > 0 && (
            <div className="mt-1 pt-1.5 border-t border-border-ui flex items-center gap-1.5 text-[10px] text-text-muted flex-wrap">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="font-bold text-text-primary">Shared Points:</span>
              {commonGround.sharedTags.map((tag, i) => (
                <span
                  key={i}
                  className="border border-border-ui bg-surface2 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Top-Right: Canvas Telemetry & Camera Controls ── */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 font-mono text-[10px]">
        {/* Node / Link Telemetry Pill */}
        <div className="border border-border-ui bg-surface1/90 px-3 py-1.5 backdrop-blur-md text-text-muted flex items-center gap-3 shadow-md">
          <span>
            <strong className="text-text-primary font-bold">{nodes.length}</strong> Nodes
          </span>
          <span>·</span>
          <span>
            <strong className="text-text-primary font-bold">{links.length}</strong> Connections
          </span>
        </div>

        {/* Pan Mode Button (Palm / Hand) */}
        <button
          onClick={() => setIsPanMode(!isPanMode)}
          title={isPanMode ? 'Pan Mode Active: Click to switch to Orbit / Select Mode' : 'Click to enable Pan Mode (Left Click Drag to Pan)'}
          className={`border px-2.5 py-1.5 transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
            isPanMode
              ? 'border-accent bg-accent text-[#0E0D0C] font-bold shadow-accent/20 ring-1 ring-accent'
              : 'border-border-ui bg-surface1 text-text-muted hover:text-text-primary hover:border-accent'
          }`}
        >
          <Hand className="h-3.5 w-3.5" />
          <span>{isPanMode ? 'Pan Active' : 'Pan'}</span>
        </button>

        {/* Auto Rotate Toggle (Play / Pause) */}
        <button
          onClick={() => setIsRotating(!isRotating)}
          title={isRotating ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
          className={`border p-1.5 transition-all cursor-pointer shadow-md ${
            isRotating
              ? 'border-accent bg-accent/20 text-accent ring-1 ring-accent'
              : 'border-border-ui bg-surface1 text-text-muted hover:text-text-primary hover:border-accent'
          }`}
        >
          {isRotating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>

        {/* Reset Camera Button */}
        <button
          onClick={handleResetCamera}
          title="Reset Camera Coordinates"
          className="border border-border-ui bg-surface1 p-1.5 text-text-muted hover:text-accent hover:border-accent transition-all cursor-pointer shadow-md"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
