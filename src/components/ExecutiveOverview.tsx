/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Employee } from "../data/mockData";
import { FilterState } from "./FilterBar";
import { 
  Users, 
  ShieldAlert, 
  Award, 
  TrendingDown, 
  Hourglass, 
  Calendar, 
  UserCheck, 
  Briefcase, 
  Building, 
  MapPin, 
  TrendingUp, 
  Sparkles, 
  Check, 
  Search, 
  User,
  ChevronLeft,
  ChevronRight,
  Sparkle,
  X,
  Target,
  ArrowUpRight,
  Info,
  Plus,
  Minus,
  Maximize2
} from "lucide-react";
import SectionHeader from "./SectionHeader";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line
} from "recharts";

interface ProvinceData {
  name: string;
  engName: string;
  status: "green" | "yellow" | "red";
  headcount: number;
  highPerfRatio: number;
  successionCoverage: number;
  retirementRisk: number;
  region: "North" | "Northeast" | "Central" | "South" | "East" | "West";
}

const THAI_REGIONS_MAP: Record<string, string> = {
  All: "ทุกภูมิภาค",
  North: "ภาคเหนือ",
  Northeast: "ภาคตะวันออกเฉียงเหนือ",
  Central: "ภาคกลาง",
  South: "ภาคใต้",
  East: "ภาคตะวันออก",
  West: "ภาคตะวันตก"
};

const PROVINCES_DATA: ProvinceData[] = [
  // North
  { name: "เชียงใหม่", engName: "Chiang Mai", status: "green", headcount: 45, highPerfRatio: 22, successionCoverage: 65, retirementRisk: 12, region: "North" },
  { name: "เชียงราย", engName: "Chiang Rai", status: "yellow", headcount: 28, highPerfRatio: 15, successionCoverage: 50, retirementRisk: 18, region: "North" },
  { name: "พิษณุโลก", engName: "Phitsanulok", status: "green", headcount: 32, highPerfRatio: 18, successionCoverage: 58, retirementRisk: 15, region: "North" },
  { name: "นครสวรรค์", engName: "Nakhon Sawan", status: "red", headcount: 18, highPerfRatio: 5, successionCoverage: 25, retirementRisk: 30, region: "North" },
  { name: "ลำปาง", engName: "Lampang", status: "yellow", headcount: 22, highPerfRatio: 12, successionCoverage: 45, retirementRisk: 20, region: "North" },
  // Northeast
  { name: "นครราชสีมา", engName: "Nakhon Ratchasima", status: "green", headcount: 55, highPerfRatio: 25, successionCoverage: 70, retirementRisk: 10, region: "Northeast" },
  { name: "ขอนแก่น", engName: "Khon Kaen", status: "green", headcount: 42, highPerfRatio: 20, successionCoverage: 62, retirementRisk: 14, region: "Northeast" },
  { name: "อุดรธานี", engName: "Udon Thani", status: "yellow", headcount: 35, highPerfRatio: 14, successionCoverage: 48, retirementRisk: 16, region: "Northeast" },
  { name: "อุบลราชธานี", engName: "Ubon Ratchathani", status: "yellow", headcount: 30, highPerfRatio: 13, successionCoverage: 45, retirementRisk: 22, region: "Northeast" },
  { name: "บุรีรัมย์", engName: "Buri Ram", status: "red", headcount: 15, highPerfRatio: 8, successionCoverage: 30, retirementRisk: 28, region: "Northeast" },
  // Central
  { name: "กรุงเทพมหานคร", engName: "Bangkok", status: "green", headcount: 1250, highPerfRatio: 28, successionCoverage: 72, retirementRisk: 8, region: "Central" },
  { name: "นนทบุรี", engName: "Nonthaburi", status: "green", headcount: 120, highPerfRatio: 22, successionCoverage: 65, retirementRisk: 10, region: "Central" },
  { name: "สมุทรปราการ", engName: "Samut Prakan", status: "yellow", headcount: 85, highPerfRatio: 16, successionCoverage: 55, retirementRisk: 12, region: "Central" },
  { name: "พระนครศรีอยุธยา", engName: "Ayutthaya", status: "green", headcount: 40, highPerfRatio: 19, successionCoverage: 60, retirementRisk: 15, region: "Central" },
  { name: "นครปฐม", engName: "Nakhon Pathom", status: "yellow", headcount: 34, highPerfRatio: 12, successionCoverage: 42, retirementRisk: 18, region: "Central" },
  // South
  { name: "สุราษฎร์ธานี", engName: "Surat Thani", status: "green", headcount: 38, highPerfRatio: 21, successionCoverage: 68, retirementRisk: 11, region: "South" },
  { name: "สงขลา", engName: "Songkhla", status: "yellow", headcount: 46, highPerfRatio: 14, successionCoverage: 50, retirementRisk: 15, region: "South" },
  { name: "ภูเก็ต", engName: "Phuket", status: "green", headcount: 25, highPerfRatio: 24, successionCoverage: 75, retirementRisk: 8, region: "South" },
  { name: "นครศรีธรรมราช", engName: "Nakhon Si Thammarat", status: "red", headcount: 20, highPerfRatio: 6, successionCoverage: 20, retirementRisk: 32, region: "South" },
  { name: "ตรัง", engName: "Trang", status: "yellow", headcount: 18, highPerfRatio: 11, successionCoverage: 40, retirementRisk: 22, region: "South" },
  // East
  { name: "ชลบุรี", engName: "Chon Buri", status: "green", headcount: 65, highPerfRatio: 26, successionCoverage: 74, retirementRisk: 9, region: "East" },
  { name: "ระยอง", engName: "Rayong", status: "green", headcount: 48, highPerfRatio: 23, successionCoverage: 68, retirementRisk: 11, region: "East" },
  { name: "ฉะเชิงเทรา", engName: "Chachoengsao", status: "yellow", headcount: 28, highPerfRatio: 15, successionCoverage: 52, retirementRisk: 14, region: "East" },
  { name: "จันทบุรี", engName: "Chanthaburi", status: "red", headcount: 12, highPerfRatio: 7, successionCoverage: 28, retirementRisk: 25, region: "East" },
  // West
  { name: "ราชบุรี", engName: "Ratchaburi", status: "green", headcount: 26, highPerfRatio: 18, successionCoverage: 55, retirementRisk: 15, region: "West" },
  { name: "กาญจนบุรี", engName: "Kanchanaburi", status: "yellow", headcount: 20, highPerfRatio: 13, successionCoverage: 46, retirementRisk: 18, region: "West" },
  { name: "ตาก", engName: "Tak", status: "red", headcount: 14, highPerfRatio: 5, successionCoverage: 22, retirementRisk: 35, region: "West" }
];

interface ThailandSvgMapProps {
  provinces: ProvinceData[];
  selectedProvinceName: string;
  selectedRegion: "All" | "North" | "Northeast" | "Central" | "South" | "East" | "West";
  onSelectProvince: (provinceName: string) => void;
}

const SVG_PROVINCE_ALIASES: Record<string, string> = {
  "Bangkok Metropolis": "Bangkok",
  "Phra Nakhon Si Ayutthaya": "Ayutthaya",
};

