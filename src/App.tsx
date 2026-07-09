/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { generateHRData, Employee } from "./data/mockData";
import FilterBar, { FilterState } from "./components/FilterBar";
import ExecutiveOverview from "./components/ExecutiveOverview";
import OrganizationStructure from "./components/OrganizationStructure";
import WorkforceRisk from "./components/WorkforceRisk";
import TurnoverAnalysis from "./components/TurnoverAnalysis";
import { LayoutDashboard, Network, ShieldAlert, LogOut, X, User, Phone, Mail, Award, MapPin, Briefcase, Sparkles, Copy, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Generate entire bank workforce database (2,182 employees and 73 resignations)
  const { employees: allEmployees, resignations: allResignations } = useMemo(() => generateHRData(), []);

  // Theme State is strictly light mode (Exclusions: No dark mode, no eye-care mode)
  const theme = "light";

  // Top-level Global Filters State
  const [filters, setFilters] = useState<FilterState>({
    businessLine: "All",
    level: "All",
    frontBack: "All",
    hb: "All",
    contractType: "All",
    gender: "All",
    searchQuery: "",
    region: "All",
    retirementRisk: "All",
    successionStatus: "All",
    performanceRating: "All",
    resignType: "All",
    resignReason: "All",
  });

  // Selected Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "org" | "risk" | "turnover">("overview");

  // Selected Employee Detail Modal/Sidebar State
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Status message for successful exports
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Derive unique lists for filters
  const businessLines = useMemo(() => {
    return Array.from(new Set(allEmployees.map(e => e.businessLine))).sort();
  }, [allEmployees]);

  const levels = useMemo(() => {
    // High-to-low custom level order for dropdowns
    const order = [
      "Level 13 ขึ้นไป", "Level 12", "Level 11", "Level 10", "Level 9",
      "Level 8 ผู้ช่วยผู้จัดการ", "Level 8 เจ้าหน้าที่อาวุโส", "Level 7", "Level 6", "Level 5", "Level 4 หรือต่ำกว่า"
    ];
    return order.filter(o => allEmployees.some(e => e.level === o));
  }, [allEmployees]);

  const regions = useMemo(() => {
    return Array.from(new Set(allEmployees.filter(e => e.region).map(e => e.region))).sort();
  }, [allEmployees]);

  // Apply filters to Active Employees
  const filteredEmployees = useMemo(() => {
    return allEmployees.filter(emp => {
      if (filters.businessLine !== "All" && emp.businessLine !== filters.businessLine) return false;
      if (filters.level !== "All" && emp.level !== filters.level) return false;
      if (filters.frontBack !== "All" && emp.frontBack !== filters.frontBack) return false;
      if (filters.hb !== "All" && emp.hb !== filters.hb) return false;
      if (filters.contractType !== "All" && emp.contractType !== filters.contractType) return false;
      if (filters.gender !== "All" && emp.gender !== filters.gender) return false;
      if (filters.region !== "All" && emp.region !== filters.region) return false;
      if (filters.performanceRating !== "All" && emp.performanceRating !== filters.performanceRating) return false;
      if (filters.successionStatus !== "All" && emp.successionStatus !== filters.successionStatus) return false;
      
      if (filters.retirementRisk !== "All") {
        if (filters.retirementRisk === "r1" && emp.age !== 59) return false;
        if (filters.retirementRisk === "r3" && (emp.age < 57 || emp.age > 58)) return false;
        if (filters.retirementRisk === "r5" && (emp.age < 55 || emp.age > 56)) return false;
      }
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(query);
        const matchesId = emp.empId.toLowerCase().includes(query);
        const matchesPosition = emp.position.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesPosition) return false;
      }
      return true;
    });
  }, [allEmployees, filters]);

  // Apply filters to Resignations list
  const filteredResignations = useMemo(() => {
    return allResignations.filter(res => {
      if (filters.level !== "All" && res.level !== filters.level) return false;
      if (filters.contractType !== "All" && res.contractType !== filters.contractType) return false;
      if (filters.resignType !== "All" && res.resignType !== filters.resignType) return false;
      if (filters.resignReason !== "All" && res.resignReason !== filters.resignReason) return false;
      
      // Filter by text search
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = res.name.toLowerCase().includes(query);
        const matchesId = res.empId.toLowerCase().includes(query);
        const matchesPosition = res.position.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesPosition) return false;
      }
      return true;
    });
  }, [allResignations, filters]);

  // Reset Filters
  const resetFilters = () => {
    setFilters({
      businessLine: "All",
      level: "All",
      frontBack: "All",
      hb: "All",
      contractType: "All",
      gender: "All",
      searchQuery: "",
      region: "All",
      retirementRisk: "All",
      successionStatus: "All",
      performanceRating: "All",
      resignType: "All",
      resignReason: "All",
    });
    triggerToast("ล้างตัวกรองและรีเซ็ตข้อมูลแล้ว");
  };

  // Toast alert trigger helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Real UTF-8 Excel Exporter with Thai BOM Support
  const handleExportExcel = () => {
    const headers = [
      "รหัสพนักงาน", "ชื่อ-สกุล", "ประเภทสัญญา", "สายงาน", "กลุ่มงาน", "ฝ่าย/หน่วยงาน",
      "ตำแหน่ง", "ระดับ", "อายุตัว", "อายุงาน", "อีเมล", "เบอร์โทรศัพท์", "ภูมิภาค"
    ];
    const rows = filteredEmployees.map(emp => [
      emp.empId, emp.name, emp.contractType, emp.businessLine, emp.group, emp.department,
      emp.position, emp.level, emp.age, emp.tenure, emp.email, emp.mobile, emp.region
    ]);
    
    // Add UTF-8 Byte Order Mark (BOM) to force Excel to render Thai characters correctly
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SME_D_Bank_HR_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(`ส่งออกข้อมูลพนักงานจำนวน ${filteredEmployees.length} คน เรียบร้อยแล้ว`);
  };

  // Print friendly PDF trigger
  const handleExportPDF = () => {
    window.print();
    triggerToast("ส่งรายงานการวิเคราะห์ไปยังเครื่องพิมพ์/บันทึก PDF แล้ว");
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#2F6FE4]/15 print:bg-white print:p-0 transition-all duration-500 relative overflow-x-hidden z-0 theme-light bg-[#F8FAFC] text-[#1E293B]">
      {/* Premium Executive Ambient Background Tints */}
      <div className="absolute top-0 left-[-10%] w-[50vw] h-[50vw] max-w-[600px] rounded-full bg-gradient-to-br from-[#2F6FE4]/4 to-[#25B7D3]/2 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[25vh] right-[-10%] w-[45vw] h-[45vw] max-w-[500px] rounded-full bg-gradient-to-br from-indigo-500/4 to-purple-500/2 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10vh] left-[-15%] w-[50vw] h-[50vw] max-w-[600px] rounded-full bg-gradient-to-tr from-cyan-400/2 to-blue-500/3 blur-[130px] pointer-events-none -z-10" />

      {/* Toast Alert Popup */}
      {toastMessage && (
        <div id="toast-message" className="fixed top-6 right-6 z-50 bg-[#1E293B] text-white font-medium text-xs px-4 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-800">
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION (Premium Frosted Glass Redesigned) */}
      <header id="main-header" className="bg-white/95 backdrop-blur-xl border-b border-slate-200/40 py-3.5 px-6 sticky top-0 z-40 print:relative print:border-none print:shadow-none transition-all duration-300 shadow-sm shadow-slate-200/20">
        {/* Sleek Top Corporate Gradient Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#2F6FE4] via-[#2F6FE4] to-[#1E52B6]" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: Logo & System Titles */}
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            {/* Visual Bank Shield Emblem */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#2F6FE4] to-[#1E52B6] rounded-xl blur-sm opacity-20 group-hover:opacity-40 transition-all duration-300" />
              <div className="relative h-10 w-10 bg-[#2F6FE4] rounded-lg flex flex-col items-center justify-center text-white border border-white/10 shadow-sm shrink-0 select-none">
                <span className="text-[10px] font-medium tracking-wider leading-none">SME</span>
                <span className="text-[7.5px] font-light tracking-wide leading-none mt-0.5 opacity-90">D Bank</span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm font-medium tracking-tight text-slate-950">
                  SME D Bank
                </h1>
                <div className="flex gap-1 items-center">
                  <span className="bg-[#2F6FE4]/10 text-[#2F6FE4] text-[8.5px] font-medium px-2 py-0.5 rounded border border-[#2F6FE4]/10 tracking-wider">
                    EXECUTIVE PORTAL
                  </span>
                </div>
              </div>
              <h2 className="text-[10px] font-normal text-slate-500 mt-0.5 leading-none">
                ระบบวิเคราะห์อัตรากำลังและข้อมูลกำลังพลเชิงยุทธศาสตร์
              </h2>
            </div>
          </div>

          {/* Center or right-center: refined status/update info */}
          <div className="flex items-center justify-center w-full md:w-auto md:flex-1 md:justify-center">
            <div className="bg-slate-50 border border-slate-100 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-inner">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[9.5px] font-medium text-slate-400 uppercase tracking-wider">ฐานข้อมูลระบบสารสนเทศ:</span>
              <span className="text-[10px] font-mono text-slate-700">16 มิถุนายน 2569 (สืบค้นสด)</span>
            </div>
          </div>

          {/* Right Area: Profile */}
          <div className="flex items-center justify-end gap-3.5 w-full md:w-auto shrink-0">
            {/* Profile badge */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 rounded-xl p-1 pr-3 select-none">
              <div className="h-6.5 w-6.5 rounded-lg bg-gradient-to-tr from-[#2F6FE4] to-[#1E52B6] text-white font-medium text-[10px] flex items-center justify-center shadow-xs">
                EX
              </div>
              <div className="text-left leading-none">
                <span className="text-[10px] font-medium text-slate-800 block">ผู้บริหารระดับสูง</span>
                <span className="text-[8px] text-slate-400 block mt-0.5">SME D Bank Admin</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main id="main-content-section" className="max-w-7xl mx-auto w-full p-4 md:p-6 flex-1 flex flex-col">
        
        {/* Global Filter Bar */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
          businessLines={businessLines}
          levels={levels}
          regions={regions}
          filteredCount={filteredEmployees.length}
          totalCount={allEmployees.length}
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
        />

        {/* TAB NAVIGATION PANEL */}
        <div id="tab-navigation-bar" className="flex overflow-x-auto bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/30 mb-8 shrink-0 print:hidden gap-1 shadow-sm relative">
          <button
            onClick={() => setActiveTab("overview")}
            className={`relative flex items-center gap-2 px-5 py-2.5 text-xs font-medium rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer z-10 select-none outline-hidden group ${
              activeTab === "overview" 
                ? "text-white font-medium" 
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            {activeTab === "overview" && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-[#2F6FE4] rounded-xl shadow-md shadow-blue-500/20"
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <LayoutDashboard size={13.5} className={activeTab === "overview" ? "text-white" : "text-slate-500 group-hover:text-slate-700"} /> 
              <span>ภาพรวมผู้บริหาร (Executive Overview)</span>
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab("org")}
            className={`relative flex items-center gap-2 px-5 py-2.5 text-xs font-medium rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer z-10 select-none outline-hidden group ${
              activeTab === "org" 
                ? "text-white font-medium" 
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            {activeTab === "org" && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-[#2F6FE4] rounded-xl shadow-md shadow-blue-500/20"
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Network size={13.5} className={activeTab === "org" ? "text-white" : "text-slate-500 group-hover:text-slate-700"} /> 
              <span>โครงสร้างองค์กร (Organization Structure)</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("risk")}
            className={`relative flex items-center gap-2 px-5 py-2.5 text-xs font-medium rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer z-10 select-none outline-hidden group ${
              activeTab === "risk" 
                ? "text-white font-medium" 
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            {activeTab === "risk" && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-[#2F6FE4] rounded-xl shadow-md shadow-blue-500/20"
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <ShieldAlert size={13.5} className={activeTab === "risk" ? "text-white" : "text-slate-500 group-hover:text-slate-700"} /> 
              <span>ความเสี่ยงกำลังคน (Workforce Risk)</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("turnover")}
            className={`relative flex items-center gap-2 px-5 py-2.5 text-xs font-medium rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer z-10 select-none outline-hidden group ${
              activeTab === "turnover" 
                ? "text-white font-medium" 
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            {activeTab === "turnover" && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-[#2F6FE4] rounded-xl shadow-md shadow-blue-500/20"
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <LogOut size={13.5} className={activeTab === "turnover" ? "text-white" : "text-slate-500 group-hover:text-slate-700"} /> 
              <span>วิเคราะห์การลาออก (Turnover Analysis)</span>
            </span>
          </button>
        </div>

        {/* DYNAMIC TAB COMPONENT CONTENT */}
        <div className="flex-1 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {activeTab === "overview" && (
                <ExecutiveOverview
                  employees={filteredEmployees}
                  totalResignationsCount={filteredResignations.length}
                  onSelectEmployee={setSelectedEmployee}
                  activeFilters={filters}
                  onSetFilters={setFilters}
                />
              )}

              {activeTab === "org" && (
                <OrganizationStructure employees={filteredEmployees} />
              )}

              {activeTab === "risk" && (
                <WorkforceRisk
                  employees={filteredEmployees}
                  onSelectEmployee={setSelectedEmployee}
                  activeFilters={{
                    retirementRisk: filters.retirementRisk,
                    successionStatus: filters.successionStatus
                  }}
                  onToggleFilter={(key, value) => {
                    setFilters(prev => ({
                      ...prev,
                      [key]: value
                    }));
                  }}
                />
              )}

              {activeTab === "turnover" && (
                <TurnoverAnalysis
                  resignations={filteredResignations}
                  totalActiveCount={filteredEmployees.length}
                  activeFilters={filters}
                  onSetFilters={setFilters}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* FOOTER */}
      <footer id="main-footer" className="bg-white border-t border-border-light py-5 text-center text-xs text-text-secondary mt-10 print:hidden">
        <p className="font-medium">ระบบรายงานความเที่ยงตรงข้อมูลกำลังพล SME D Bank Executive Portal © {new Date().getFullYear()}</p>
        <p className="text-[10px] text-text-secondary mt-1 opacity-80">ออกแบบด้วยระบบความปลอดภัยและสิทธิเข้าถึงระดับชั้นความลับผู้บริหารสูงสุด</p>
      </footer>

      {/* DETAILED EMPLOYEE PROFILE DRAWER / SIDE-DRAWER MODAL */}
      <AnimatePresence>
        {selectedEmployee && (
          <motion.div
            id="employee-detail-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] flex justify-end z-50"
            onClick={() => setSelectedEmployee(null)}
          >
            <motion.div
              id="employee-detail-modal-container"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header of Drawer with SME D Bank Gradient Accent */}
            <div className="bg-gradient-to-r from-[#2F6FE4] to-[#1E52B6] p-6 text-white relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] uppercase tracking-wider bg-white/15 px-2 py-0.5 rounded-md font-medium text-white/90">
                    ข้อมูลส่วนบุคคลชั้นความลับผู้บริหาร
                  </span>
                  <h4 className="text-base font-semibold text-white mt-2">โปรไฟล์บุคลากร (SME D Bank)</h4>
                </div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                  id="close-employee-modal-btn"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Profile Card Summary inside header for flawless visual integration */}
              <div className="mt-6 flex items-center gap-4">
                <div className="h-16 w-16 bg-white/10 backdrop-blur-md text-white rounded-2xl flex items-center justify-center font-semibold text-2xl shadow-md border border-white/25 shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#2DBE7F]/10 to-transparent" />
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-base font-medium text-white block truncate">{selectedEmployee.name}</span>
                  <span className="text-xs font-mono text-white/80 mt-0.5 block">{selectedEmployee.empId}</span>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-medium border ${
                      selectedEmployee.contractType === "พนักงานประจำ" 
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                    }`}>
                      {selectedEmployee.contractType}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-medium bg-white/10 text-white/90 border border-white/15">
                      ระดับ {selectedEmployee.level}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Structured Employee Fields Body */}
            <div className="space-y-4 flex-1 overflow-y-auto p-6 text-xs bg-[#F8FAFC]">
              
              {/* Box 1: Position details */}
              <div className="bg-white border border-[#E2ECF5]/70 rounded-xl p-4.5 space-y-3.5 shadow-xs">
                <h5 className="font-semibold text-[#2F6FE4] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Briefcase size={13} className="text-[#2F6FE4]" /> 
                  <span>ข้อมูลการดำรงตำแหน่งองค์กร</span>
                </h5>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="col-span-2">
                    <span className="text-text-secondary block text-[10px] font-medium">ตำแหน่งปัจจุบัน:</span>
                    <span className="text-text-primary font-medium text-xs mt-0.5 block">{selectedEmployee.position}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block text-[10px] font-medium">สายงานสังกัด:</span>
                    <span className="text-[#1F2D3D] font-medium text-xs mt-0.5 block">{selectedEmployee.businessLine}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block text-[10px] font-medium">ฝ่าย/ส่วนงานหลัก:</span>
                    <span className="text-[#1F2D3D] font-medium text-xs mt-0.5 block truncate" title={selectedEmployee.department}>{selectedEmployee.department}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-text-secondary block text-[10px] font-medium">กลุ่มงานสังกัดตามคำสั่ง:</span>
                    <span className="text-[#1F2D3D] font-medium text-xs mt-0.5 block">{selectedEmployee.group}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-text-secondary block text-[10px] font-medium">รักษาการในตำแหน่ง:</span>
                    <span className="text-[#5B6B7F] italic text-xs mt-0.5 block">{selectedEmployee.actingPosition || "ไม่มีการรักษาการ"}</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Contract and performance */}
              <div className="bg-white border border-[#E2ECF5]/70 rounded-xl p-4.5 space-y-3.5 shadow-xs">
                <h5 className="font-semibold text-[#2F6FE4] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Award size={13} className="text-[#2F6FE4]" /> 
                  <span>สถิติกำลังคนและประเมินงาน</span>
                </h5>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <span className="text-text-secondary block text-[10px] font-medium">อายุตัวปัจจุบัน:</span>
                    <span className="text-[#1F2D3D] font-medium text-xs mt-0.5 block">{selectedEmployee.age} ปี</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block text-[10px] font-medium">อายุงานปฏิบัติการ:</span>
                    <span className="text-[#1F2D3D] font-medium text-xs mt-0.5 block">{selectedEmployee.tenure} ปี</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block text-[10px] font-medium">ประเมินผลสัมฤทธิ์ล่าสุด:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium text-[10px] mt-1 ${
                      selectedEmployee.performanceRating === "High Performer" 
                        ? "bg-[#2DBE7F]/10 text-[#2DBE7F] border border-[#2DBE7F]/20" 
                        : "bg-[#2F6FE4]/10 text-[#2F6FE4] border border-[#2F6FE4]/20"
                    }`}>
                      {selectedEmployee.performanceRating}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary block text-[10px] font-medium">ความเสี่ยงตำแหน่งงาน:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium text-[10px] mt-1 ${
                      selectedEmployee.age >= 59 
                        ? "bg-red-50 text-red-600 border border-red-200" 
                        : "bg-slate-50 text-slate-600 border border-slate-200"
                    }`}>
                      {selectedEmployee.age >= 59 ? "เสี่ยงเกษียณเร็ว" : "เสถียรต่ำ"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-text-secondary block text-[10px] font-medium">การกำหนดทายาทสืบทอดตำแหน่ง (Successor):</span>
                    <span className={`text-xs mt-1 flex items-center gap-1.5 font-medium ${
                      selectedEmployee.successionStatus === "None" 
                        ? "text-red-500 font-semibold" 
                        : "text-[#2DBE7F]"
                    }`}>
                      {selectedEmployee.successionStatus === "None" ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          <span>ยังไม่กำหนดผู้สืบทอด (ระดับความเสี่ยงวิกฤต)</span>
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>{selectedEmployee.successionStatus}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 3: Area of assignment */}
              <div className="bg-white border border-[#E2ECF5]/70 rounded-xl p-4.5 space-y-3.5 shadow-xs">
                <h5 className="font-semibold text-[#2F6FE4] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <MapPin size={13} className="text-[#2F6FE4]" /> 
                  <span>พื้นที่ปฏิบัติการและพิกัดสังกัด</span>
                </h5>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <span className="text-text-secondary block text-[10px] font-medium">สังกัดระดับภูมิภาค:</span>
                    <span className="text-[#1F2D3D] font-medium text-xs mt-0.5 block">{selectedEmployee.region}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block text-[10px] font-medium">เขตการบริการหลัก:</span>
                    <span className="text-[#1F2D3D] font-medium text-xs mt-0.5 block">{selectedEmployee.zone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-text-secondary block text-[10px] font-medium">ขอบเขตความรับผิดชอบหลัก:</span>
                    <p className="text-[#5B6B7F] font-normal leading-relaxed mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{selectedEmployee.responsibility}</p>
                  </div>
                </div>
              </div>

              {/* Box 4: Contact details with quick copy actions */}
              <div className="bg-white border border-[#E2ECF5]/70 rounded-xl p-4.5 space-y-3.5 shadow-xs">
                <h5 className="font-semibold text-[#2F6FE4] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Phone size={13} className="text-[#2F6FE4]" /> 
                  <span>ข้อมูลติดต่อสื่อสารและการอนุมัติ</span>
                </h5>
                <div className="space-y-3">
                  {/* Email row */}
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                        <Mail size={12} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-text-secondary block text-[9px] font-medium">อีเมลองค์กรอย่างเป็นทางการ</span>
                        <span className="text-[#1F2D3D] font-mono text-xs truncate block">{selectedEmployee.email}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedEmployee.email);
                        triggerToast("คัดลอกอีเมลพนักงานเรียบร้อยแล้ว");
                      }}
                      className="p-1.5 hover:bg-sky-100 text-sky-600 rounded-lg transition-colors cursor-pointer"
                      title="คัดลอกอีเมล"
                    >
                      <Copy size={12} />
                    </button>
                  </div>

                  {/* Phone row */}
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Phone size={12} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-text-secondary block text-[9px] font-medium">เบอร์โทรศัพท์มือถือปฏิบัติการ</span>
                        <span className="text-[#1F2D3D] font-mono text-xs block">{selectedEmployee.mobile}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedEmployee.mobile);
                        triggerToast("คัดลอกเบอร์โทรศัพท์เรียบร้อยแล้ว");
                      }}
                      className="p-1.5 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                      title="คัดลอกเบอร์โทร"
                    >
                      <Copy size={12} />
                    </button>
                  </div>

                  {/* Reference code row */}
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                        <User size={12} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-text-secondary block text-[9px] font-medium">เลขอ้างอิงคำสั่งแต่งตั้งและพิกัดตำแหน่ง</span>
                        <span className="text-[#1F2D3D] font-mono text-xs block truncate">{selectedEmployee.orderNumber}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedEmployee.orderNumber);
                        triggerToast("คัดลอกเลขอ้างอิงแต่งตั้งเรียบร้อยแล้ว");
                      }}
                      className="p-1.5 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors cursor-pointer"
                      title="คัดลอกเลขคำสั่ง"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer of Drawer - Close actions */}
            <div className="p-5 border-t border-slate-100 bg-white flex gap-2 shrink-0">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="w-full bg-[#2F6FE4] hover:bg-[#1E52B6] text-white font-semibold text-xs py-3 rounded-xl shadow-xs transition-all cursor-pointer active:scale-98 text-center"
              >
                เสร็จสิ้นการตรวจสอบ
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

    </div>
  );
}
