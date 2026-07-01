/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  RotateCcw, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  X, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Check,
  Building,
  MapPin,
  Briefcase,
  Users,
  Layers,
  Sparkles,
  Award,
  ShieldCheck,
  TrendingUp
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

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const removeFilter = (key: keyof FilterState) => {
    handleFilterChange(key, "All");
  };

  // Check if any filter is active
  const activeFiltersList = React.useMemo(() => {
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
      className="bg-white border border-[#E2ECF5]/80 rounded-2xl p-6 mb-8 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
    >
      {/* Decorative vertical colored accent */}
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#2F6FE4]" />

      {/* 1. Header Information Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-100 mb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-gradient-to-tr from-[#2F6FE4] to-[#4C8DFF] text-white rounded-xl shrink-0 shadow-xs">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#1F2D3D] tracking-tight flex items-center gap-2">
              <span>แผงควบคุมและคัดกรองข้อมูลผู้บริหาร</span>
              <span className="bg-[#2F6FE4]/10 text-[#2F6FE4] text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase">
                Console Active
              </span>
            </h3>
            <p className="text-[11px] text-[#5B6B7F] mt-1 font-normal leading-relaxed">
              สืบค้นและคัดกรองพนักงานรายกลุ่มแบบเรียลไทม์: พบกำลังพลพิจารณา <span className="font-semibold text-[#2F6FE4] bg-[#2F6FE4]/8 px-1.5 py-0.5 rounded text-xs">{filteredCount.toLocaleString()} คน</span> จากทั้งหมด {totalCount.toLocaleString()} คน ({filteredPercentage.toFixed(1)}%)
            </p>
          </div>
        </div>

        {/* Top-Right Quick Actions Row */}
        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters && (
            <button
              id="reset-filters-btn"
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#F36B6B] hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw size={13} />
              <span>ล้างตัวกรอง ({activeFiltersList.length})</span>
            </button>
          )}

          <button
            id="export-excel-btn"
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2DBE7F] hover:bg-[#239B66] hover:shadow-xs rounded-xl transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <FileSpreadsheet size={13} />
            <span>ส่งออก Excel (.csv)</span>
          </button>

          <button
            id="export-pdf-btn"
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#4C8DFF] hover:bg-[#2F6FE4] hover:shadow-xs rounded-xl transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <FileText size={13} />
            <span>พิมพ์รายงาน PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Filters (Always Visible) */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Real-time Dynamic Search Bar */}
          <div className="md:col-span-4 relative">
            <label htmlFor="filter-search-query" className="block text-[11px] font-semibold text-[#5B6B7F] mb-1.5 flex items-center gap-1.5">
              <Search size={11} className="text-[#2F6FE4]" />
              <span>สืบค้นด้วยชื่อ / รหัส / ตำแหน่ง (Search)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="filter-search-query"
                placeholder="พิมพ์ชื่อ, รหัสพนักงาน, ฝ่ายงาน, หรือตำแหน่ง..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border border-[#DCE6F2] bg-[#F8FAFC] text-[#1F2D3D] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/15 focus:border-[#2F6FE4] focus:bg-white transition-all shadow-xs"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={13} />
              </div>
              {filters.searchQuery && (
                <button
                  onClick={() => removeFilter("searchQuery")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Business Line Select */}
          <div className="md:col-span-4">
            <label htmlFor="filter-business-line" className="block text-[11px] font-semibold text-[#5B6B7F] mb-1.5 flex items-center gap-1.5">
              <Building size={11} className="text-[#2F6FE4]" />
              <span>สายงานการบริหารหลัก (Business Line)</span>
            </label>
            <div className="relative">
              <select
                id="filter-business-line"
                value={filters.businessLine}
                onChange={(e) => handleFilterChange("businessLine", e.target.value)}
                className={`w-full pl-8.5 pr-8 py-2.5 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/12 transition-all text-[#1F2D3D] cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[size:10px_10px] ${
                  filters.businessLine !== "All" 
                    ? "border-[#2F6FE4] bg-[#2F6FE4]/4 font-medium shadow-xs" 
                    : "border-[#DCE6F2] bg-[#F8FAFC] hover:border-[#2F6FE4]/40"
                }`}
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235B6B7F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")` }}
              >
                <option value="All">สายงานทั้งหมด ({businessLines.length} สายงาน)</option>
                {businessLines.map(line => (
                  <option key={line} value={line}>{line}</option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Building size={13} className={filters.businessLine !== "All" ? "text-[#2F6FE4]" : "text-slate-400"} />
              </div>
            </div>
          </div>

          {/* Employee Level Select */}
          <div className="md:col-span-2">
            <label htmlFor="filter-level" className="block text-[11px] font-semibold text-[#5B6B7F] mb-1.5 flex items-center gap-1.5">
              <Award size={11} className="text-[#2F6FE4]" />
              <span>ระดับตำแหน่ง (Level)</span>
            </label>
            <div className="relative">
              <select
                id="filter-level"
                value={filters.level}
                onChange={(e) => handleFilterChange("level", e.target.value)}
                className={`w-full pl-8.5 pr-8 py-2.5 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/12 transition-all text-[#1F2D3D] cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[size:10px_10px] ${
                  filters.level !== "All" 
                    ? "border-[#2F6FE4] bg-[#2F6FE4]/4 font-medium shadow-xs" 
                    : "border-[#DCE6F2] bg-[#F8FAFC] hover:border-[#2F6FE4]/40"
                }`}
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235B6B7F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")` }}
              >
                <option value="All">ทุกระดับ ({levels.length})</option>
                {levels.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Award size={13} className={filters.level !== "All" ? "text-[#2F6FE4]" : "text-slate-400"} />
              </div>
            </div>
          </div>

          {/* Toggle Advanced Filters Button */}
          <div className="md:col-span-2">
            <span className="block text-[11px] font-semibold text-transparent mb-1.5 select-none">-</span>
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`w-full py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none border ${
                isAdvancedOpen 
                  ? "bg-[#2F6FE4] text-white border-transparent shadow-sm" 
                  : "bg-slate-50 text-[#5B6B7F] border-[#DCE6F2] hover:bg-slate-100"
              }`}
            >
              <span>ตัวกรองขั้นสูง</span>
              {isAdvancedOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          </div>

        </div>

        {/* 3. Collapsible Advanced Filters Row */}
        {isAdvancedOpen && (
          <div className="pt-4 border-t border-[#DCE6F2]/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-pop-in">
            
            {/* Region Select */}
            <div>
              <label htmlFor="filter-region" className="block text-[11px] font-semibold text-[#5B6B7F] mb-1.5 flex items-center gap-1">
                <MapPin size={11} className="text-[#2F6FE4]" />
                <span>สังกัดภูมิภาค (Region)</span>
              </label>
              <div className="relative">
                <select
                  id="filter-region"
                  value={filters.region}
                  onChange={(e) => handleFilterChange("region", e.target.value)}
                  className={`w-full pl-8 pr-8 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/12 transition-all text-[#1F2D3D] cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[size:10px_10px] ${
                    filters.region !== "All" 
                      ? "border-[#2F6FE4] bg-[#2F6FE4]/4 font-medium" 
                      : "border-[#DCE6F2] bg-[#F8FAFC] hover:border-[#2F6FE4]/40"
                  }`}
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235B6B7F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")` }}
                >
                  <option value="All">ทุกภูมิภาค ({regions.length})</option>
                  {regions.map(reg => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <MapPin size={12} className={filters.region !== "All" ? "text-[#2F6FE4]" : "text-slate-400"} />
                </div>
              </div>
            </div>

            {/* Contract Type Select */}
            <div>
              <label htmlFor="filter-contract-type" className="block text-[11px] font-semibold text-[#5B6B7F] mb-1.5 flex items-center gap-1">
                <Layers size={11} className="text-[#2F6FE4]" />
                <span>ประเภทสัญญาจ้าง</span>
              </label>
              <div className="relative">
                <select
                  id="filter-contract-type"
                  value={filters.contractType}
                  onChange={(e) => handleFilterChange("contractType", e.target.value)}
                  className={`w-full pl-8 pr-8 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/12 transition-all text-[#1F2D3D] cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[size:10px_10px] ${
                    filters.contractType !== "All" 
                      ? "border-[#2F6FE4] bg-[#2F6FE4]/4 font-medium" 
                      : "border-[#DCE6F2] bg-[#F8FAFC] hover:border-[#2F6FE4]/40"
                  }`}
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235B6B7F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")` }}
                >
                  <option value="All">สัญญาทุกประเภท</option>
                  <option value="พนักงานประจำ">พนักงานประจำ</option>
                  <option value="พนักงานสัญญาจ้าง">พนักงานสัญญาจ้าง</option>
                </select>
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Layers size={12} className={filters.contractType !== "All" ? "text-[#2F6FE4]" : "text-slate-400"} />
                </div>
              </div>
            </div>

            {/* Front / Back Office Select */}
            <div>
              <label htmlFor="filter-front-back" className="block text-[11px] font-semibold text-[#5B6B7F] mb-1.5 flex items-center gap-1">
                <Briefcase size={11} className="text-[#2F6FE4]" />
                <span>ลักษณะปฏิบัติงาน</span>
              </label>
              <div className="relative">
                <select
                  id="filter-front-back"
                  value={filters.frontBack}
                  onChange={(e) => handleFilterChange("frontBack", e.target.value)}
                  className={`w-full pl-8 pr-8 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/12 transition-all text-[#1F2D3D] cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[size:10px_10px] ${
                    filters.frontBack !== "All" 
                      ? "border-[#2F6FE4] bg-[#2F6FE4]/4 font-medium" 
                      : "border-[#DCE6F2] bg-[#F8FAFC] hover:border-[#2F6FE4]/40"
                  }`}
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235B6B7F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")` }}
                >
                  <option value="All">ทุกระบบงาน</option>
                  <option value="Front">Front Office (ตลาด/สาขา)</option>
                  <option value="Back">Back Office (สำนักงานใหญ่)</option>
                </select>
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Briefcase size={12} className={filters.frontBack !== "All" ? "text-[#2F6FE4]" : "text-slate-400"} />
                </div>
              </div>
            </div>

            {/* Head Office / Branch Location */}
            <div>
              <label htmlFor="filter-hb" className="block text-[11px] font-semibold text-[#5B6B7F] mb-1.5 flex items-center gap-1">
                <Building size={11} className="text-[#2F6FE4]" />
                <span>ที่ตั้งปฏิบัติงาน</span>
              </label>
              <div className="relative">
                <select
                  id="filter-hb"
                  value={filters.hb}
                  onChange={(e) => handleFilterChange("hb", e.target.value)}
                  className={`w-full pl-8 pr-8 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/12 transition-all text-[#1F2D3D] cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[size:10px_10px] ${
                    filters.hb !== "All" 
                      ? "border-[#2F6FE4] bg-[#2F6FE4]/4 font-medium" 
                      : "border-[#DCE6F2] bg-[#F8FAFC] hover:border-[#2F6FE4]/40"
                  }`}
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235B6B7F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")` }}
                >
                  <option value="All">ทุกอาคารปฏิบัติการ</option>
                  <option value="Head Office">สำนักงานใหญ่ (HQ)</option>
                  <option value="Branch">สาขาบริการ (Branch)</option>
                </select>
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Building size={12} className={filters.hb !== "All" ? "text-[#2F6FE4]" : "text-slate-400"} />
                </div>
              </div>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="filter-gender" className="block text-[11px] font-semibold text-[#5B6B7F] mb-1.5 flex items-center gap-1">
                <Users size={11} className="text-[#2F6FE4]" />
                <span>เพศพนักงาน</span>
              </label>
              <div className="relative">
                <select
                  id="filter-gender"
                  value={filters.gender}
                  onChange={(e) => handleFilterChange("gender", e.target.value)}
                  className={`w-full pl-8 pr-8 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/12 transition-all text-[#1F2D3D] cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[size:10px_10px] ${
                    filters.gender !== "All" 
                      ? "border-[#2F6FE4] bg-[#2F6FE4]/4 font-medium" 
                      : "border-[#DCE6F2] bg-[#F8FAFC] hover:border-[#2F6FE4]/40"
                  }`}
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235B6B7F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")` }}
                >
                  <option value="All">ทุกกลุ่มเพศสภาพ</option>
                  <option value="ชาย">เพศชาย (Male)</option>
                  <option value="หญิง">เพศหญิง (Female)</option>
                </select>
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Users size={12} className={filters.gender !== "All" ? "text-[#2F6FE4]" : "text-slate-400"} />
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 4. Active Filters Summary Chips Section */}
      {hasActiveFilters && (
        <div className="mt-5 pt-4.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold text-[#5B6B7F] uppercase tracking-wider mr-1">เงื่อนไขคัดกรองที่ใช้งานอยู่:</span>
          {activeFiltersList.map((tag) => (
            <div 
              key={tag.key} 
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold bg-[#2F6FE4]/8 border border-[#2F6FE4]/15 rounded-lg text-[#2F6FE4] hover:bg-[#2F6FE4]/12 transition-colors duration-150"
            >
              <span className="opacity-80">{tag.label}:</span>
              <span className="text-slate-850 font-bold">{tag.value}</span>
              <button 
                onClick={() => removeFilter(tag.key)}
                className="hover:bg-red-200 hover:text-red-700 p-0.5 rounded-full cursor-pointer text-[#2F6FE4] transition-colors"
                title="ลบตัวกรองนี้"
              >
                <X size={10} />
              </button>
            </div>
          ))}

          <button
            onClick={resetFilters}
            className="text-[10px] font-bold text-[#F36B6B] hover:text-red-600 transition-colors cursor-pointer ml-auto pl-2"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      )}

    </div>
  );
}
