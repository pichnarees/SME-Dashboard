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
  CheckCircle2,
  Database,
  Sparkles,
  Filter,
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

type FilterOption = {
  value: string;
  label: string;
};

type FilterSelectProps = {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  options: FilterOption[];
  onChange: (value: string) => void;
};

function FilterSelect({ id, label, value, icon: Icon, options, onChange }: FilterSelectProps) {
  const isActive = value !== "All" && value !== "";

  return (
    <div className="filter-field-group min-w-0">
      <label htmlFor={id} className="filter-label">
        <Icon size={14} className={isActive ? "text-[#2F6FE4]" : "text-slate-500"} />
        <span className="truncate">{label}</span>
      </label>

      <div className={`filter-standard-field ${isActive ? "is-active" : ""}`}>
        <span className="filter-standard-icon" aria-hidden="true">
          <Icon size={17} />
        </span>

        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="filter-standard-select"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="filter-standard-chevron" size={18} aria-hidden="true" />
      </div>
    </div>
  );
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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
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
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const removeFilter = (key: keyof FilterState) => {
    handleFilterChange(key, key === "searchQuery" ? "" : "All");
  };

  const activeFiltersList = useMemo(() => {
    const list: { key: keyof FilterState; label: string; value: string }[] = [];

    if (filters.businessLine !== "All") list.push({ key: "businessLine", label: "สายงาน", value: filters.businessLine });
    if (filters.level !== "All") list.push({ key: "level", label: "ระดับ", value: filters.level });
    if (filters.region !== "All") list.push({ key: "region", label: "ภูมิภาค", value: filters.region });
    if (filters.contractType !== "All") list.push({ key: "contractType", label: "สัญญาจ้าง", value: filters.contractType });
    if (filters.frontBack !== "All") {
      list.push({
        key: "frontBack",
        label: "ลักษณะงาน",
        value: filters.frontBack === "Front" ? "Front Office" : "Back Office",
      });
    }
    if (filters.hb !== "All") {
      list.push({
        key: "hb",
        label: "ที่ตั้ง",
        value: filters.hb === "Head Office" ? "สำนักงานใหญ่" : "สาขาภูมิภาค",
      });
    }
    if (filters.gender !== "All") list.push({ key: "gender", label: "เพศ", value: filters.gender });
    if (filters.retirementRisk !== "All") {
      const value =
        filters.retirementRisk === "r1"
          ? "วิกฤตใน 1 ปี"
          : filters.retirementRisk === "r3"
            ? "เฝ้าระวังใน 3 ปี"
            : "เตรียมการใน 5 ปี";
      list.push({ key: "retirementRisk", label: "เกษียณ", value });
    }
    if (filters.successionStatus !== "All") {
      const value =
        filters.successionStatus === "None"
          ? "ไม่มีผู้สืบทอด"
          : filters.successionStatus === "Ready Now"
            ? "พร้อมทันที"
            : filters.successionStatus;
      list.push({ key: "successionStatus", label: "Succession", value });
    }
    if (filters.performanceRating !== "All") list.push({ key: "performanceRating", label: "ผลงาน", value: filters.performanceRating });
    if (filters.resignType !== "All") list.push({ key: "resignType", label: "ประเภทลาออก", value: filters.resignType });
    if (filters.resignReason !== "All") list.push({ key: "resignReason", label: "เหตุผลลาออก", value: filters.resignReason });
    if (filters.searchQuery.trim() !== "") list.push({ key: "searchQuery", label: "คำค้นหา", value: filters.searchQuery });

    return list;
  }, [filters]);

  const hasActiveFilters = activeFiltersList.length > 0;
  const filteredPercentage = totalCount > 0 ? (filteredCount / totalCount) * 100 : 0;
  const safePercentage = Math.max(0, Math.min(100, filteredPercentage));

  return (
    <section
      id="filter-bar-container"
      className="relative mb-7 overflow-hidden rounded-[32px] border border-white/80 bg-white/90 p-5 shadow-[0_20px_60px_-32px_rgba(30,82,182,0.45)] backdrop-blur-xl md:p-6"
    >
      <style>{`
        /*
          FilterBar scoped reset
          This intentionally uses a higher specificity than the global index.css rules:
          .theme-light #filter-bar-container input/select
          so the native input/select will NOT render as a second field inside the custom field.
        */

        #filter-bar-container,
        #filter-bar-container * {
          box-sizing: border-box !important;
        }

        #filter-bar-container .filter-label {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          margin: 0 0 8px 0 !important;
          min-height: 20px !important;
          font-size: 13px !important;
          line-height: 20px !important;
          font-weight: 500 !important;
          color: #64748B !important;
        }

        #filter-bar-container .filter-label svg {
          width: 15px !important;
          height: 15px !important;
          flex: 0 0 15px !important;
          display: block !important;
        }

        #filter-bar-container .filter-standard-field {
          position: relative !important;
          height: 46px !important;
          min-height: 46px !important;
          width: 100% !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          padding: 0 14px !important;
          border: 1px solid #D9E5F2 !important;
          border-radius: 18px !important;
          background: rgba(255, 255, 255, 0.97) !important;
          box-shadow: 0 8px 22px -18px rgba(30, 82, 182, 0.36) !important;
          transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease !important;
          overflow: hidden !important;
        }

        #filter-bar-container .filter-standard-field:hover {
          border-color: #9FC1F7 !important;
          box-shadow: 0 12px 28px -20px rgba(47, 111, 228, 0.42) !important;
        }

        #filter-bar-container .filter-standard-field:focus-within,
        #filter-bar-container .filter-standard-field.is-active {
          border-color: #2F6FE4 !important;
          background: #FFFFFF !important;
          box-shadow: 0 0 0 4px rgba(47, 111, 228, 0.11), 0 12px 28px -20px rgba(47, 111, 228, 0.46) !important;
        }

        #filter-bar-container .filter-standard-icon {
          width: 32px !important;
          height: 32px !important;
          min-width: 32px !important;
          max-width: 32px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 13px !important;
          color: #52627A !important;
          background: #F3F7FC !important;
          line-height: 1 !important;
          flex: 0 0 32px !important;
        }

        #filter-bar-container .filter-standard-icon svg {
          width: 17px !important;
          height: 17px !important;
          display: block !important;
          flex: 0 0 17px !important;
        }

        #filter-bar-container .filter-standard-field.is-active .filter-standard-icon,
        #filter-bar-container .filter-standard-field:focus-within .filter-standard-icon {
          color: #2F6FE4 !important;
          background: #EEF5FF !important;
        }

        /*
          Native input/select reset inside the custom field.
          High specificity + !important is required because index.css has global filter input/select rules.
        */
        .theme-light #filter-bar-container .filter-standard-field > input.filter-standard-input,
        .theme-light #filter-bar-container .filter-standard-field > select.filter-standard-select,
        .theme-dark #filter-bar-container .filter-standard-field > input.filter-standard-input,
        .theme-dark #filter-bar-container .filter-standard-field > select.filter-standard-select,
        #filter-bar-container .filter-standard-field > input.filter-standard-input,
        #filter-bar-container .filter-standard-field > select.filter-standard-select {
          flex: 1 1 auto !important;
          min-width: 0 !important;
          width: 100% !important;
          height: 100% !important;
          min-height: 0 !important;
          max-height: none !important;

          display: block !important;
          padding: 0 !important;
          margin: 0 !important;

          border: 0 !important;
          outline: 0 !important;
          box-shadow: none !important;
          background: transparent !important;
          border-radius: 0 !important;

          color: #1E293B !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          line-height: 46px !important;
          letter-spacing: 0 !important;
          vertical-align: middle !important;

          appearance: none !important;
          -webkit-appearance: none !important;
          background-image: none !important;
          box-sizing: border-box !important;
          transform: none !important;
        }

        .theme-light #filter-bar-container .filter-standard-field > select.filter-standard-select,
        .theme-dark #filter-bar-container .filter-standard-field > select.filter-standard-select,
        #filter-bar-container .filter-standard-field > select.filter-standard-select {
          cursor: pointer !important;
          padding-right: 2px !important;
          text-indent: 0 !important;
        }

        .theme-light #filter-bar-container .filter-standard-field > input.filter-standard-input::placeholder,
        .theme-dark #filter-bar-container .filter-standard-field > input.filter-standard-input::placeholder,
        #filter-bar-container .filter-standard-field > input.filter-standard-input::placeholder {
          color: #94A3B8 !important;
          opacity: 1 !important;
          font-size: 14px !important;
          font-weight: 400 !important;
        }

        #filter-bar-container .filter-standard-chevron {
          width: 18px !important;
          height: 18px !important;
          min-width: 18px !important;
          flex: 0 0 18px !important;
          color: #64748B !important;
          pointer-events: none !important;
          display: block !important;
        }

        #filter-bar-container .filter-search-shortcut {
          height: 28px !important;
          min-width: 70px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 10px !important;
          border-radius: 12px !important;
          background: #F1F5F9 !important;
          color: #64748B !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          line-height: 1 !important;
          flex: 0 0 auto !important;
        }

        #filter-bar-container .filter-clear-search {
          width: 28px !important;
          height: 28px !important;
          min-width: 28px !important;
          padding: 0 !important;
          border-radius: 999px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #94A3B8 !important;
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
          line-height: 1 !important;
          flex: 0 0 28px !important;
        }

        #filter-bar-container .filter-clear-search:hover {
          color: #E11D48 !important;
          background: #FFF1F2 !important;
        }

        #filter-bar-container .filter-action-button,
        #filter-bar-container .filter-toggle-button {
          height: 46px !important;
          min-height: 46px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          padding: 0 18px !important;
          border-radius: 18px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          line-height: 1 !important;
          white-space: nowrap !important;
          box-sizing: border-box !important;
        }

        #filter-bar-container .filter-action-button svg,
        #filter-bar-container .filter-toggle-button svg {
          width: 16px !important;
          height: 16px !important;
          display: block !important;
          flex: 0 0 16px !important;
        }

        #filter-bar-container .filter-chip-remove,
        #filter-bar-container .filter-clear-all {
          height: auto !important;
          min-height: 0 !important;
          padding: 0 !important;
          border-radius: 999px !important;
          line-height: 1 !important;
        }

        #filter-bar-container .filter-chip-remove {
          width: 16px !important;
          height: 16px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
      `}</style>

      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute inset-x-8 top-0 h-[3px] rounded-full bg-gradient-to-r from-[#2F6FE4] via-cyan-400 to-emerald-400" />

      <div className="relative z-10 space-y-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-[#2F6FE4] shadow-sm ring-1 ring-blue-100/70">
              <SlidersHorizontal size={19} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium text-slate-900">แผงวิเคราะห์และค้นหาข้อมูลกำลังพล</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-600 ring-1 ring-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  ACTIVE COHORT
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-light text-slate-500">
                <span>ข้อมูลที่แสดงผล</span>
                <span className="rounded-xl bg-blue-50 px-2.5 py-1 text-sm font-medium text-[#2F6FE4] ring-1 ring-blue-100">
                  {filteredCount.toLocaleString()} คน
                </span>
                <span>จากทั้งหมด {totalCount.toLocaleString()} คน</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-normal text-slate-500">
                  {filteredPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 xl:justify-end bg-slate-50/60 p-1.5 rounded-[24px] border border-slate-200/40 backdrop-blur-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
            <button
              type="button"
              id="reset-filters-btn"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className={`filter-action-button transition-all duration-300 relative overflow-hidden cursor-pointer ${
                hasActiveFilters
                  ? "bg-white text-slate-700 shadow-xs border border-slate-200 hover:bg-rose-50/80 hover:text-rose-600 hover:border-rose-200/80 active:scale-[0.97]"
                  : "cursor-not-allowed bg-slate-100/50 text-slate-400 border border-transparent opacity-60"
              }`}
            >
              <RotateCcw size={14} />
              <span>รีเซ็ต</span>
            </button>

            <button
              type="button"
              id="export-excel-btn"
              onClick={onExportExcel}
              className="filter-action-button bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] cursor-pointer border border-emerald-400/20"
            >
              <FileSpreadsheet size={14} />
              <span>ส่งออก Excel</span>
            </button>

            <button
              type="button"
              id="export-pdf-btn"
              onClick={onExportPDF}
              className="filter-action-button bg-gradient-to-r from-[#2F6FE4] to-[#1E52B6] hover:from-[#3b7bf0] hover:to-[#1a4aa6] text-white font-medium shadow-[0_4px_12px_rgba(47,111,228,0.2)] hover:shadow-[0_6px_20px_rgba(47,111,228,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] cursor-pointer border border-blue-400/20"
            >
              <FileText size={14} />
              <span>พิมพ์รายงาน PDF</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50 p-3.5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] font-normal text-slate-500">
              <Database size={13} className="text-[#2F6FE4]" />
              <span>สถานะข้อมูลหลังคัดกรอง</span>
              <span className="font-medium text-slate-800">
                {filteredCount.toLocaleString()} / {totalCount.toLocaleString()} คน
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-emerald-600 shadow-sm ring-1 ring-emerald-100">
              <CheckCircle2 size={12} />
              Synchronized
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white shadow-inner ring-1 ring-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2F6FE4] via-cyan-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${safePercentage}%` }}
            />
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-100 bg-slate-50/70 p-4 shadow-inner shadow-slate-200/20">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-5">
              <label htmlFor="filter-search-query" className="filter-label">
                <Search size={14} className="text-[#2F6FE4]" />
                <span>ค้นหาด่วน</span>
              </label>

              <div className="filter-standard-field">
                <span className="filter-standard-icon" aria-hidden="true">
                  <Search size={17} />
                </span>

                <input
                  ref={searchInputRef}
                  type="text"
                  id="filter-search-query"
                  placeholder="ค้นหาชื่อพนักงาน รหัส ฝ่าย หรือตำแหน่งงาน..."
                  value={filters.searchQuery}
                  onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                  className="filter-standard-input"
                />

                {!filters.searchQuery ? (
                  <span className="filter-search-shortcut">/ หรือ ⌘K</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeFilter("searchQuery")}
                    className="filter-clear-search"
                    aria-label="ลบคำค้นหา"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-3">
              <FilterSelect
                id="filter-business-line"
                label="สายงานหลัก"
                value={filters.businessLine}
                icon={Building}
                options={[
                  { value: "All", label: `สายงานทั้งหมด (${businessLines.length} สายงาน)` },
                  ...businessLines.map((line) => ({ value: line, label: line })),
                ]}
                onChange={(value) => handleFilterChange("businessLine", value)}
              />
            </div>

            <div className="lg:col-span-2">
              <FilterSelect
                id="filter-level"
                label="ระดับตำแหน่ง"
                value={filters.level}
                icon={Award}
                options={[
                  { value: "All", label: `ทุกระดับ (${levels.length})` },
                  ...levels.map((level) => ({ value: level, label: level })),
                ]}
                onChange={(value) => handleFilterChange("level", value)}
              />
            </div>

            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen((prev) => !prev)}
                className={`filter-toggle-button w-full transition-all active:scale-[0.98] ${
                  isAdvancedOpen
                    ? "bg-slate-900 text-white shadow-sm shadow-slate-900/10 hover:bg-slate-800"
                    : "bg-white text-[#2F6FE4] ring-1 ring-blue-100 hover:bg-blue-50"
                }`}
              >
                <Filter size={16} />
                <span>{isAdvancedOpen ? "ซ่อนตัวกรอง" : "ตัวกรองเพิ่มเติม"}</span>
                {isAdvancedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {isAdvancedOpen && (
            <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-200/70 pt-4 sm:grid-cols-2 xl:grid-cols-5">
              <FilterSelect
                id="filter-region"
                label="ภูมิภาค"
                value={filters.region}
                icon={MapPin}
                options={[
                  { value: "All", label: `ทุกภูมิภาค (${regions.length})` },
                  ...regions.map((region) => ({ value: region, label: region })),
                ]}
                onChange={(value) => handleFilterChange("region", value)}
              />

              <FilterSelect
                id="filter-contract-type"
                label="สัญญาจ้าง"
                value={filters.contractType}
                icon={Layers}
                options={[
                  { value: "All", label: "สัญญาทุกประเภท" },
                  { value: "พนักงานประจำ", label: "พนักงานประจำ" },
                  { value: "พนักงานสัญญาจ้าง", label: "พนักงานสัญญาจ้าง" },
                ]}
                onChange={(value) => handleFilterChange("contractType", value)}
              />

              <FilterSelect
                id="filter-front-back"
                label="ลักษณะงาน"
                value={filters.frontBack}
                icon={Briefcase}
                options={[
                  { value: "All", label: "ทุกระบบงาน" },
                  { value: "Front", label: "Front Office" },
                  { value: "Back", label: "Back Office" },
                ]}
                onChange={(value) => handleFilterChange("frontBack", value)}
              />

              <FilterSelect
                id="filter-hb"
                label="ที่ตั้งปฏิบัติงาน"
                value={filters.hb}
                icon={Building}
                options={[
                  { value: "All", label: "ทุกที่ตั้ง" },
                  { value: "Head Office", label: "สำนักงานใหญ่" },
                  { value: "Branch", label: "สาขาภูมิภาค" },
                ]}
                onChange={(value) => handleFilterChange("hb", value)}
              />

              <FilterSelect
                id="filter-gender"
                label="เพศพนักงาน"
                value={filters.gender}
                icon={Users}
                options={[
                  { value: "All", label: "ทุกกลุ่มเพศ" },
                  { value: "ชาย", label: "เพศชาย" },
                  { value: "หญิง", label: "เพศหญิง" },
                ]}
                onChange={(value) => handleFilterChange("gender", value)}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500">
              <Sparkles size={11} className="text-[#2F6FE4]" />
              ตัวกรองที่ใช้งาน
            </div>

            {hasActiveFilters ? (
              activeFiltersList.map((tag) => (
                <span
                  key={`${tag.key}-${tag.value}`}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-normal text-slate-700"
                >
                  <span className="text-blue-500">{tag.label}</span>
                  <span className="max-w-[180px] truncate">{tag.value}</span>
                  <button
                    type="button"
                    onClick={() => removeFilter(tag.key)}
                    className="filter-chip-remove text-slate-400 transition-colors hover:bg-white hover:text-rose-500"
                    title="ลบตัวกรองนี้"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-[11px] font-light text-slate-400">ยังไม่ได้เลือกเงื่อนไขเพิ่มเติม แสดงข้อมูลทั้งหมด</span>
            )}
          </div>

          {hasActiveFilters && (
            <button type="button" onClick={resetFilters} className="filter-clear-all shrink-0 px-3 py-1.5 text-[10px] font-medium text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600">
              ล้างทั้งหมด
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
