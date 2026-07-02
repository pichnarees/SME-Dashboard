/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  RotateCcw, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  X, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Building,
  MapPin,
  Briefcase,
  Users,
  Layers,
  Award,
  Sparkles
} from "lucide-react";

export interface FilterState {
  businessLine: string;
  level: string;
  frontBack: string;
  hb: string;
  contractType: string;
  gender: string;
  searchQuery: string;
  region: string;
  retirementRisk: string;
  successionStatus: string;
  performanceRating: string;
  resignType: string;
  resignReason: string;
}

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  businessLines: string[];
  levels: string[];
  regions: string[];
  filteredCount: number;
  totalCount: number;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export default function FilterBar({
  filters,
  setFilters,
  resetFilters,
  businessLines,
  levels,
  regions,
  filteredCount,
  totalCount,
  onExportExcel,
  onExportPDF,
}: FilterBarProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus on "/" or Ctrl+K / Cmd+K
      if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== "input" && activeTag !== "select" && activeTag !== "textarea") {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const removeFilter = (key: keyof FilterState) => {
    handleFilterChange(key, "All");
  };

  const activeFiltersList = useMemo(() => {
    const list: { key: keyof FilterState; label: string; value: string }[] = [];
    if (filters.businessLine !== "All") list.push({ key: "businessLine", label: "สายงาน", value: filters.businessLine });
    if (filters.level !== "All") list.push({ key: "level", label: "ระดับ", value: filters.level });
    if (filters.region !== "All") list.push({ key: "region", label: "ภูมิภาค", value: filters.region });
    if (filters.contractType !== "All") list.push({ key: "contractType", label: "ประเภทสัญญา", value: filters.contractType });
    if (filters.frontBack !== "All") list.push({ key: "frontBack", label: "ลักษณะสายงาน", value: filters.frontBack === "Front" ? "Front Office" : "Back Office" });
    if (filters.hb !== "All") list.push({ key: "hb", label: "ที่ตั้ง", value: filters.hb === "Head Office" ? "สำนักงานใหญ่" : "สาขาภูมิภาค" });
    if (filters.gender !== "All") list.push({ key: "gender", label: "เพศ", value: filters.gender });
    if (filters.retirementRisk !== "All") {
      const v = filters.retirementRisk === "r1" ? "วิกฤต (ใน 1 ปี)" : filters.retirementRisk === "r3" ? "เฝ้าระวัง (ใน 3 ปี)" : "เตรียมการ (ใน 5 ปี)";
      list.push({ key: "retirementRisk", label: "ความเสี่ยงเกษียณ", value: v });
    }
    if (filters.successionStatus !== "All") {
      const v = filters.successionStatus === "None" ? "ไม่มีผู้สืบทอด" : filters.successionStatus === "Ready Now" ? "พร้อมสืบทอดทันที" : filters.successionStatus;
      list.push({ key: "successionStatus", label: "ความเสี่ยงผู้สืบทอด", value: v });
    }
    if (filters.performanceRating !== "All") list.push({ key: "performanceRating", label: "ประเมินผลงาน", value: filters.performanceRating });
    if (filters.resignType !== "All") list.push({ key: "resignType", label: "ประเภทการลาออก", value: filters.resignType });
    if (filters.resignReason !== "All") list.push({ key: "resignReason", label: "เหตุผลการลาออก", value: filters.resignReason });
    if (filters.searchQuery !== "") list.push({ key: "searchQuery", label: "คำค้นหา", value: filters.searchQuery });
    return list;
  }, [filters]);

  const hasActiveFilters = activeFiltersList.length > 0;
  const filteredPercentage = totalCount > 0 ? (filteredCount / totalCount) * 100 : 0;

  return (
    <div 
      id="filter-bar-container" 
      className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/40 dark:border-slate-800/50 rounded-2xl p-5 md:p-6 mb-6 shadow-sm hover:shadow-md transition-all duration-300 relative"
    >
      {/* Visual Accent Gradient Indicator */}
      <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-[#2F6FE4] via-teal-500/40 to-[#1E52B6] rounded-full" />

      {/* Primary Row: Controls & Stats Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-100 dark:border-slate-800/60">
        
        {/* Title and stats counter */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-[#2F6FE4]/10 text-[#2F6FE4] dark:bg-blue-500/10 dark:text-blue-400 rounded-xl shrink-0">
            <SlidersHorizontal size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-medium text-slate-900 dark:text-slate-100 tracking-tight">
                แผงวิเคราะห์และค้นหาข้อมูลกำลังพล
              </h3>
              <span className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 text-[9px] font-medium px-2 py-0.5 rounded-full border border-emerald-500/20 tracking-wider">
                ACTIVE COHORT
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-light leading-relaxed">
              สืบค้นเรียลไทม์: กำลังพลพิจารณา <span className="font-medium text-[#2F6FE4] dark:text-blue-400 bg-blue-500/5 dark:bg-blue-500/10 px-2 py-0.5 rounded-md text-xs">{filteredCount.toLocaleString()} คน</span> จากทั้งหมด {totalCount.toLocaleString()} คน ({filteredPercentage.toFixed(1)}%)
            </p>
          </div>
        </div>

        {/* Quick Actions & Reset Button */}
        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters && (
            <button
              id="reset-filters-btn"
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100/50 rounded-xl transition-all cursor-pointer active:scale-[0.98]"
            >
              <RotateCcw size={12} />
              <span>ล้างเงื่อนไข ({activeFiltersList.length})</span>
            </button>
          )}

          <button
            id="export-excel-btn"
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl transition-all shadow-sm shadow-emerald-500/10 hover:shadow-md cursor-pointer active:scale-[0.98]"
          >
            <FileSpreadsheet size={12} />
            <span>ส่งออก CSV (Excel)</span>
          </button>

          <button
            id="export-pdf-btn"
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-sm shadow-blue-500/10 hover:shadow-md cursor-pointer active:scale-[0.98]"
          >
            <FileText size={12} />
            <span>พิมพ์รายงาน PDF</span>
          </button>
        </div>
      </div>

      {/* Input controls layout */}
      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
          
          {/* Main Search Query input */}
          <div className="md:col-span-5 relative group">
            <label htmlFor="filter-search-query" className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <Search size={11} className="text-[#2F6FE4]" />
              <span>รหัส, ชื่อพนักงาน, ฝ่าย หรือตำแหน่งงาน (สืบค้นด่วน)</span>
            </label>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                id="filter-search-query"
                placeholder="พิมพ์ชื่อพนักงาน รหัส หรือตำแหน่งงานเพื่อเริ่มค้นหาด่วน..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                className="w-full pl-10 pr-14 py-3 text-xs rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-4 focus:ring-[#2F6FE4]/10 focus:border-[#2F6FE4] dark:focus:border-[#2F6FE4] focus:bg-white dark:focus:bg-slate-900 transition-all font-light placeholder:text-slate-400 shadow-xs"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#2F6FE4] transition-colors pointer-events-none">
                <Search size={14} />
              </div>
              
              {/* Keyboard Shortcut Indicator */}
              {!filters.searchQuery && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center bg-slate-200/50 dark:bg-slate-800/80 px-2 py-0.5 rounded text-[9px] font-mono text-slate-500 dark:text-slate-400 border border-slate-300/20 dark:border-slate-700/50 pointer-events-none select-none group-focus-within:opacity-0 transition-opacity duration-200">
                  <span className="text-[8px] font-sans mr-0.5">กด</span> /
                </div>
              )}

              {filters.searchQuery && (
                <button
                  onClick={() => removeFilter("searchQuery")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Business Line Select dropdown */}
          <div className="md:col-span-4">
            <label htmlFor="filter-business-line" className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <Building size={11} className="text-[#2F6FE4]" />
              <span>สายงานหลัก (Business Line)</span>
            </label>
            <div className="relative">
              <select
                id="filter-business-line"
                value={filters.businessLine}
                onChange={(e) => handleFilterChange("businessLine", e.target.value)}
                className={`w-full pl-9 pr-8 py-3 text-xs rounded-xl border focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800 dark:text-slate-200 cursor-pointer appearance-none bg-no-repeat bg-[right_10px_center] bg-[size:10px_10px] ${
                  filters.businessLine !== "All" 
                    ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/40 font-medium" 
                    : "border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-blue-500/40"
                }`}
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")` }}
              >
                <option value="All">สายงานทั้งหมด ({businessLines.length} สายงาน)</option>
                {businessLines.map(line => (
                  <option key={line} value={line}>{line}</option>
                ))}
              </select>
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Building size={13} className={filters.businessLine !== "All" ? "text-blue-500" : "text-slate-400 dark:text-slate-500"} />
              </div>
            </div>
          </div>

          {/* Employee Level Select dropdown */}
          <div className="md:col-span-2">
            <label htmlFor="filter-level" className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <Award size={11} className="text-[#2F6FE4]" />
              <span>ระดับตำแหน่ง (Level)</span>
            </label>
            <div className="relative">
              <select
                id="filter-level"
                value={filters.level}
                onChange={(e) => handleFilterChange("level", e.target.value)}
                className={`w-full pl-9 pr-8 py-3 text-xs rounded-xl border focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800 dark:text-slate-200 cursor-pointer appearance-none bg-no-repeat bg-[right_10px_center] bg-[size:10px_10px] ${
                  filters.level !== "All" 
                    ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/40 font-medium" 
                    : "border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-blue-500/40"
                }`}
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")` }}
              >
                <option value="All">ทุกระดับตำแหน่ง ({levels.length})</option>
                {levels.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Award size={13} className={filters.level !== "All" ? "text-blue-500" : "text-slate-400 dark:text-slate-500"} />
              </div>
            </div>
          </div>

          {/* Toggle Advanced Filters button */}
          <div className="md:col-span-1">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`w-full py-3 text-xs font-medium rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer border shadow-xs ${
                isAdvancedOpen 
                  ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent shadow-md" 
                  : "bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span>ขยาย</span>
              {isAdvancedOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          </div>

        </div>

        {/* Collapsible advanced filter panel */}
        {isAdvancedOpen && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            
            {/* Region select dropdown */}
            <div>
              <label htmlFor="filter-region" className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <MapPin size={11} className="text-[#2F6FE4]" />
                <span>สังกัดภูมิภาค (Region)</span>
              </label>
              <div className="relative">
                <select
                  id="filter-region"
                  value={filters.region}
                  onChange={(e) => handleFilterChange("region", e.target.value)}
                  className={`w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800 dark:text-slate-200 cursor-pointer appearance-none bg-no-repeat bg-[right_10px_center] bg-[size:10px_10px] ${
                    filters.region !== "All" 
                      ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/40 font-medium" 
                      : "border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-blue-500/40"
                  }`}
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")` }}
                >
                  <option value="All">ทุกภูมิภาค ({regions.length})</option>
                  {regions.map(reg => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <MapPin size={13} className={filters.region !== "All" ? "text-blue-500" : "text-slate-400 dark:text-slate-500"} />
                </div>
              </div>
            </div>

            {/* Contract Type select dropdown */}
            <div>
              <label htmlFor="filter-contract-type" className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Layers size={11} className="text-[#2F6FE4]" />
                <span>สัญญาจ้าง (Contract)</span>
              </label>
              <div className="relative">
                <select
                  id="filter-contract-type"
                  value={filters.contractType}
                  onChange={(e) => handleFilterChange("contractType", e.target.value)}
                  className={`w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800 dark:text-slate-200 cursor-pointer appearance-none bg-no-repeat bg-[right_10px_center] bg-[size:10px_10px] ${
                    filters.contractType !== "All" 
                      ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/40 font-medium" 
                      : "border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-blue-500/40"
                  }`}
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")` }}
                >
                  <option value="All">สัญญาทุกประเภท</option>
                  <option value="พนักงานประจำ">พนักงานประจำ</option>
                  <option value="พนักงานสัญญาจ้าง">พนักงานสัญญาจ้าง</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Layers size={13} className={filters.contractType !== "All" ? "text-blue-500" : "text-slate-400 dark:text-slate-500"} />
                </div>
              </div>
            </div>

            {/* Front / Back Office select dropdown */}
            <div>
              <label htmlFor="filter-front-back" className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Briefcase size={11} className="text-[#2F6FE4]" />
                <span>ลักษณะงาน (Ops Mode)</span>
              </label>
              <div className="relative">
                <select
                  id="filter-front-back"
                  value={filters.frontBack}
                  onChange={(e) => handleFilterChange("frontBack", e.target.value)}
                  className={`w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800 dark:text-slate-200 cursor-pointer appearance-none bg-no-repeat bg-[right_10px_center] bg-[size:10px_10px] ${
                    filters.frontBack !== "All" 
                      ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/40 font-medium" 
                      : "border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-blue-500/40"
                  }`}
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")` }}
                >
                  <option value="All">ทุกระบบงาน</option>
                  <option value="Front">Front Office (ตลาด/สาขา)</option>
                  <option value="Back">Back Office (สำนักงานใหญ่)</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Briefcase size={13} className={filters.frontBack !== "All" ? "text-blue-500" : "text-slate-400 dark:text-slate-500"} />
                </div>
              </div>
            </div>

            {/* Operational Location (HB) select dropdown */}
            <div>
              <label htmlFor="filter-hb" className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Building size={11} className="text-[#2F6FE4]" />
                <span>ที่ตั้งปฏิบัติงาน (HB)</span>
              </label>
              <div className="relative">
                <select
                  id="filter-hb"
                  value={filters.hb}
                  onChange={(e) => handleFilterChange("hb", e.target.value)}
                  className={`w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800 dark:text-slate-200 cursor-pointer appearance-none bg-no-repeat bg-[right_10px_center] bg-[size:10px_10px] ${
                    filters.hb !== "All" 
                      ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/40 font-medium" 
                      : "border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-blue-500/40"
                  }`}
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")` }}
                >
                  <option value="All">ทุกอาคารปฏิบัติการ</option>
                  <option value="Head Office">สำนักงานใหญ่ (HQ)</option>
                  <option value="Branch">สาขาบริการ (Branch)</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Building size={13} className={filters.hb !== "All" ? "text-blue-500" : "text-slate-400 dark:text-slate-500"} />
                </div>
              </div>
            </div>

            {/* Gender select dropdown */}
            <div>
              <label htmlFor="filter-gender" className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Users size={11} className="text-[#2F6FE4]" />
                <span>เพศพนักงาน (Gender)</span>
              </label>
              <div className="relative">
                <select
                  id="filter-gender"
                  value={filters.gender}
                  onChange={(e) => handleFilterChange("gender", e.target.value)}
                  className={`w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800 dark:text-slate-200 cursor-pointer appearance-none bg-no-repeat bg-[right_10px_center] bg-[size:10px_10px] ${
                    filters.gender !== "All" 
                      ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/40 font-medium" 
                      : "border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-blue-500/40"
                  }`}
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")` }}
                >
                  <option value="All">ทุกกลุ่มเพศสภาพ</option>
                  <option value="ชาย">เพศชาย</option>
                  <option value="หญิง">เพศหญิง</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Users size={13} className={filters.gender !== "All" ? "text-blue-500" : "text-slate-400 dark:text-slate-500"} />
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Filter chips list */}
      {hasActiveFilters && (
        <div className="mt-4 pt-3 border-t border-slate-100/70 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mr-1 select-none">คัดกรองอยู่:</span>
          {activeFiltersList.map((tag) => (
            <div 
              key={tag.key} 
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-light bg-blue-50/60 border border-blue-100/40 rounded-lg text-blue-600 transition-all"
            >
              <span className="opacity-75">{tag.label}:</span>
              <span className="font-normal text-slate-700">{tag.value}</span>
              <button 
                onClick={() => removeFilter(tag.key)}
                className="hover:bg-rose-100 hover:text-rose-600 p-0.5 rounded-full cursor-pointer transition-colors"
                title="ลบตัวกรองนี้"
              >
                <X size={9} />
              </button>
            </div>
          ))}

          <button
            onClick={resetFilters}
            className="text-[10px] font-light text-rose-500 hover:text-rose-600 transition-colors cursor-pointer ml-auto pl-2"
          >
            ล้างทั้งหมด
          </button>
        </div>
      )}

    </div>
  );
}
