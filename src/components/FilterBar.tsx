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
    return list;
  }, [filters]);

  const hasActiveFilters = activeFiltersList.length > 0;

  return (
    <div id="filter-bar-container" className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 mb-6 shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* 1. Header Information Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#2F6FE4]/8 text-[#2F6FE4] rounded-xl shrink-0">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#1F2D3D] tracking-tight">แผงควบคุมและคัดกรองข้อมูลผู้บริหาร (Executive Filter Console)</h3>
            <p className="text-[11px] text-[#5B6B7F] font-light mt-0.5">
              คัดกรองผลกำลังพลแบบประสิทธิสัมพันธ์เรียลไทม์ ปัจจุบันกรองผลลัพธ์แล้ว <span className="font-medium text-[#2F6FE4] bg-[#2F6FE4]/5 px-1.5 py-0.5 rounded">{filteredCount.toLocaleString()} ท่าน</span> จากทั้งหมด {totalCount.toLocaleString()} ท่าน
            </p>
          </div>
        </div>

        {/* Top-Right Quick Actions Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="reset-filters-btn"
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#5B6B7F] bg-[#F8FAFC] hover:bg-[#E2ECF5]/60 border border-[#DCE6F2] rounded-xl hover:text-[#1F2D3D] transition-all cursor-pointer active:scale-95"
            title="ล้างตัวกรองทั้งหมด"
          >
            <RotateCcw size={13} />
            <span>ล้างตัวกรอง</span>
          </button>

          <div className="h-6 w-px bg-slate-100 hidden sm:block"></div>

          <button
            id="export-excel-btn"
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#2DBE7F] hover:bg-[#25A76E] border border-transparent rounded-xl shadow-sm transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <FileSpreadsheet size={13} />
            <span>ส่งออก Excel (.csv)</span>
          </button>

          <button
            id="export-pdf-btn"
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#FFB547] hover:bg-[#F39C12] border border-transparent rounded-xl shadow-sm transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <FileText size={13} />
            <span>พิมพ์รายงาน / PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Filters (Always Visible) */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          
          {/* Business Line Select */}
          <div className="lg:col-span-5">
            <label htmlFor="filter-business-line" className="block text-[11px] font-medium text-[#5B6B7F] mb-1.5">สายงานการบริหารหลัก (Business Line)</label>
            <select
              id="filter-business-line"
              value={filters.businessLine}
              onChange={(e) => handleFilterChange("businessLine", e.target.value)}
              className={`w-full px-3 py-2.5 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/8 transition-all text-[#1F2D3D] cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] ${
                filters.businessLine !== "All" 
                  ? "border-[#2F6FE4] bg-[#2F6FE4]/4 font-medium" 
                  : "border-[#DCE6F2] bg-[#F8FAFC] hover:border-[#2F6FE4]/40"
              }`}
              style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235B6B7F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, paddingRight: '32px' }}
            >
              <option value="All">สายงานทั้งหมด ({businessLines.length} สายงาน)</option>
              {businessLines.map(line => (
                <option key={line} value={line}>{line}</option>
              ))}
            </select>
          </div>

          {/* Employee Level Select */}
          <div className="lg:col-span-4">
            <label htmlFor="filter-level" className="block text-[11px] font-medium text-[#5B6B7F] mb-1.5">ระดับตำแหน่งพนักงาน (Level)</label>
            <select
              id="filter-level"
              value={filters.level}
              onChange={(e) => handleFilterChange("level", e.target.value)}
              className={`w-full px-3 py-2.5 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/8 transition-all text-[#1F2D3D] cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] ${
                filters.level !== "All" 
                  ? "border-[#2F6FE4] bg-[#2F6FE4]/4 font-medium" 
                  : "border-[#DCE6F2] bg-[#F8FAFC] hover:border-[#2F6FE4]/40"
              }`}
              style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235B6B7F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, paddingRight: '32px' }}
            >
              <option value="All">ระดับทั้งหมด ({levels.length} ชั้น)</option>
              {levels.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          {/* Toggle Advanced Filters Button */}
          <div className="lg:col-span-3">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`w-full py-2.5 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none border border-dashed ${
                isAdvancedOpen 
                  ? "bg-[#2F6FE4]/8 text-[#2F6FE4] border-[#2F6FE4]/30" 
                  : "bg-[#F4F7FC] text-[#5B6B7F] border-[#DCE6F2] hover:bg-[#E2ECF5]/55"
              }`}
            >
              <span>ตัวกรองขั้นสูง</span>
              {isAdvancedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

        </div>

        {/* 3. Collapsible Advanced Filters Row */}
        {isAdvancedOpen && (
          <div className="pt-3 border-t border-[#DCE6F2]/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-fadeIn">
            
            {/* Region Select */}
            <div>
              <label htmlFor="filter-region" className="block text-[11px] font-medium text-[#5B6B7F] mb-1.5">เขตบริการ/สังกัดภูมิภาค (Region)</label>
              <select
                id="filter-region"
                value={filters.region}
                onChange={(e) => handleFilterChange("region", e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/8 transition-all text-[#1F2D3D] cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] ${
                  filters.region !== "All" 
                    ? "border-[#2F6FE4] bg-[#2F6FE4]/4 font-medium" 
                    : "border-[#DCE6F2] bg-[#F8FAFC] hover:border-[#2F6FE4]/40"
                }`}
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235B6B7F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, paddingRight: '32px' }}
              >
                <option value="All">ทุกเขตภูมิภาค ({regions.length})</option>
                {regions.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>

            {/* Contract Type Select */}
            <div>
              <label htmlFor="filter-contract-type" className="block text-[11px] font-medium text-[#5B6B7F] mb-1.5">รูปแบบสัญญาจ้างงาน (Employment Type)</label>
              <select
                id="filter-contract-type"
                value={filters.contractType}
                onChange={(e) => handleFilterChange("contractType", e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/8 transition-all text-[#1F2D3D] cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] ${
                  filters.contractType !== "All" 
                    ? "border-[#2F6FE4] bg-[#2F6FE4]/4 font-medium" 
                    : "border-[#DCE6F2] bg-[#F8FAFC] hover:border-[#2F6FE4]/40"
                }`}
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235B6B7F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, paddingRight: '32px' }}
              >
                <option value="All">สัญญาทุกประเภท</option>
                <option value="พนักงานประจำ">พนักงานประจำ (Regular)</option>
                <option value="พนักงานสัญญาจ้าง">พนักงานสัญญาจ้าง (Contract)</option>
              </select>
            </div>

            {/* Front / Back Office Select */}
            <div>
              <label htmlFor="filter-front-back" className="block text-[11px] font-medium text-[#5B6B7F] mb-1.5">ลักษณะสายงานหลัก (Office Function)</label>
              <select
                id="filter-front-back"
                value={filters.frontBack}
                onChange={(e) => handleFilterChange("frontBack", e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/8 transition-all text-[#1F2D3D] cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] ${
                  filters.frontBack !== "All" 
                    ? "border-[#2F6FE4] bg-[#2F6FE4]/4 font-medium" 
                    : "border-[#DCE6F2] bg-[#F8FAFC] hover:border-[#2F6FE4]/40"
                }`}
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235B6B7F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, paddingRight: '32px' }}
              >
                <option value="All">ทุกระบบการทำงาน</option>
                <option value="Front">Front Office (สายตลาด/สาขา)</option>
                <option value="Back">Back Office (สายสนับสนุน)</option>
              </select>
            </div>

            {/* Head Office / Branch Location */}
            <div>
              <label htmlFor="filter-hb" className="block text-[11px] font-medium text-[#5B6B7F] mb-1.5">พื้นที่ปฏิบัติการ (Location)</label>
              <select
                id="filter-hb"
                value={filters.hb}
                onChange={(e) => handleFilterChange("hb", e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/8 transition-all text-[#1F2D3D] cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] ${
                  filters.hb !== "All" 
                    ? "border-[#2F6FE4] bg-[#2F6FE4]/4 font-medium" 
                    : "border-[#DCE6F2] bg-[#F8FAFC] hover:border-[#2F6FE4]/40"
                }`}
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235B6B7F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, paddingRight: '32px' }}
              >
                <option value="All">ทุกจุดที่ตั้งอาคาร</option>
                <option value="Head Office">สำนักงานใหญ่ (HQ)</option>
                <option value="Branch">สาขาบริการย่อย (Branch)</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="filter-gender" className="block text-[11px] font-medium text-[#5B6B7F] mb-1.5">เพศพนักงาน (Gender)</label>
              <select
                id="filter-gender"
                value={filters.gender}
                onChange={(e) => handleFilterChange("gender", e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/8 transition-all text-[#1F2D3D] cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] ${
                  filters.gender !== "All" 
                    ? "border-[#2F6FE4] bg-[#2F6FE4]/4 font-medium" 
                    : "border-[#DCE6F2] bg-[#F8FAFC] hover:border-[#2F6FE4]/40"
                }`}
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235B6B7F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, paddingRight: '32px' }}
              >
                <option value="All">ทุกกลุ่มเพศสภาพ</option>
                <option value="ชาย">เพศชาย (Male)</option>
                <option value="หญิง">เพศหญิง (Female)</option>
              </select>
            </div>

          </div>
        )}

      </div>

      {/* 4. Active Filters Summary Chips Section */}
      {hasActiveFilters && (
        <div className="mt-4.5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-medium text-[#5B6B7F] uppercase tracking-wider mr-1">กำลังเลือกตัวกรอง:</span>
          {activeFiltersList.map((tag) => (
            <div 
              key={tag.key} 
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-medium bg-[#2F6FE4]/6 border border-[#2F6FE4]/12 rounded-lg text-[#2F6FE4]"
            >
              <span className="opacity-80">{tag.label}:</span>
              <span className="text-[#1F2D3D] font-medium">{tag.value}</span>
              <button 
                onClick={() => removeFilter(tag.key)}
                className="hover:bg-[#2F6FE4]/15 p-0.5 rounded-full cursor-pointer text-[#2F6FE4] transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          ))}

          <button
            onClick={resetFilters}
            className="text-[10px] font-medium text-[#F36B6B] hover:text-red-600 transition-colors cursor-pointer ml-auto pl-2"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      )}

      {/* 5. Minimal Instant Synchronized Notification Bar */}
      <div className="mt-4 flex items-center justify-between text-[10px] text-[#5B6B7F] bg-[#F8FAFC] border border-[#E2ECF5]/40 rounded-xl py-2 px-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DBE7F] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DBE7F]"></span>
          </span>
          <span className="font-light">ข้อมูลประชากรพนักงานปรับตามเงื่อนไขตัวกรองแบบทันทีทันใด</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[9px] text-[#5B6B7F]">
          <Check size={11} className="text-[#2DBE7F] stroke-[3px]" />
          <span className="font-medium uppercase tracking-wider">Synchronized</span>
        </div>
      </div>

    </div>
  );
}