function ThailandSvgMap({
  provinces,
  selectedProvinceName,
  selectedRegion,
  onSelectProvince,
}: ThailandSvgMapProps) {
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isMapLoaded, setIsMapLoaded] = React.useState(false);
  const [isMapError, setIsMapError] = React.useState(false);

  // Zoom & Pan state
  const [zoom, setZoom] = React.useState(1);
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  
  // Track movement to separate click vs drag
  const dragMovedRef = React.useRef(false);
  const mouseDownPosRef = React.useRef({ x: 0, y: 0 });
  
  // Hover & Tooltip state
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [hoveredProvince, setHoveredProvince] = React.useState<{
    name: string;
    engName: string;
    headcount: number;
    status: string;
  } | null>(null);

  const provinceBySvgName = useMemo(() => {
    const result = new Map<string, ProvinceData>();

    provinces.forEach((province) => {
      result.set(province.engName, province);
    });

    Object.entries(SVG_PROVINCE_ALIASES).forEach(([svgName, dataName]) => {
      const matchedProvince = provinces.find((province) => province.engName === dataName);
      if (matchedProvince) result.set(svgName, matchedProvince);
    });

    return result;
  }, [provinces]);

  // Handle Mouse / Touch down for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    dragMovedRef.current = false;
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    setDragStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Update mouse position relative to container
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    if (isDragging) {
      const dx = e.clientX - mouseDownPosRef.current.x;
      const dy = e.clientY - mouseDownPosRef.current.y;
      if (Math.hypot(dx, dy) > 4) {
        dragMovedRef.current = true;
      }
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Mobile Touch pan support
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragMovedRef.current = false;
    const touch = e.touches[0];
    mouseDownPosRef.current = { x: touch.clientX, y: touch.clientY };
    setDragStart({
      x: touch.clientX - panOffset.x,
      y: touch.clientY - panOffset.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1 || !containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    
    setMousePos({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });

    const dx = touch.clientX - mouseDownPosRef.current.x;
    const dy = touch.clientY - mouseDownPosRef.current.y;
    if (Math.hypot(dx, dy) > 4) {
      dragMovedRef.current = true;
    }

    setPanOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  // Zoom button handlers
  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => Math.min(8, prev + 0.5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => {
      const nextZoom = Math.max(1, prev - 0.5);
      if (nextZoom === 1) {
        setPanOffset({ x: 0, y: 0 });
      }
      return nextZoom;
    });
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Load the Thailand SVG Map file
  React.useEffect(() => {
    let isMounted = true;

    async function loadThailandMap() {
      try {
        const response = await fetch("th.svg");
        if (!response.ok) throw new Error(`Cannot load map: ${response.status}`);

        const svgText = await response.text();
        if (!isMounted || !mapRef.current) return;

        mapRef.current.innerHTML = svgText;

        const svg = mapRef.current.querySelector("svg");
        if (!svg) throw new Error("SVG element not found");

        svg.removeAttribute("width");
        svg.removeAttribute("height");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.setAttribute("role", "img");
        svg.setAttribute("aria-label", "Thailand province map");
        svg.style.display = "block";
        svg.style.maxWidth = "100%";
        svg.style.maxHeight = "100%";

        // ซ่อนจุด/label ที่ติดมากับ SVG เพื่อให้เหลือเฉพาะตัวแผนที่จังหวัด
        svg.querySelector("#points")?.setAttribute("display", "none");
        svg.querySelector("#label_points")?.setAttribute("display", "none");

        setIsMapLoaded(true);
        setIsMapError(false);
      } catch (error) {
        console.error("Cannot load Thailand SVG map:", error);
        setIsMapLoaded(false);
        setIsMapError(true);
      }
    }

    loadThailandMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // Imperative wheel event registration (to allow e.preventDefault() smoothly)
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !isMapLoaded) return;

    const onWheelEvent = (e: WheelEvent) => {
      e.preventDefault();
      const zoomIntensity = 0.15;
      setZoom((prevZoom) => {
        let newZoom = prevZoom + (e.deltaY < 0 ? zoomIntensity : -zoomIntensity);
        newZoom = Math.max(1, Math.min(8, newZoom));
        if (newZoom === 1) {
          setPanOffset({ x: 0, y: 0 });
        }
        return newZoom;
      });
    };

    container.addEventListener("wheel", onWheelEvent, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheelEvent);
    };
  }, [isMapLoaded]);

  // Apply visual transformation styles to the SVG node
  React.useEffect(() => {
    const root = mapRef.current;
    if (!root || !isMapLoaded) return;
    const svg = root.querySelector("svg");
    if (!svg) return;

    svg.style.transition = isDragging ? "none" : "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)";
    svg.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`;
    svg.style.transformOrigin = "center center";
  }, [zoom, panOffset, isMapLoaded, isDragging]);

  // Bind interactions, status colors, hover states, and clicks to the SVG paths
  React.useEffect(() => {
    const root = mapRef.current;
    if (!root || !isMapLoaded) return;

    const paths = root.querySelectorAll<SVGPathElement>("path[name]");

    paths.forEach((path) => {
      const svgProvinceName = path.getAttribute("name") || "";
      const province = provinceBySvgName.get(svgProvinceName);
      const hasData = Boolean(province);
      const isSelected =
        province?.name === selectedProvinceName ||
        province?.engName === selectedProvinceName ||
        svgProvinceName === selectedProvinceName;
      const isInSelectedRegion = selectedRegion === "All" || province?.region === selectedRegion;

      path.style.transition = "fill 160ms ease, stroke 160ms ease, opacity 160ms ease";
      path.style.strokeLinejoin = "round";
      path.style.strokeLinecap = "round";
      path.style.cursor = isInSelectedRegion ? "pointer" : "default";
      path.style.outline = "none";

      // Base color styling
      let baseFill = "#F1F5F9"; // default for no data (Slate-100)
      let baseStroke = "#FFFFFF"; // Premium white borders

      if (hasData && province) {
        if (province.status === "green") {
          baseFill = "#D1FAE5"; // Emerald-100
        } else if (province.status === "yellow") {
          baseFill = "#FEF3C7"; // Amber-100
        } else if (province.status === "red") {
          baseFill = "#FFE4E6"; // Rose-100
        }
      }

      path.style.fill = baseFill;
      path.style.stroke = baseStroke;
      path.style.strokeWidth = "1";
      path.style.opacity = isInSelectedRegion ? "1" : "0.22";

      if (isSelected) {
        path.style.fill = "#BFDBFE"; // Premium selection fill (Blue-200)
        path.style.stroke = "#2563EB"; // Premium selection stroke (Blue-600)
        path.style.strokeWidth = "2.5";
        path.style.opacity = "1";
      }

      path.onmouseenter = () => {
        if (!isInSelectedRegion) return;
        if (!isSelected) {
          let hoverFill = "#E2E8F0"; // default hover for no data
          let hoverStroke = "#94A3B8";

          if (hasData && province) {
            if (province.status === "green") {
              hoverFill = "#A7F3D0"; // Emerald-200
              hoverStroke = "#10B981"; // Emerald-500
            } else if (province.status === "yellow") {
              hoverFill = "#FDE68A"; // Amber-200
              hoverStroke = "#F59E0B"; // Amber-500
            } else if (province.status === "red") {
              hoverFill = "#FECDD3"; // Rose-200
              hoverStroke = "#F43F5E"; // Rose-500
            }
          }

          path.style.fill = hoverFill;
          path.style.stroke = hoverStroke;
          path.style.strokeWidth = "1.5";
          path.style.opacity = "1";
        }
        
        // Show hover state / tooltip content
        setHoveredProvince({
          name: province?.name || svgProvinceName,
          engName: province?.engName || svgProvinceName,
          headcount: province?.headcount || 0,
          status: province?.status || "none",
        });
      };

      path.onmouseleave = () => {
        if (!isInSelectedRegion) return;
        if (!isSelected) {
          path.style.fill = baseFill;
          path.style.stroke = baseStroke;
          path.style.strokeWidth = "1";
          path.style.opacity = isInSelectedRegion ? "1" : "0.22";
        }
        
        // Clear hover state / tooltip content
        setHoveredProvince(null);
      };

      path.onclick = (e) => {
        e.stopPropagation();
        if (dragMovedRef.current) return;
        if (!isInSelectedRegion) return;
        onSelectProvince(province?.name || svgProvinceName);
      };

      path.setAttribute("tabindex", "0");
      path.setAttribute("aria-label", province ? province.name : svgProvinceName);
      path.onkeydown = (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        if (!isInSelectedRegion) return;
        onSelectProvince(province?.name || svgProvinceName);
      };

      // Remove default native titles
      const oldTitle = path.querySelector("title");
      oldTitle?.remove();
    });
  }, [isMapLoaded, provinceBySvgName, selectedProvinceName, selectedRegion, onSelectProvince]);

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUpOrLeave}
      className={`relative h-[560px] w-full overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 shadow-sm select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <div className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-[10px] font-light text-slate-500 shadow-sm backdrop-blur">
        ใช้เมาส์ลากแผนที่เพื่อเลื่อน และปุ่ม +/- หรือสกอร์เมาส์เพื่อซูม
      </div>

      {isMapError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-white/90 p-6 text-center">
          <MapPin size={28} className="text-blue-500" />
          <p className="text-xs font-medium text-slate-700">ไม่พบไฟล์แผนที่ประเทศไทย</p>
          <p className="max-w-[320px] text-[11px] font-light text-slate-500">
            กรุณาวางไฟล์ th.svg ไว้ที่ public/maps/th.svg แล้ว refresh หน้าอีกครั้ง
          </p>
        </div>
      )}

      {/* Floating Zoom / Pan Controls */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5 rounded-2xl bg-white/95 p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100/80 backdrop-blur-md">
        <button
          type="button"
          onClick={handleZoomIn}
          title="ซูมเข้า"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-slate-600 dark:text-slate-300 border border-slate-100/50"
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="ซูมออก"
          disabled={zoom <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-slate-600 dark:text-slate-300 border border-slate-100/50 disabled:opacity-30 disabled:pointer-events-none"
        >
          <Minus size={16} />
        </button>
        <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-0.5 mx-1" />
        <button
          type="button"
          onClick={handleResetZoom}
          title="รีเซ็ตมุมมอง"
          disabled={zoom === 1 && panOffset.x === 0 && panOffset.y === 0}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-slate-600 dark:text-slate-300 border border-slate-100/50 disabled:opacity-30 disabled:pointer-events-none"
        >
          <Maximize2 size={13} />
        </button>
      </div>

      <div ref={mapRef} className="absolute inset-0 flex items-center justify-center p-1" />

      {/* Custom Hover Tooltip */}
      {hoveredProvince && (
        <div
          className="pointer-events-none absolute z-40 rounded-xl border border-slate-150 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-md text-slate-800 transition-all duration-75 min-w-[170px]"
          style={{
            left: `${mousePos.x + 16}px`,
            top: `${mousePos.y + 16}px`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${
              hoveredProvince.status === "green" ? "bg-emerald-500" :
              hoveredProvince.status === "yellow" ? "bg-amber-500" :
              hoveredProvince.status === "red" ? "bg-rose-500" : "bg-slate-300"
            }`} />
            <span className="font-semibold text-[13px] text-slate-900 leading-none">{hoveredProvince.name}</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5 font-light">{hoveredProvince.engName}</span>
          
          <div className="mt-2 pt-1.5 border-t border-slate-100/80 flex items-center justify-between gap-3">
            <span className="text-[10px] text-slate-500 font-light">จำนวนพนักงาน:</span>
            <span className="font-mono text-xs font-semibold text-slate-700">
              {hoveredProvince.headcount > 0 ? `${hoveredProvince.headcount.toLocaleString()} คน` : "ไม่มีพนักงาน"}
            </span>
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-white/95 px-4.5 py-3 shadow-md backdrop-blur border border-slate-200/30">
        {/* Left: General & Selection States */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2 text-[10.5px] font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full bg-white border border-slate-300" />
            <span>จังหวัดนอกเขตเลือก</span>
          </div>
          <div className="flex items-center gap-2 text-[10.5px] font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full bg-[#F1F5F9] border border-slate-300" />
            <span>ไม่มีข้อมูลในระบบ</span>
          </div>
          <div className="flex items-center gap-2 text-[10.5px] font-semibold text-blue-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span>จังหวัดที่เลือก</span>
          </div>
        </div>

        {/* Right: Performance levels matching the map colors */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t sm:border-t-0 sm:pt-0 border-slate-100">
          <div className="flex items-center gap-2 text-[10.5px] font-medium text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
            <span>ผ่านเกณฑ์ (On Target)</span>
          </div>
          <div className="flex items-center gap-2 text-[10.5px] font-medium text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
            <span>ต่ำเป้า 20% (Medium Risk)</span>
          </div>
          <div className="flex items-center gap-2 text-[10.5px] font-medium text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F43F5E]" />
            <span>ต่ำเป้า 50% (High Risk)</span>
          </div>
        </div>
      </div>
    </div>
  );
}


interface ExecutiveOverviewProps {
  employees: Employee[];
  totalResignationsCount: number;
  onSelectEmployee: (emp: Employee) => void;
  activeFilters: FilterState;
  onSetFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export default function ExecutiveOverview({
  employees,
  totalResignationsCount,
  onSelectEmployee,
  activeFilters,
  onSetFilters,
}: ExecutiveOverviewProps) {
  
  // Interactive Metric State: filters charts, insights, and roster below
  const [selectedMetric, setSelectedMetric] = useState<
    "all" | "permanent" | "contract" | "highPerf" | "needsSupport" | "retirementRisk" | "successionReady"
  >("all");

  // Pagination & Search States inside the employee table
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // States for Thailand Performance Map and Strategic Forecast
  const [selectedMapRegion, setSelectedMapRegion] = useState<"All" | "North" | "Northeast" | "Central" | "South" | "East" | "West">("All");
  const [selectedProvinceName, setSelectedProvinceName] = useState("กรุงเทพมหานคร");
  const [upskillingLevel, setUpskillingLevel] = useState<"None" | "Medium" | "Intensive">("Medium");
  const [successionLevel, setSuccessionLevel] = useState<"Normal" | "Deep" | "Full Coverage">("Deep");
  const [digitalLevel, setDigitalLevel] = useState<"Standard" | "Optimized" | "Advanced AI">("Optimized");

  // Local chart mode select
  const [activeDonutTab, setActiveDonutTab] = useState<"contract" | "hb" | "fb" | "gender">("contract");

  // Derive data specifically filtered by selectedMetric first, then search query
  const metricFilteredCohort = useMemo(() => {
    switch (selectedMetric) {
      case "permanent":
        return employees.filter(e => e.contractType === "พนักงานประจำ");
      case "contract":
        return employees.filter(e => e.contractType === "พนักงานสัญญาจ้าง");
      case "highPerf":
        return employees.filter(e => e.performanceRating === "High Performer");
      case "needsSupport":
        return employees.filter(e => e.performanceRating === "Needs Support");
      case "retirementRisk":
        return employees.filter(e => e.age >= 55);
      case "successionReady":
        return employees.filter(e => e.successionStatus === "Ready Now" || e.successionStatus === "Ready 1-2 Years");
      case "all":
      default:
        return employees;
    }
  }, [employees, selectedMetric]);

  // Reset pagination on search or metric changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMetric]);

  // Derived memos for Thailand Performance Map & Future Forecast
  const filteredProvinces = useMemo(() => {
    if (selectedMapRegion === "All") return PROVINCES_DATA;
    return PROVINCES_DATA.filter(p => p.region === selectedMapRegion);
  }, [selectedMapRegion]);

  const activeProvinceDetails = useMemo<ProvinceData>(() => {
    const matchedProvince = PROVINCES_DATA.find(
      (p) => p.name === selectedProvinceName || p.engName === selectedProvinceName
    );

    if (matchedProvince) return matchedProvince;

    return {
      name: selectedProvinceName,
      engName: selectedProvinceName,
      status: "green",
      headcount: 0,
      highPerfRatio: 0,
      successionCoverage: 0,
      retirementRisk: 0,
      region: "Central",
    };
  }, [selectedProvinceName]);

  const forecastModifier = useMemo(() => {
    let bonus = 0;
    if (upskillingLevel === "Medium") bonus += 4;
    if (upskillingLevel === "Intensive") bonus += 8;
    if (successionLevel === "Deep") bonus += 3;
    if (successionLevel === "Full Coverage") bonus += 5;
    if (digitalLevel === "Optimized") bonus += 3;
    if (digitalLevel === "Advanced AI") bonus += 6;
    return bonus;
  }, [upskillingLevel, successionLevel, digitalLevel]);

  const forecastChartData = useMemo(() => {
    return [
      { name: "2026 (ปัจจุบัน)", score: 82, withStrategy: 82, target: 100 },
      { name: "2027", score: 84, withStrategy: Math.min(100, 84 + forecastModifier * 0.4), target: 100 },
      { name: "2028", score: 85, withStrategy: Math.min(100, 85 + forecastModifier * 0.8), target: 100 },
      { name: "2029 (คาดการณ์)", score: 87, withStrategy: Math.min(100, 87 + forecastModifier), target: 100 }
    ];
  }, [forecastModifier]);

  // Calculations on general employees for KPI summaries
  const totalCount = employees.length;
  const permanentCount = employees.filter(e => e.contractType === "พนักงานประจำ").length;
  const contractCount = employees.filter(e => e.contractType === "พนักงานสัญญาจ้าง").length;
  const highPerfCount = employees.filter(e => e.performanceRating === "High Performer").length;
  const needsSupportCount = employees.filter(e => e.performanceRating === "Needs Support").length;
  const seniorCount = employees.filter(e => e.age >= 55).length;
  const successionReadyCount = employees.filter(e => e.successionStatus === "Ready Now" || e.successionStatus === "Ready 1-2 Years").length;

  const averageAge = useMemo(() => {
    if (metricFilteredCohort.length === 0) return 0;
    const total = metricFilteredCohort.reduce((acc, curr) => acc + curr.age, 0);
    return Math.round((total / metricFilteredCohort.length) * 10) / 10;
  }, [metricFilteredCohort]);

  const averageTenure = useMemo(() => {
    if (metricFilteredCohort.length === 0) return 0;
    const total = metricFilteredCohort.reduce((acc, curr) => acc + curr.tenure, 0);
    return Math.round((total / metricFilteredCohort.length) * 10) / 10;
  }, [metricFilteredCohort]);

  // Render metrics counts on cards
  const metricsConfig = [
    {
      id: "all" as const,
      title: "กำลังพลทั้งหมด",
      subtitle: "Total Headcount",
      value: totalCount,
      percent: "100%",
      badge: "ภาพรวมสถาบัน",
      gradient: "from-blue-500/10 to-indigo-500/10",
      activeBg: "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30",
      hoverBorder: "hover:border-blue-500/40",
      icon: <Users size={18} className="text-blue-600" />,
      colorClass: "text-blue-600"
    },
    {
      id: "permanent" as const,
      title: "พนักงานประจำ",
      subtitle: "Permanent Asset",
      value: permanentCount,
      percent: `${Math.round((permanentCount / (totalCount || 1)) * 100)}%`,
      badge: "สัญญาจ้างระยะยาว",
      gradient: "from-teal-500/10 to-emerald-500/10",
      activeBg: "bg-gradient-to-tr from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/20 ring-2 ring-teal-500/30",
      hoverBorder: "hover:border-teal-500/40",
      icon: <Briefcase size={18} className="text-teal-600" />,
      colorClass: "text-teal-600"
    },
    {
      id: "contract" as const,
      title: "พนักงานสัญญาจ้าง",
      subtitle: "Agile Contractors",
      value: contractCount,
      percent: `${Math.round((contractCount / (totalCount || 1)) * 100)}%`,
      badge: "สัญญาจ้างจำกัดเวลา",
      gradient: "from-cyan-500/10 to-blue-500/10",
      activeBg: "bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/30",
      hoverBorder: "hover:border-cyan-500/40",
      icon: <Hourglass size={18} className="text-cyan-600" />,
      colorClass: "text-cyan-600"
    },
    {
      id: "highPerf" as const,
      title: "กลุ่มดาวเด่น",
      subtitle: "High Performers",
      value: highPerfCount,
      percent: `${Math.round((highPerfCount / (totalCount || 1)) * 100)}%`,
      badge: "ประเมินผลยอดเยี่ยม",
      gradient: "from-amber-500/10 to-orange-500/10",
      activeBg: "bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 ring-2 ring-orange-500/30",
      hoverBorder: "hover:border-orange-500/40",
      icon: <Award size={18} className="text-amber-600" />,
      colorClass: "text-amber-600"
    },
    {
      id: "successionReady" as const,
      title: "ความพร้อมสืบทอด",
      subtitle: "Succession Security",
      value: successionReadyCount,
      percent: `${Math.round((successionReadyCount / (employees.filter(e => parseInt(e.level.replace(/[^0-9]/g, "")) >= 9).length || 1)) * 100)}%`,
      badge: "ผู้นำสำรอง (Ready Now/1-2Y)",
      gradient: "from-purple-500/10 to-violet-500/10",
      activeBg: "bg-gradient-to-tr from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20 ring-2 ring-purple-500/30",
      hoverBorder: "hover:border-purple-500/40",
      icon: <UserCheck size={18} className="text-purple-600" />,
      colorClass: "text-purple-600"
    },
    {
      id: "retirementRisk" as const,
      title: "กลุ่มอายุ 55 ปีขึ้นไป",
      subtitle: "Near Retirement",
      value: seniorCount,
      percent: `${Math.round((seniorCount / (totalCount || 1)) * 100)}%`,
      badge: "ใกล้เกษียณอายุการทำงาน",
      gradient: "from-rose-500/10 to-pink-500/10",
      activeBg: "bg-gradient-to-tr from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/20 ring-2 ring-rose-500/30",
      hoverBorder: "hover:border-rose-500/40",
      icon: <ShieldAlert size={18} className="text-rose-600" />,
      colorClass: "text-rose-600"
    }
  ];

  // Pie chart or Donut representation based on current metric cohort
  const segmentDonutData = useMemo(() => {
    switch (activeDonutTab) {
      case "hb": {
        const ho = metricFilteredCohort.filter(e => e.hb === "Head Office").length;
        const br = metricFilteredCohort.filter(e => e.hb === "Branch").length;
        return [
          { name: "สำนักงานใหญ่", value: ho, color: "#2563EB" },
          { name: "สาขาภูมิภาค", value: br, color: "#06B6D4" }
        ].filter(d => d.value > 0);
      }
      case "fb": {
        const front = metricFilteredCohort.filter(e => e.frontBack === "Front").length;
        const back = metricFilteredCohort.filter(e => e.frontBack === "Back").length;
        return [
          { name: "Front Office (สาขา/ตลาด)", value: front, color: "#10B981" },
          { name: "Back Office (สนับสนุน)", value: back, color: "#EF4444" }
        ].filter(d => d.value > 0);
      }
      case "gender": {
        const male = metricFilteredCohort.filter(e => e.gender === "ชาย").length;
        const female = metricFilteredCohort.filter(e => e.gender === "หญิง").length;
        return [
          { name: "เพศหญิง", value: female, color: "#EC4899" },
          { name: "เพศชาย", value: male, color: "#3B82F6" }
        ].filter(d => d.value > 0);
      }
      case "contract":
      default: {
        const perm = metricFilteredCohort.filter(e => e.contractType === "พนักงานประจำ").length;
        const cont = metricFilteredCohort.filter(e => e.contractType === "พนักงานสัญญาจ้าง").length;
        return [
          { name: "พนักงานประจำ", value: perm, color: "#2563EB" },
          { name: "พนักงานสัญญาจ้าง", value: cont, color: "#60A5FA" }
        ].filter(d => d.value > 0);
      }
    }
  }, [metricFilteredCohort, activeDonutTab]);

  // Bar Chart of Business Lines distribution for the current metric cohort
  const businessLinesChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    metricFilteredCohort.forEach(e => {
      counts[e.businessLine] = (counts[e.businessLine] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name: name.replace("สายงาน", ""),
        จำนวนคน: value
      }))
      .sort((a, b) => b.จำนวนคน - a.จำนวนคน)
      .slice(0, 8); // Top 8 lines to avoid chart clutter
  }, [metricFilteredCohort]);

  // Dynamic dynamic insights feed based on selected metric
  const cohortInsights = useMemo(() => {
    const list = [];
    const count = metricFilteredCohort.length;

    if (selectedMetric === "all") {
      list.push({
        type: "info",
        title: "สรุปโครงสร้างกำลังคนภาพรวม",
        desc: `สถาบันการเงิน SME D Bank มีกำลังพลรวมที่วิเคราะห์ ${count.toLocaleString()} คน โดยมีอายุตัวเฉลี่ยของพนักงานอยู่ที่ ${averageAge} ปี และมีอายุงานเฉลี่ยถึง ${averageTenure} ปี บ่งชี้โครงสร้างกำลังคนที่เหนียวแน่น`,
        action: "รักษามาตรฐานองค์กร"
      });
      if (seniorCount > 200) {
        list.push({
          type: "warning",
          title: "ความเสี่ยงการทยอยเกษียณของพนักงานระดับชำนาญการ",
          desc: `พนักงานจำนวนกว่า ${seniorCount} คนเข้าสู่ช่วงพ้นวาระอายุงาน 55+ ปีในอนาคตอันใกล้ ควรจัดตั้งสถาบันถ่ายโอนความรู้เพื่อมิให้ส่งผลกระทบต่อเสถียรภาพการวิเคราะห์หลักทรัพย์และเครดิต`,
          action: "วางแผนสืบทอดสายบริการสาขา"
        });
      }
      list.push({
        type: "success",
        title: "กลุ่มกำลังหลักสืบทอดตำแหน่ง (Succession Candidates)",
        desc: `ตรวจพบพนักงานในตำแหน่งบริหารที่มีสถานะความพร้อมสืบทอด Ready Now และ Ready 1-2 Years รวมทั้งสิ้น ${successionReadyCount} คน ซึ่งสูงพอในการรองรับเป้าหมายการขยายสินเชื่อดิจิทัล`,
        action: "จัดทำ Individual Development Plan"
      });
    } else if (selectedMetric === "permanent") {
      list.push({
        type: "success",
        title: "พนักงานประจำมีความผูกพันสูง",
        desc: `กลุ่มพนักงานประจำมีอายุงาน (Tenure) เฉลี่ยอยู่ที่ ${averageTenure} ปี สะท้อนเสถียรภาพและความภักดีต่อองค์กร แนะนำจัดอบรม Upskill เทคโนโลยีเพื่อเพิ่มผลสัมฤทธิ์ต่อชั่วโมงทำงาน`,
        action: "ประเมิน Career Path ไตรมาส 3"
      });
    } else if (selectedMetric === "contract") {
      list.push({
        type: "warning",
        title: "การจัดการทรัพยากรพนักงานสัญญาจ้าง",
        desc: `พนักงานสัญญาจ้างจำนวน ${count} คน ส่วนใหญ่สนับสนุนสายปฏิบัติการและธุรการสาขา มีอายุงานเฉลี่ยต่ำเพียง ${averageTenure} ปี แนะนำจัดแผนประเมินผลเพื่อบรรจุเป็นพนักงานประจำกลุ่มงานวิกฤต`,
        action: "กำหนดเกณฑ์ประเมินบรรจุประจำ"
      });
    } else if (selectedMetric === "highPerf") {
      list.push({
        type: "success",
        title: "รักษากลุ่มพนักงานดาวเด่นและให้รางวัลตอบแทนเชิงกลยุทธ์",
        desc: `ตรวจพบพนักงานศักยภาพสูง High Performer ${count} คน กระจายอยู่ตามสายงานสนับสนุนหลัก แนะนำเปิดเวทีพัฒนาแผนธุรกิจย่อยร่วมกับผู้บริหารโดยตรง (Executive Sponsorship Program)`,
        action: "เสนออนุมัติงบปันผล/โบนัสพิเศษ"
      });
    } else if (selectedMetric === "needsSupport") {
      list.push({
        type: "danger",
        title: "แผนพัฒนาพนักงานที่ต้องการการสนับสนุนเร่งด่วน",
        desc: `พบพนักงานจำนวน ${count} คน มีผลงานประเมินในระดับต้องการพัฒนา (Needs Support) แนะนำวิเคราะห์หาสาเหตุรายบุคคล ควบคู่กับการจัดทำ Performance Improvement Plan (PIP)`,
        action: "เริ่มจัดโครงการ Mentor ประกบงาน"
      });
    } else if (selectedMetric === "retirementRisk") {
      list.push({
        type: "danger",
        title: "การเกษียณอายุและการถ่ายทอดองค์ความรู้สู่น้องใหม่",
        desc: `กลุ่มพนักงานวัยเกษียณ 55 ปีขึ้นไป ${count} คน ครอบครองประสบการณ์สูงในการอนุมัติสินเชื่อเชิงลึกและเทคนิคความสัมพันธ์ภูมิภาค แนะนำดึงเข้ามาร่วมเป็นวิทยากรศูนย์ SME Academy`,
        action: "สร้างฐานข้อมูล KM ดิจิทัลประจำเขต"
      });
    } else if (selectedMetric === "successionReady") {
      list.push({
        type: "success",
        title: "ความพร้อมการจัดวางตัวบุคคลสำคัญ",
        desc: `กลุ่มผู้สืบทอดพร้อมใช้งาน ${count} คน มีอายุระดับเฉลี่ยพร้อมก้าวหน้า ควรผลักดันให้ปฏิบัติหน้าที่รักษาการผู้บริหาร (Acting Role) ในส่วนงานเป้าหมาย เพื่อรับการประเมินภาวะผู้นำจริง`,
        action: "แต่งตั้งโครงการผู้บริหารฝึกหัดรุ่นเยาว์"
      });
    }
    return list;
  }, [selectedMetric, metricFilteredCohort, averageAge, averageTenure, seniorCount, successionReadyCount]);

  // Final filtered employee list applied with internal table search bar
  const tableFilteredEmployees = useMemo(() => {
    if (!searchTerm) return metricFilteredCohort;
    const lower = searchTerm.toLowerCase();
    return metricFilteredCohort.filter(emp => 
      emp.name.toLowerCase().includes(lower) ||
      emp.empId.toLowerCase().includes(lower) ||
      emp.position.toLowerCase().includes(lower) ||
      emp.department.toLowerCase().includes(lower) ||
      emp.businessLine.toLowerCase().includes(lower)
    );
  }, [metricFilteredCohort, searchTerm]);

  // Paginated elements
  const totalPages = Math.ceil(tableFilteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return tableFilteredEmployees.slice(start, start + itemsPerPage);
  }, [tableFilteredEmployees, currentPage]);

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  };

  const getMetricTitleInThai = () => {
    switch (selectedMetric) {
      case "permanent": return "พนักงานประจำ";
      case "contract": return "พนักงานสัญญาจ้าง";
      case "highPerf": return "กลุ่มดาวเด่น (High Performer)";
      case "needsSupport": return "กลุ่มต้องการพัฒนา (Needs Support)";
      case "retirementRisk": return "กลุ่มวัยเกษียณ (อายุ 55+)";
      case "successionReady": return "กลุ่มผู้สืบทอดที่มีความพร้อม";
      case "all":
      default: return "บุคลากรทั้งหมด";
    }
  };

  return (
    <div className="space-y-6">

      {/* Interactive Metric Pill Selector Row */}
      <div>
        <SectionHeader
          icon={<TrendingUp size={18} />}
          eyebrow="SME D Bank Metrics"
          title="ตัวบ่งชี้กลยุทธ์กำลังพล (คลิกเลือกเพื่อคัดกรองข้อมูลทั้งหมด)"
          description="คลิกเลือกกลุ่มข้อมูลเพื่อคัดกรอง แผนที่ ชาร์ต และบัญชีรายชื่อพนักงานในหน้าจอทั้งหมดตามกลุ่มความสนใจหลัก"
          themeColor="blue"
          right={
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-light">
              <Info size={11} />
              <span>ข้อมูลเปลี่ยนแปลงเรียลไทม์</span>
            </div>
          }
        />

        {/* The Grid of Metrics cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {metricsConfig.map((item) => {
            const isSelected = selectedMetric === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedMetric(item.id)}
                className={`text-left p-4.5 rounded-[22px] border transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                  isSelected 
                    ? item.activeBg 
                    : `bg-white border-slate-100/90 shadow-xs hover:shadow-md ${item.hoverBorder}`
                }`}
              >
                {/* Decorative glow inside card */}
                <div className={`absolute -right-6 -bottom-6 w-16 h-16 rounded-full opacity-10 bg-current ${isSelected ? "text-white" : item.colorClass}`} />
                
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl transition-colors shrink-0 ${
                    isSelected ? "bg-white/15 text-white" : "bg-slate-50 text-slate-500 group-hover:bg-slate-100"
                  }`}>
                    {item.icon}
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-sm shrink-0">
                      <Check size={10} className="stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className={`text-[10px] font-medium tracking-wide uppercase opacity-75 ${
                    isSelected ? "text-white/80" : "text-slate-400"
                  }`}>
                    {item.title}
                  </p>
                  <p className={`text-[9px] font-light truncate opacity-60 ${
                    isSelected ? "text-white/70" : "text-slate-400"
                  }`}>
                    {item.subtitle}
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`text-2xl font-sans font-medium tracking-tight ${
                      isSelected ? "text-white" : "text-slate-800"
                    }`}>
                      {item.value.toLocaleString()}
                    </span>
                    <span className={`text-[11px] font-medium ${
                      isSelected ? "text-white/80" : "text-slate-400"
                    }`}>
                      ({item.percent})
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-current/10 flex items-center justify-between text-[9px]">
                  <span className={`font-light ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                    {item.badge}
                  </span>
                  {!isSelected && (
                    <span className={`font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ${item.colorClass}`}>
                      <span>วิเคราะห์</span>
                      <ArrowUpRight size={10} />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION: THAILAND PERFORMANCE MAP & STRATEGIC PERFORMANCE FORECAST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Thailand Performance Map (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white/95 backdrop-blur-md rounded-[28px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <SectionHeader
              icon={<MapPin size={18} />}
              eyebrow="Thailand Performance Map"
              title="แผนที่วิเคราะห์ศักยภาพและระดับผลงานรายจังหวัด"
              description="การประเมินประสิทธิภาพการทำงาน อัตรากำลังพล และระดับผลงานรวมของแต่ละภูมิภาค"
              themeColor="blue"
            />

            {/* Region filter segment pills moved here above the map */}
            <div className="flex w-full gap-1 bg-slate-50 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50 mb-4">
              {(["All", "North", "Northeast", "Central", "South", "East", "West"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setSelectedMapRegion(r);
                    // Auto-select first province in that region to avoid blank details
                    const firstInRegion = PROVINCES_DATA.find(p => r === "All" || p.region === r);
                    if (firstInRegion) {
                      setSelectedProvinceName(firstInRegion.name);
                    }
                  }}
                  className={`flex-1 text-center py-1.5 text-[10.5px] font-semibold rounded-lg transition-all cursor-pointer ${
                    selectedMapRegion === r
                      ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs border border-slate-200/20 font-semibold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {r === "All" ? "ทุกภาค" : r === "North" ? "เหนือ" : r === "Northeast" ? "อีสาน" : r === "Central" ? "กลาง" : r === "South" ? "ใต้" : r === "East" ? "ตะวันออก" : "ตะวันตก"}
                </button>
              ))}
            </div>

            {/* Map and details container */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-3">
              
              {/* Real Thailand SVG Interactive Map (md:col-span-5) */}
              <div className="md:col-span-5">
                <ThailandSvgMap
                  provinces={PROVINCES_DATA}
                  selectedProvinceName={selectedProvinceName}
                  selectedRegion={selectedMapRegion}
                  onSelectProvince={setSelectedProvinceName}
                />
              </div>

              {/* Province list and Details Panel (md:col-span-7) */}
              <div className="md:col-span-7 flex flex-col justify-between min-h-[300px]">
                
                {/* Scrollable list of provinces */}
                <div>
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                    รายชื่อจังหวัดในการจัดกลุ่ม ({filteredProvinces.length} จังหวัด)
                  </div>
                  <div className="max-h-[290px] overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/30 font-light">
                    {filteredProvinces.map((prov) => {
                      const isSelected = selectedProvinceName === prov.name;
                      const statusColor = prov.status === "green" 
                        ? "bg-emerald-500" 
                        : prov.status === "yellow" 
                        ? "bg-amber-500" 
                        : "bg-rose-500";
                      
                      return (
                        <button
                          key={prov.name}
                          onClick={() => setSelectedProvinceName(prov.name)}
                          className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer border ${
                            isSelected 
                              ? "bg-blue-600/10 border-blue-600/30 text-blue-700 font-medium" 
                              : "bg-white border-slate-100 hover:border-slate-200 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${statusColor}`} />
                            <div className="flex flex-col">
                              <span className="text-[11.5px] font-medium text-slate-850 dark:text-slate-200 leading-tight">{prov.name}</span>
                              <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-mono tracking-tight leading-none mt-0.5">{prov.engName}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-light">พนักงาน:</span>
                            <span className="font-mono text-xs">{prov.headcount} คน</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Province Details Card */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-2xl p-4 border border-slate-100/60 mt-3.5 shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-blue-600 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-800 leading-tight">
                          {activeProvinceDetails.name}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-mono leading-none mt-0.5">
                          {activeProvinceDetails.engName}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-medium rounded-full ${
                      activeProvinceDetails.status === "green" 
                        ? "bg-emerald-500/10 text-emerald-650 border border-emerald-500/20" 
                        : activeProvinceDetails.status === "yellow" 
                        ? "bg-amber-500/10 text-amber-655 border border-amber-500/20" 
                        : "bg-rose-500/10 text-rose-650 border border-rose-500/20"
                    }`}>
                      {activeProvinceDetails.status === "green" ? "On Target (ผ่านเกณฑ์)" : activeProvinceDetails.status === "yellow" ? "ต่ำเป้า 20%" : "ต่ำเป้า 50%"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-center shadow-xs">
                      <p className="text-[9px] text-slate-400">กำลังพลปฏิบัติการ</p>
                      <p className="text-sm font-medium text-slate-800 mt-1 font-mono">{activeProvinceDetails.headcount.toLocaleString()} คน</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-center shadow-xs">
                      <p className="text-[9px] text-slate-400">ดัชนีดาวเด่น (High Perf)</p>
                      <p className="text-sm font-medium text-slate-800 mt-1 font-mono">{activeProvinceDetails.highPerfRatio}%</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-center shadow-xs">
                      <p className="text-[9px] text-slate-400">อัตราเกษียณเฝ้าระวัง</p>
                      <p className="text-sm font-medium text-rose-600 mt-1 font-mono">{activeProvinceDetails.retirementRisk}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[9.5px] text-slate-400 font-light">
                    <span>ดัชนีผู้สืบทอดตำแหน่ง (Successor Coverage):</span>
                    <span className="font-medium text-slate-700">{activeProvinceDetails.successionCoverage}% ของกลุ่มผู้จัดการ</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100/60 flex items-center justify-between text-[10px] text-slate-400 font-light">
            <span>สำนักงานเครือข่ายสาขาภูมิภาค SME D Bank</span>
            <span>ระบบ GIS แผนที่นำทางสืบค้น</span>
          </div>
        </div>

        {/* Right Column: Performance Trend & Forecast Tool (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white/95 backdrop-blur-md rounded-[28px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <SectionHeader
              icon={<Target size={18} />}
              eyebrow="Predictive Analysis"
              title="แบบจำลองพยากรณ์ผลงานสถาบัน"
              description="จำลองอัตราสัมฤทธิ์ผลเชิงยุทธศาสตร์ในช่วง 3 ปีข้างหน้า ด้วยการปรับเปลี่ยนคันโยกเชิงนโยบายทรัพยากรบุคคล"
              themeColor="amber"
            />

            {/* Premium Forecast Result Card */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-slate-800 shadow-md relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    ดัชนีคาดการณ์ผลงานปี 2029 (Success Index)
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-sans font-bold tracking-tight text-white font-mono">
                      {87 + forecastModifier}%
                    </span>
                    {forecastModifier > 0 ? (
                      <span className="text-[10.5px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <TrendingUp size={10} />
                        +{forecastModifier}%
                      </span>
                    ) : (
                      <span className="text-[10.5px] font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30 px-1.5 py-0.5 rounded-full">
                        Baseline
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-11 w-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                  <Target className="text-amber-400 animate-pulse" size={20} />
                </div>
              </div>
              
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[9.5px] text-slate-300">
                <span className="font-light">เทียบกับเป้าหมาย KPI สถาบัน (85%)</span>
                <span className="font-semibold text-emerald-400">ผ่านเกณฑ์เป้าหมาย</span>
              </div>
            </div>

            {/* Strategic Levers (Interactive controls that dynamically change forecasts) */}
            <div className="mt-4 space-y-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                คันโยกยุทธศาสตร์เพื่อการพยากรณ์ล่วงหน้า (Strategic HR Levers)
              </span>

              {/* Lever 1: L&D Upskilling */}
              <div className="p-3 bg-slate-50/60 border border-slate-200/50 rounded-2xl flex flex-col gap-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Award className="text-blue-500 shrink-0" size={13} />
                    <span className="text-[11px] font-semibold text-slate-700">1. การยกระดับ L&D และอัปสกิล</span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 font-mono">
                    {upskillingLevel === "None" ? "ปกติ" : upskillingLevel === "Medium" ? "ปานกลาง (+4%)" : "เข้มข้น (+8%)"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(["None", "Medium", "Intensive"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setUpskillingLevel(lvl)}
                      className={`py-1.5 text-[9.5px] font-medium rounded-lg transition-all cursor-pointer text-center border ${
                        upskillingLevel === lvl
                          ? "bg-blue-600 text-white font-semibold border-blue-600 shadow-[0_2px_8px_-2px_rgba(37,99,235,0.4)]"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      {lvl === "None" ? "มาตรฐาน" : lvl === "Medium" ? "ระดับกลาง" : "เข้มข้น"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lever 2: Succession depth */}
              <div className="p-3 bg-slate-50/60 border border-slate-200/50 rounded-2xl flex flex-col gap-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="text-indigo-500 shrink-0" size={13} />
                    <span className="text-[11px] font-semibold text-slate-700">2. ผู้สืบทอดตำแหน่ง (Succession)</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 font-mono">
                    {successionLevel === "Normal" ? "ปกติ" : successionLevel === "Deep" ? "2 ชั้น (+3%)" : "ครอบคลุม (+5%)"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(["Normal", "Deep", "Full Coverage"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSuccessionLevel(lvl)}
                      className={`py-1.5 text-[9.5px] font-medium rounded-lg transition-all cursor-pointer text-center border ${
                        successionLevel === lvl
                          ? "bg-indigo-600 text-white font-semibold border-indigo-600 shadow-[0_2px_8px_-2px_rgba(79,70,229,0.4)]"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      {lvl === "Normal" ? "มาตรฐาน" : lvl === "Deep" ? "ผู้สืบทอด 2 ชั้น" : "ครอบคลุมครบ"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lever 3: Digital transformation */}
              <div className="p-3 bg-slate-50/60 border border-slate-200/50 rounded-2xl flex flex-col gap-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="text-emerald-500 shrink-0" size={13} />
                    <span className="text-[11px] font-semibold text-slate-700">3. เครื่องมือดิจิทัล & AI ระบบงาน</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 font-mono">
                    {digitalLevel === "Standard" ? "ปกติ" : digitalLevel === "Optimized" ? "จัดสรร (+3%)" : "Advanced (+6%)"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(["Standard", "Optimized", "Advanced AI"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setDigitalLevel(lvl)}
                      className={`py-1.5 text-[9.5px] font-medium rounded-lg transition-all cursor-pointer text-center border ${
                        digitalLevel === lvl
                          ? "bg-emerald-600 text-white font-semibold border-emerald-600 shadow-[0_2px_8px_-2px_rgba(16,185,129,0.4)]"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      {lvl === "Standard" ? "มาตรฐาน" : lvl === "Optimized" ? "จัดสรรใหม่" : "Advanced AI"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recharts Area Chart showing projection outcomes */}
            <div className="mt-4 p-3 bg-slate-50/30 border border-slate-100 rounded-2xl">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-2.5">
                ดัชนีคะแนนผลงานความสำเร็จเปรียบเทียบใน 3 ปีข้างหน้า
              </span>
              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastChartData}>
                    <defs>
                      <linearGradient id="colorStrategy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[50, 100]} tick={{ fill: '#94A3B8', fontSize: 8 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                    <Area type="monotone" dataKey="withStrategy" name="แผนหลังปรับยุทธศาสตร์" stroke="#2563EB" fillOpacity={1} fill="url(#colorStrategy)" strokeWidth={2} />
                    <Line type="monotone" dataKey="score" name="แนวโน้มกรณีปกติ (Baseline)" stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={1.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="target" name="ค่าเป้าหมาย (KPI Target)" stroke="#10B981" strokeWidth={1.2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-light">
              ผลพยากรณ์คาดการณ์ด้วยแบบจำลองสถิติและ HR-Analytics
            </span>
            <span className="font-semibold text-indigo-650 font-mono">
              เป้าหมายสูงสุด: {87 + forecastModifier}%
            </span>
          </div>
        </div>

      </div>

      {/* Middle Grid Section: Dashboard Analytics Chart Hub & Insights Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Visual Analytics Hub (Recharts block) */}
        <div className="lg:col-span-8 bg-white/95 backdrop-blur-md rounded-[28px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          
          <div>
            <SectionHeader
              icon={<Users size={18} />}
              eyebrow={`กลุ่มวิเคราะห์: ${getMetricTitleInThai()}`}
              title="การแจกแจงพนักงานและมิติทางประชากรศาสตร์"
              description="แสดงสัดส่วนสถิติและประเภทสัญญาจ้างของกำลังพลตามกลุ่มตัวกรองด้านบน"
              themeColor="blue"
              right={
                <div className="inline-flex bg-slate-50 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  {[
                    { id: "contract", label: "ประเภทสัญญา" },
                    { id: "hb", label: "ตามที่ตั้ง" },
                    { id: "fb", label: "ลักษณะงาน" },
                    { id: "gender", label: "แบ่งตามเพศ" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveDonutTab(t.id as any)}
                      className={`px-2.5 py-1 text-[10px] font-medium rounded-lg transition-all cursor-pointer ${
                        activeDonutTab === t.id 
                          ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs" 
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              }
            />

            {/* Inner demographic indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              
              {/* Statistic Card 1 */}
              <div className="bg-slate-50/50 rounded-2xl p-3.5 border border-slate-100/60">
                <p className="text-[10px] font-medium text-slate-400">ขนาดกลุ่มประชากรที่พิจารณา</p>
                <p className="text-lg font-medium text-slate-800 mt-1">{metricFilteredCohort.length.toLocaleString()} คน</p>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(metricFilteredCohort.length / (totalCount || 1)) * 100}%` }} 
                  />
                </div>
              </div>

              {/* Statistic Card 2 */}
              <div className="bg-slate-50/50 rounded-2xl p-3.5 border border-slate-100/60">
                <p className="text-[10px] font-medium text-slate-400">อายุตัวเฉลี่ยของกลุ่ม</p>
                <p className="text-lg font-medium text-slate-800 mt-1">{averageAge} ปี</p>
                <p className="text-[9px] text-slate-500 mt-1.5 font-light">
                  ช่วงอายุพนักงานหลักของ SME D Bank
                </p>
              </div>

              {/* Statistic Card 3 */}
              <div className="bg-slate-50/50 rounded-2xl p-3.5 border border-slate-100/60">
                <p className="text-[10px] font-medium text-slate-400">อายุงานเฉลี่ยในธนาคาร</p>
                <p className="text-lg font-medium text-slate-800 mt-1">{averageTenure} ปี</p>
                <p className="text-[9px] text-slate-500 mt-1.5 font-light">
                  สะท้อนความผูกพันและเสถียรภาพองค์กร
                </p>
              </div>

            </div>

            {/* Recharts visualizations */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 mt-6">
              
              {/* Mini donut chart (4 cols) */}
              <div className="sm:col-span-5 border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center min-h-[190px]">
                <p className="text-[10px] font-medium text-slate-400 mb-2 self-start">สัดส่วนย่อย ({segmentDonutData.length ? activeDonutTab.toUpperCase() : "ไม่มีข้อมูล"})</p>
                
                {segmentDonutData.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-slate-400 font-light">ไม่มีข้อมูลประชากรกลุ่มนี้</p>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <div className="h-[120px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={segmentDonutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={36}
                            outerRadius={52}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {segmentDonutData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ fontSize: 10, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                            formatter={(value: any) => [`${value.toLocaleString()} คน`]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Donut Legends */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center mt-2">
                      {segmentDonutData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-[9px] text-slate-500 font-light">{d.name} ({d.value.toLocaleString()} คน)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bar Chart representing business line counts (7 cols) */}
              <div className="sm:col-span-7 border border-slate-100 p-4 rounded-2xl min-h-[190px]">
                <p className="text-[10px] font-medium text-slate-400 mb-2">โครงสร้างจำแนกตามกลุ่มสายงาน (Top 8 ลำดับพนักงานสูงสุด)</p>
                {businessLinesChartData.length === 0 ? (
                  <div className="h-[130px] flex items-center justify-center">
                    <p className="text-xs text-slate-400 font-light">ไม่มีข้อมูลสำหรับกลุ่มตัวกรองนี้</p>
                  </div>
                ) : (
                  <div className="h-[140px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={businessLinesChartData} barSize={16}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#94A3B8', fontSize: 8 }} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fill: '#94A3B8', fontSize: 8 }} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ fontSize: 10, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                          cursor={{ fill: 'rgba(148,163,184,0.05)' }}
                        />
                        <Bar dataKey="จำนวนคน" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                          {businessLinesChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#2563EB" : "#38BDF8"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

            </div>

          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100/60 flex items-center justify-between text-[11px] text-slate-400 font-light">
            <span>ฐานข้อมูลสำนักงานทรัพยากรบุคคล SME D Bank</span>
            <span>ประมวลผลระบบสถิติล่าสุด</span>
          </div>

        </div>

        {/* Right Column: Dynamic Insight & AI Recommendations Engine */}
        <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[28px] p-6 text-white shadow-md flex flex-col justify-between">
          
          <div>
            <SectionHeader
              icon={<Sparkles size={18} />}
              eyebrow="Dynamic Engine"
              title="บทวิเคราะห์เชิงนโยบายกำลังพล"
              description="ข้อเสนอเชิงยุทธศาสตร์สำหรับการบริหารกลุ่มเป้าหมายเชิงรุก"
              themeColor="violet"
              isDarkBg={true}
              right={
                <span className="text-[9px] font-medium bg-white/10 text-indigo-200 border border-white/15 px-2 py-0.5 rounded-full uppercase">
                  Insight Engine
                </span>
              }
            />

            <div className="mt-5 space-y-4">
              {cohortInsights.map((insight, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    insight.type === "danger" 
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-100" 
                      : insight.type === "warning"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-100"
                      : "bg-slate-800/60 border-slate-700/40 text-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <h4 className="text-[11px] font-medium text-white">{insight.title}</h4>
                  </div>
                  <p className="text-[10px] font-light leading-relaxed opacity-90">{insight.desc}</p>
                  
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[8px] uppercase tracking-wide opacity-50 select-none">แผนแนะนำ:</span>
                    <span className="text-[9px] font-medium bg-white/10 px-2 py-0.5 rounded-md text-amber-300">
                      {insight.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="bg-white/5 rounded-xl p-3 flex items-start gap-2.5 border border-white/5">
              <div className="p-1 bg-amber-400/20 text-amber-300 rounded-md mt-0.5 shrink-0">
                <Sparkle size={10} />
              </div>
              <p className="text-[9px] text-indigo-100 leading-relaxed font-light">
                คลิกเลือกกลุ่มข้อมูลพนักงานอื่นด้านบน เพื่อรับบทวิเคราะห์เฉพาะกลุ่มที่มีประสิทธิภาพสูงขึ้น
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Roster Explorer Table Section */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
        
        <SectionHeader
          icon={<Search size={18} />}
          eyebrow={`ตัวจัดกรอง: ${getMetricTitleInThai()}`}
          title="ทำเนียบข้าราชการและบุคลากรรายบุคคล"
          description="ฐานข้อมูลรายละเอียดพนักงานรายบุคคล พร้อมช่องสืบค้นรวดเร็วด้วยรหัส ชื่อ ตำแหน่ง หรือสังกัด"
          themeColor="blue"
          right={
            <div className="relative min-w-[240px]">
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัส, สายงานในกลุ่มนี้..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 py-1.5 text-xs rounded-lg border border-slate-200/70 dark:border-slate-700/70 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 dark:bg-slate-800 dark:text-white transition-all font-light"
              />
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={12} />
              </div>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          }
        />

        {/* The data table */}
        <div className="overflow-x-auto mt-4">
          {tableFilteredEmployees.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Users size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">ไม่พบรายชื่อพนักงานตามเงื่อนไขสืบค้นในปัจจุบัน</p>
              <button
                onClick={() => { setSearchTerm(""); setSelectedMetric("all"); }}
                className="text-[11px] text-blue-600 underline mt-2 hover:text-blue-700 font-light cursor-pointer"
              >
                ล้างการกรองข้อมูลทั้งหมด
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-medium text-slate-400 uppercase tracking-wider bg-slate-50/30">
                  <th className="py-3 px-4 font-medium">รหัสพนักงาน</th>
                  <th className="py-3 px-4 font-medium">ชื่อ-นามสกุล</th>
                  <th className="py-3 px-4 font-medium">ตำแหน่งงาน / ส่วนงาน</th>
                  <th className="py-3 px-4 font-medium">ระดับงาน</th>
                  <th className="py-3 px-4 font-medium">สังกัดสายงานหลัก</th>
                  <th className="py-3 px-4 font-medium">อายุตัว (ปี)</th>
                  <th className="py-3 px-4 font-medium">อายุงาน (ปี)</th>
                  <th className="py-3 px-4 font-medium text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedEmployees.map((emp) => {
                  // Initials for avatar
                  const initials = emp.name.split(" ")[0].slice(0, 2);
                  return (
                    <tr 
                      key={emp.empId}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 group-hover:text-slate-800 transition-colors">
                        {emp.empId}
                      </td>

                      {/* Name with custom avatar */}
                      <td className="py-3 px-4 font-medium text-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-sans font-medium text-white bg-gradient-to-br ${
                            emp.gender === "ชาย" ? "from-blue-400 to-blue-600" : "from-pink-400 to-indigo-500"
                          } shadow-xs`}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-slate-800 font-medium">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 font-light mt-0.5">{emp.nameEn}</p>
                          </div>
                        </div>
                      </td>

                      {/* Position & department */}
                      <td className="py-3 px-4 text-slate-600 font-light">
                        <p className="font-normal text-slate-700">{emp.position}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{emp.department}</p>
                      </td>

                      {/* Employee Level */}
                      <td className="py-3 px-4 text-slate-500">
                        <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-sans">
                          {emp.level}
                        </span>
                      </td>

                      {/* Line */}
                      <td className="py-3 px-4 text-slate-600 font-light">
                        <p className="truncate max-w-[150px]" title={emp.businessLine}>
                          {emp.businessLine}
                        </p>
                      </td>

                      {/* Age */}
                      <td className="py-3 px-4 font-mono text-slate-600 font-light">
                        {emp.age} ปี
                      </td>

                      {/* Tenure */}
                      <td className="py-3 px-4 font-mono text-slate-600 font-light">
                        {emp.tenure} ปี
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectEmployee(emp)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all border border-blue-100 hover:border-transparent cursor-pointer shadow-xs hover:shadow-xs"
                        >
                          <User size={11} />
                          <span>ดูประวัติ</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination controls */}
        {tableFilteredEmployees.length > 0 && (
          <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-4 text-xs text-slate-500">
            <span className="font-light">
              แสดงหน้า <span className="font-normal text-slate-800">{currentPage}</span> ใน <span className="font-normal text-slate-800">{totalPages}</span> หน้า (รวมพนักงานกลุ่มคัดกรอง {tableFilteredEmployees.length.toLocaleString()} คน)
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200/60 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-all"
                title="ย้อนหน้าก่อน"
              >
                <ChevronLeft size={14} />
              </button>

              {/* Individual page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let targetPage = currentPage;
                if (currentPage <= 3) targetPage = i + 1;
                else if (currentPage >= totalPages - 2) targetPage = totalPages - 4 + i;
                else targetPage = currentPage - 2 + i;

                if (targetPage < 1 || targetPage > totalPages) return null;

                return (
                  <button
                    key={targetPage}
                    onClick={() => handlePageChange(targetPage)}
                    className={`w-7.5 h-7.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      currentPage === targetPage 
                        ? "bg-slate-800 text-white shadow-xs" 
                        : "hover:bg-slate-50 text-slate-600 border border-slate-200/40"
                    }`}
                  >
                    {targetPage}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200/60 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-all"
                title="หน้าถัดไป"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
