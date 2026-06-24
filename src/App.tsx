/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { generateHRData, Employee } from "./data/mockData";
import FilterBar, { FilterState } from "./components/FilterBar";
import ExecutiveOverview from "./components/ExecutiveOverview";
import OrganizationStructure from "./components/OrganizationStructure";
import TurnoverAnalysis from "./components/TurnoverAnalysis";
import { LayoutDashboard, Network, ShieldAlert, LogOut, X, User, Phone, Mail, Award, MapPin, Briefcase, Sparkles } from "lucide-react";

export default function App() {
  // Generate entire bank workforce database (2,182 employees and 73 resignations)
  const { employees: allEmployees, resignations: allResignations } = useMemo(() => generateHRData(), []);

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
  });

  // Selected Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "org" | "turnover">("overview");

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
      // Since resignations don't have all active fields, we filter where matching
      if (filters.level !== "All" && res.level !== filters.level) return false;
      if (filters.contractType !== "All" && res.contractType !== filters.contractType) return false;
      
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
    <div className="min-h-screen bg-bg-light flex flex-col text-text-primary selection:bg-brand-primary/20 print:bg-white print:p-0">
      
      {/* Toast Alert Popup */}
      {toastMessage && (
        <div id="toast-message" className="fixed top-5 right-5 z-50 bg-brand-primary text-white font-medium text-xs px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <Sparkles size={14} className="text-brand-accent animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <header id="main-header" className="bg-white border-b border-border-light shadow-2xs py-4 px-6 sticky top-0 z-40 print:relative print:border-none print:shadow-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & System Titles */}
          <div className="flex items-center gap-3">
            {/* Visual Bank Simulated Shield Icon */}
            <div className="h-10 w-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-medium text-lg shadow-sm border border-brand-secondary/30 shrink-0">
              SME
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-medium text-brand-primary tracking-tight">SME D Bank</h1>
                <span className="bg-brand-accent/15 text-brand-accent text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider">
                  HR Portal
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-medium text-text-secondary mt-0.5">
                Executive HR Analytics Dashboard (ระบบวิเคราะห์กำลังคนผู้บริหาร)
              </h2>
            </div>
          </div>

          {/* Right Area: Portal Info & Profile */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <span className="text-[10px] text-text-secondary block font-medium uppercase tracking-wider">ข้อมูล ณ วันที่</span>
              <span className="text-xs font-medium text-brand-primary">16 มิถุนายน 2569</span>
            </div>

            <div className="h-8 w-px bg-border-light hidden md:block"></div>

            {/* Profile badge */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-brand-secondary text-white font-medium text-sm flex items-center justify-center border border-brand-primary/35">
                EX
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-medium text-text-primary block">ผู้บริหารระดับสูง (SME D Bank)</span>
                <span className="text-[10px] text-brand-accent block font-medium">Executive User Portal</span>
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
        <div id="tab-navigation-bar" className="flex overflow-x-auto bg-slate-100/65 p-1.5 rounded-2xl border border-slate-200/40 mb-8 shrink-0 print:hidden gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "overview"
                ? "bg-white text-[#2F6FE4] shadow-sm font-medium border border-slate-100"
                : "text-[#5B6B7F] hover:text-[#2F6FE4] hover:bg-white/50"
            }`}
          >
            <LayoutDashboard size={14} className={activeTab === "overview" ? "text-[#2F6FE4]" : "text-[#5B6B7F]"} /> 
            <span>ภาพรวมผู้บริหาร (Executive Overview)</span>
          </button>
          
          <button
            onClick={() => setActiveTab("org")}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "org"
                ? "bg-white text-[#2F6FE4] shadow-sm font-medium border border-slate-100"
                : "text-[#5B6B7F] hover:text-[#2F6FE4] hover:bg-white/50"
            }`}
          >
            <Network size={14} className={activeTab === "org" ? "text-[#2F6FE4]" : "text-[#5B6B7F]"} /> 
            <span>โครงสร้างองค์กร (Organization Structure)</span>
          </button>

          <button
            onClick={() => setActiveTab("turnover")}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "turnover"
                ? "bg-white text-[#2F6FE4] shadow-sm font-medium border border-slate-100"
                : "text-[#5B6B7F] hover:text-[#2F6FE4] hover:bg-white/50"
            }`}
          >
            <LogOut size={14} className={activeTab === "turnover" ? "text-[#2F6FE4]" : "text-[#5B6B7F]"} /> 
            <span>วิเคราะห์การลาออก (Turnover Analysis)</span>
          </button>
        </div>

        {/* DYNAMIC TAB COMPONENT CONTENT */}
        <div className="flex-1 min-h-[400px]">
          {activeTab === "overview" && (
            <ExecutiveOverview
              employees={filteredEmployees}
              totalResignationsCount={filteredResignations.length}
              onSelectEmployee={setSelectedEmployee}
            />
          )}

          {activeTab === "org" && (
            <OrganizationStructure employees={filteredEmployees} />
          )}

          {activeTab === "turnover" && (
            <TurnoverAnalysis
              resignations={filteredResignations}
              totalActiveCount={filteredEmployees.length}
            />
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer id="main-footer" className="bg-white border-t border-border-light py-5 text-center text-xs text-text-secondary mt-10 print:hidden">
        <p className="font-medium">ระบบรายงานความเที่ยงตรงข้อมูลกำลังพล SME D Bank Executive Portal © {new Date().getFullYear()}</p>
        <p className="text-[10px] text-text-secondary mt-1 opacity-80">ออกแบบด้วยระบบความปลอดภัยและสิทธิเข้าถึงระดับชั้นความลับผู้บริหารสูงสุด</p>
      </footer>

      {/* DETAILED EMPLOYEE PROFILE DRAWER / SIDE-DRAWER MODAL */}
      {selectedEmployee && (
        <div id="employee-detail-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-50 animate-fade-in" onClick={() => setSelectedEmployee(null)}>
          <div
            id="employee-detail-modal-container"
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto animate-slide-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header of Drawer */}
            <div className="flex justify-between items-center pb-4 border-b border-border-light">
              <div>
                <span className="text-[10px] text-brand-primary font-medium uppercase tracking-wider block">ข้อมูลรายชื่อบุคลากร</span>
                <h4 className="text-sm font-medium text-text-table-header">ตรวจสอบข้อมูลรายบุคคล (SME D Bank)</h4>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-1 rounded-lg hover:bg-bg-light text-text-secondary cursor-pointer"
                id="close-employee-modal-btn"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Card Summary */}
            <div className="my-6 bg-brand-primary/5 rounded-2xl p-5 border border-brand-primary/10 text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-brand-primary text-white rounded-full flex items-center justify-center font-medium text-2xl shadow-md border-2 border-white mb-3">
                {selectedEmployee.name.charAt(0)}
              </div>
              <span className="text-base font-medium text-text-primary block">{selectedEmployee.name}</span>
              <span className="text-xs font-mono font-medium text-brand-primary mt-1 block">{selectedEmployee.empId}</span>
              
              <div className="flex gap-2 mt-3 flex-wrap justify-center">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${selectedEmployee.contractType === "พนักงานประจำ" ? "bg-sky-100 text-sky-800" : "bg-purple-100 text-purple-800"}`}>
                  {selectedEmployee.contractType}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                  {selectedEmployee.level}
                </span>
              </div>
            </div>

            {/* Structured Employee Fields */}
            <div className="space-y-4 flex-1 text-xs">
              
              {/* Box 1: Position details */}
              <div className="bg-bg-light/60 border border-border-light rounded-xl p-4 space-y-3">
                <h5 className="font-medium text-brand-primary flex items-center gap-1.5 border-b border-border-light pb-1.5">
                  <Briefcase size={12} /> ข้อมูลการดำรงตำแหน่งองค์กร
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-text-secondary block font-medium">ตำแหน่งปัจจุบัน:</span>
                    <span className="text-text-primary font-medium">{selectedEmployee.position}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block font-medium">สายงานสังกัด:</span>
                    <span className="text-text-primary font-medium">{selectedEmployee.businessLine}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-text-secondary block font-medium">กลุ่มงานสังกัดตามคำสั่ง:</span>
                    <span className="text-text-primary font-medium">{selectedEmployee.group}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block font-medium">ฝ่าย/ส่วนงานหลัก:</span>
                    <span className="text-text-primary font-medium">{selectedEmployee.department}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block font-medium">รักษาการในตำแหน่ง:</span>
                    <span className="text-text-primary font-medium">{selectedEmployee.actingPosition}</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Contract and dates */}
              <div className="bg-bg-light/60 border border-border-light rounded-xl p-4 space-y-3">
                <h5 className="font-medium text-brand-primary flex items-center gap-1.5 border-b border-border-light pb-1.5">
                  <Award size={12} /> สถิติกำลังคนและประเมินงาน
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-text-secondary block font-medium">อายุตัว (ปี):</span>
                    <span className="text-text-primary font-medium">{selectedEmployee.age} ปี</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block font-medium">อายุงานปฏิบัติการ:</span>
                    <span className="text-text-primary font-medium">{selectedEmployee.tenure} ปี</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block font-medium">ประเมินผลสัมฤทธิ์ล่าสุด:</span>
                    <span className="inline-block bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded font-medium">
                      {selectedEmployee.performanceRating}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary block font-medium">ความเสี่ยงสายงานหลัก:</span>
                    <span className="text-text-primary font-medium">ต่ำ</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-text-secondary block font-medium">ทายาทสืบทอดตำแหน่ง:</span>
                    <span className="text-text-primary font-medium">
                      {selectedEmployee.successionStatus === "None" ? "ยังไม่ได้กำหนด" : selectedEmployee.successionStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 3: Area of assignment */}
              <div className="bg-bg-light/60 border border-border-light rounded-xl p-4 space-y-3">
                <h5 className="font-medium text-brand-primary flex items-center gap-1.5 border-b border-border-light pb-1.5">
                  <MapPin size={12} /> พื้นที่ปฏิบัติการและข้อมูลติดต่อ
                </h5>
                <div className="grid grid-cols-2 gap-2 col-span-2">
                  <div>
                    <span className="text-text-secondary block font-medium">พิกัดสังกัดภาค:</span>
                    <span className="text-text-primary font-medium">{selectedEmployee.region}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block font-medium">เขตบริการหลัก:</span>
                    <span className="text-text-primary font-medium">{selectedEmployee.zone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-text-secondary block font-medium">ความรับผิดชอบหลัก:</span>
                    <p className="text-text-primary font-light">{selectedEmployee.responsibility}</p>
                  </div>
                </div>
              </div>

              {/* Box 4: Contact details */}
              <div className="bg-bg-light/60 border border-border-light rounded-xl p-4 space-y-3">
                <h5 className="font-medium text-brand-primary flex items-center gap-1.5 border-b border-border-light pb-1.5">
                  <Phone size={12} /> ข้อมูลติดต่อสื่อสารอย่างเป็นทางการ
                </h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-text-secondary shrink-0" />
                    <span className="text-text-secondary font-medium">อีเมลทางการ:</span>
                    <span className="text-text-primary font-mono text-[11px] truncate font-medium">{selectedEmployee.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-text-secondary shrink-0" />
                    <span className="text-text-secondary font-medium">เบอร์โทรศัพท์มือถือ:</span>
                    <span className="text-text-primary font-mono text-[11px] font-medium">{selectedEmployee.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-text-secondary shrink-0" />
                    <span className="text-text-secondary font-medium">เลขที่อ้างอิงคำสั่ง:</span>
                    <span className="text-text-primary font-mono text-[11px] truncate font-medium">{selectedEmployee.orderNumber}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer of Drawer - close action */}
            <div className="pt-4 border-t border-border-light mt-6 flex justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="w-full bg-brand-primary text-white font-medium text-xs py-2.5 rounded-xl hover:bg-brand-secondary transition-all cursor-pointer"
              >
                ปิดหน้าต่างรายละเอียด
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
