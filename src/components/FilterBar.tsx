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
  compact?: boolean;
};

const mainBlue = "#2F6FE4";

function FilterSelect({
  id,
  label,
  value,
  icon: Icon,
  options,
  onChange,
  compact = false,
}: FilterSelectProps) {
  const isActive = value !== "All" && value !== "";

  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium text-slate-500"
      >
        <Icon size={11} className={isActive ? "text-[#2F6FE4]" : "text-slate-400"} />
        <span className="truncate">{label}</span>
      </label>

      <div className="relative group">
        <div
          className={`pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1 transition-colors ${
            isActive ? "bg-blue-50 text-[#2F6FE4]" : "bg-slate-100/70 text-slate-400 group-focus-within:text-[#2F6FE4]"
          }`}
        >
          <Icon size={13} />
        </div>

        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${compact ? "h-10" : "h-11"} w-full appearance-none rounded-2xl border bg-white py-0 pl-11 pr-9 text-xs font-normal text-slate-800 shadow-sm outline-none transition-all duration-200 hover:border-blue-300 hover:shadow-md focus:border-[#2F6FE4] focus:ring-4 focus:ring-blue-500/10 ${
            isActive
              ? "border-blue-300 bg-blue-50/40 text-[#1F2D3D]"
              : "border-slate-200"
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#2F6FE4]"
        />
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
  // เปิดไว้ก่อนเพื่อให้ filter bar ดูครบถ้วนเหมือน control panel จริง
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

    if (filters.businessLine !== "All") {
      list.push({ key: "businessLine", label: "สายงาน", value: filters.businessLine });
    }
    if (filters.level !== "All") {
      list.push({ key: "level", label: "ระดับ", value: filters.level });
    }
    if (filters.region !== "All") {
      list.push({ key: "region", label: "ภูมิภาค", value: filters.region });
    }
    if (filters.contractType !== "All") {
      list.push({ key: "contractType", label: "สัญญาจ้าง", value: filters.contractType });
    }
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
    if (filters.gender !== "All") {
      list.push({ key: "gender", label: "เพศ", value: filters.gender });
    }
    if (filters.retirementRisk !== "All") {
      const v =
        filters.retirementRisk === "r1"
          ? "วิกฤตใน 1 ปี"
          : filters.retirementRisk === "r3"
            ? "เฝ้าระวังใน 3 ปี"
            : "เตรียมการใน 5 ปี";
      list.push({ key: "retirementRisk", label: "เกษียณ", value: v });
    }
    if (filters.successionStatus !== "All") {
      const v =
        filters.successionStatus === "None"
          ? "ไม่มีผู้สืบทอด"
          : filters.successionStatus === "Ready Now"
            ? "พร้อมทันที"
            : filters.successionStatus;
      list.push({ key: "successionStatus", label: "Succession", value: v });
    }
    if (filters.performanceRating !== "All") {
      list.push({ key: "performanceRating", label: "ผลงาน", value: filters.performanceRating });
    }
    if (filters.resignType !== "All") {
      list.push({ key: "resignType", label: "ประเภทลาออก", value: filters.resignType });
    }
    if (filters.resignReason !== "All") {
      list.push({ key: "resignReason", label: "เหตุผลลาออก", value: filters.resignReason });
    }
    if (filters.searchQuery.trim() !== "") {
      list.push({ key: "searchQuery", label: "คำค้นหา", value: filters.searchQuery });
    }

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
      {/* Background accents */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute inset-x-8 top-0 h-[3px] rounded-full bg-gradient-to-r from-[#2F6FE4] via-cyan-400 to-emerald-400" />

      <div className="relative z-10 space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-[#2F6FE4] shadow-sm ring-1 ring-blue-100/70">
              <SlidersHorizontal size={19} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium text-slate-900">
                  แผงวิเคราะห์และค้นหาข้อมูลกำลังพล
                </h3>
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

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className={`inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-xs font-medium transition-all ${
                hasActiveFilters
                  ? "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-100 active:scale-[0.98]"
                  : "cursor-not-allowed bg-slate-50 text-slate-300 ring-1 ring-slate-100"
              }`}
            >
              <RotateCcw size={14} />
              <span>รีเซ็ต</span>
            </button>

            <button
              type="button"
              onClick={onExportExcel}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 text-xs font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/25 active:scale-[0.98]"
            >
              <FileSpreadsheet size={14} />
              <span>ส่งออก Excel</span>
            </button>

            <button
              type="button"
              onClick={onExportPDF}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#2F6FE4] to-[#1E52B6] px-4 text-xs font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 active:scale-[0.98]"
            >
              <FileText size={14} />
              <span>พิมพ์รายงาน PDF</span>
            </button>
          </div>
        </div>

        {/* Result health strip */}
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

        {/* Main filters */}
        <div className="rounded-[26px] border border-slate-100 bg-slate-50/70 p-4 shadow-inner shadow-slate-200/20">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-5">
              <label
                htmlFor="filter-search-query"
                className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium text-slate-500"
              >
                <Search size={11} className="text-[#2F6FE4]" />
                <span>ค้นหาด่วน</span>
              </label>

              <div className="relative group">
                <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 rounded-xl bg-blue-50 p-1.5 text-[#2F6FE4] transition-colors group-focus-within:bg-[#2F6FE4] group-focus-within:text-white">
                  <Search size={14} />
                </div>

                <input
                  ref={searchInputRef}
                  type="text"
                  id="filter-search-query"
                  placeholder="ค้นหาชื่อพนักงาน รหัส ฝ่าย หรือตำแหน่งงาน..."
                  value={filters.searchQuery}
                  onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white py-0 pl-12 pr-16 text-xs font-normal text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-blue-300 hover:shadow-md focus:border-[#2F6FE4] focus:ring-4 focus:ring-blue-500/10"
                />

                {!filters.searchQuery && (
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-normal text-slate-400 transition-opacity group-focus-within:opacity-0">
                    / หรือ ⌘K
                  </div>
                )}

                {filters.searchQuery && (
                  <button
                    type="button"
                    onClick={() => removeFilter("searchQuery")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-500"
                    aria-label="ลบคำค้นหา"
                  >
                    <X size={13} />
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
                className={`flex h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 text-xs font-medium shadow-sm transition-all active:scale-[0.98] ${
                  isAdvancedOpen
                    ? "bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800"
                    : "bg-white text-[#2F6FE4] ring-1 ring-blue-100 hover:bg-blue-50"
                }`}
              >
                <Filter size={14} />
                <span>{isAdvancedOpen ? "ซ่อนตัวกรอง" : "ตัวกรองเพิ่มเติม"}</span>
                {isAdvancedOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
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
                compact
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
                compact
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
                compact
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
                compact
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
                compact
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

        {/* Active filter chips */}
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
                    className="rounded-full p-0.5 text-slate-400 transition-colors hover:bg-white hover:text-rose-500"
                    title="ลบตัวกรองนี้"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-[11px] font-light text-slate-400">
                ยังไม่ได้เลือกเงื่อนไขเพิ่มเติม แสดงข้อมูลทั้งหมด
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-medium text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              ล้างทั้งหมด
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
