/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Employee } from "../data/mockData";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid, Legend, PieChart, Pie } from "recharts";
import { 
  ShieldAlert, 
  Users, 
  Award, 
  Clock, 
  ArrowRight, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight,
  UserCheck,
  AlertTriangle,
  FileText,
  TrendingUp,
  CheckCircle2,
  Calendar
} from "lucide-react";

interface WorkforceRiskProps {
  employees: Employee[];
  onSelectEmployee: (emp: Employee) => void;
  activeFilters: {
    retirementRisk: string;
    successionStatus: string;
  };
  onToggleFilter: (key: "retirementRisk" | "successionStatus", value: string) => void;
}

export default function WorkforceRisk({ 
  employees, 
  onSelectEmployee,
  activeFilters,
  onToggleFilter
}: WorkforceRiskProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalCount = employees.length;

  // 1. Calculate risk KPIs based on current filtered employees
  const riskStats = useMemo(() => {
    const retirementCritical = employees.filter(e => e.age === 59).length;
    const retirementWarning = employees.filter(e => e.age >= 57 && e.age <= 58).length;
    const retirementUpcoming = employees.filter(e => e.age >= 55 && e.age <= 56).length;

    const noSuccessor = employees.filter(e => e.successionStatus === "None" && e.level >= "Level 9").length;
    const readyNow = employees.filter(e => e.successionStatus === "Ready Now").length;
    const highPerformers = employees.filter(e => e.performanceRating === "High Performer").length;

    return {
      retirementCritical,
      retirementWarning,
      retirementUpcoming,
      noSuccessor,
      readyNow,
      highPerformers
    };
  }, [employees]);

  // 2. Succession Status Distribution Chart Data
  const successionChartData = useMemo(() => {
    const counts: Record<string, number> = {
      "Ready Now": 0,
      "Ready 1-2 Years": 0,
      "Ready 3-5 Years": 0,
      "None": 0
    };
    employees.forEach(e => {
      if (e.successionStatus) {
        counts[e.successionStatus] = (counts[e.successionStatus] || 0) + 1;
      }
    });

    const colors: Record<string, string> = {
      "Ready Now": "#2DBE7F",
      "Ready 1-2 Years": "#4C8DFF",
      "Ready 3-5 Years": "#FFB547",
      "None": "#F36B6B"
    };

    const labels: Record<string, string> = {
      "Ready Now": "พร้อมสืบทอดทันที (Ready Now)",
      "Ready 1-2 Years": "พร้อมใน 1-2 ปี",
      "Ready 3-5 Years": "พร้อมใน 3-5 ปี",
      "None": "ไม่มีผู้สืบทอด (None)"
    };

    return Object.entries(counts).map(([key, value]) => ({
      key,
      name: labels[key] || key,
      value,
      percentage: totalCount > 0 ? Math.round((value / totalCount) * 100) : 0,
      fill: colors[key] || "#94A3B8"
    }));
  }, [employees, totalCount]);

  // 3. Age & Tenure Matrix Chart Data
  const ageDistributionData = useMemo(() => {
    const brackets = [
      { name: "ต่ำกว่า 30 ปี", count: 0 },
      { name: "30-39 ปี", count: 0 },
      { name: "40-49 ปี", count: 0 },
      { name: "50-54 ปี", count: 0 },
      { name: "55-58 ปี", count: 0 },
      { name: "59 ปีขึ้นไป", count: 0 }
    ];

    employees.forEach(e => {
      if (e.age < 30) brackets[0].count++;
      else if (e.age <= 39) brackets[1].count++;
      else if (e.age <= 49) brackets[2].count++;
      else if (e.age <= 54) brackets[3].count++;
      else if (e.age <= 58) brackets[4].count++;
      else brackets[5].count++;
    });

    return brackets.map(b => ({
      name: b.name,
      "จำนวนคน": b.count,
      pct: totalCount > 0 ? Math.round((b.count / totalCount) * 100) : 0
    }));
  }, [employees, totalCount]);

  // 4. Critical Vacant/Successor Risk Table Search + Filters
  const filteredTableData = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = searchTerm === "" ||
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [employees, searchTerm]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTableData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTableData, currentPage]);

  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage) || 1;

  // Reset pagination on search
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* SECTION 1: Strategic Risk Cards (Interactive) */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#DCE6F2]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 bg-[#F36B6B] rounded-full" />
            <div>
              <h3 className="text-sm font-medium text-[#1F2D3D]">ดัชนีความเสี่ยงกำลังคนเชิงยุทธศาสตร์ (Strategic Workforce Risk Cards)</h3>
              <p className="text-[11px] text-[#5B6B7F] mt-0.5">วิเคราะห์ประเด็นความมั่นคงของบุคลากร คลิกเพื่อกรองข้อมูลพนักงานในแต่ละกลุ่มเสี่ยง</p>
            </div>
          </div>

          {(activeFilters.retirementRisk !== "All" || activeFilters.successionStatus !== "All") && (
            <button
              onClick={() => {
                if (activeFilters.retirementRisk !== "All") onToggleFilter("retirementRisk", "All");
                if (activeFilters.successionStatus !== "All") onToggleFilter("successionStatus", "All");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-[#F36B6B] bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-all cursor-pointer"
            >
              <X size={12} />
              <span>ล้างตัวกรองความเสี่ยง</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Retirement Critical */}
          <div 
            onClick={() => onToggleFilter("retirementRisk", activeFilters.retirementRisk === "r1" ? "All" : "r1")}
            className={`border rounded-2xl p-5 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
              activeFilters.retirementRisk === "r1"
                ? "bg-red-50/70 border-[#F36B6B] shadow-sm ring-1 ring-[#F36B6B]/30"
                : "bg-white border-[#DCE6F2] hover:border-[#F36B6B]/40 hover:shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] text-[#5B6B7F] font-medium block">เสี่ยงสูง: เกษียณอายุใน 1 ปี</span>
              <span className={`p-1.5 rounded-lg shrink-0 ${
                activeFilters.retirementRisk === "r1" ? "bg-[#F36B6B] text-white" : "bg-[#F36B6B]/8 text-[#F36B6B]"
              }`}>
                <AlertTriangle size={14} className={activeFilters.retirementRisk === "r1" ? "" : "animate-pulse"} />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-medium text-[#1F2D3D]">{riskStats.retirementCritical}</span>
              <span className="text-xs text-[#5B6B7F]">ท่าน</span>
            </div>
            <p className="text-[10px] text-[#5B6B7F] mt-2 font-light">บุคลากรอายุ 59 ปี ที่พร้อมพ้นวาระการทำงานและต้องการแผนการส่งต่องานเร่งด่วน</p>
            {activeFilters.retirementRisk === "r1" && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[9px] font-medium text-[#F36B6B] bg-white px-2 py-0.5 rounded-md border border-red-100 shadow-3xs">
                <span>กำลังกรอง</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F36B6B]" />
              </div>
            )}
          </div>

          {/* Card 2: Succession Gaps */}
          <div 
            onClick={() => onToggleFilter("successionStatus", activeFilters.successionStatus === "None" ? "All" : "None")}
            className={`border rounded-2xl p-5 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
              activeFilters.successionStatus === "None"
                ? "bg-amber-50/70 border-[#FFB547] shadow-sm ring-1 ring-[#FFB547]/30"
                : "bg-white border-[#DCE6F2] hover:border-[#FFB547]/40 hover:shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] text-[#5B6B7F] font-medium block">ช่องว่างผู้สืบทอด (ระดับ L9 ขึ้นไป)</span>
              <span className={`p-1.5 rounded-lg shrink-0 ${
                activeFilters.successionStatus === "None" ? "bg-[#FFB547] text-white" : "bg-[#FFB547]/8 text-[#FFB547]"
              }`}>
                <ShieldAlert size={14} />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-medium text-[#1F2D3D]">{riskStats.noSuccessor}</span>
              <span className="text-xs text-[#5B6B7F]">ตำแหน่ง</span>
            </div>
            <p className="text-[10px] text-[#5B6B7F] mt-2 font-light">ตำแหน่งบริหารและเชี่ยวชาญ (L9 ขึ้นไป) ที่ยังไม่ได้รับการระบุตัวผู้สืบทอดตำแหน่ง</p>
            {activeFilters.successionStatus === "None" && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[9px] font-medium text-[#FFB547] bg-white px-2 py-0.5 rounded-md border border-amber-100 shadow-3xs">
                <span>กำลังกรอง</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB547]" />
              </div>
            )}
          </div>

          {/* Card 3: Ready Now Successors */}
          <div 
            onClick={() => onToggleFilter("successionStatus", activeFilters.successionStatus === "Ready Now" ? "All" : "Ready Now")}
            className={`border rounded-2xl p-5 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
              activeFilters.successionStatus === "Ready Now"
                ? "bg-emerald-50/70 border-[#2DBE7F] shadow-sm ring-1 ring-[#2DBE7F]/30"
                : "bg-white border-[#DCE6F2] hover:border-[#2DBE7F]/40 hover:shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] text-[#5B6B7F] font-medium block">อัตราความพร้อมสืบทอดทันที</span>
              <span className={`p-1.5 rounded-lg shrink-0 ${
                activeFilters.successionStatus === "Ready Now" ? "bg-[#2DBE7F] text-white" : "bg-[#2DBE7F]/8 text-[#2DBE7F]"
              }`}>
                <UserCheck size={14} />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-medium text-[#1F2D3D]">{riskStats.readyNow}</span>
              <span className="text-xs text-[#5B6B7F]">ท่าน</span>
            </div>
            <p className="text-[10px] text-[#5B6B7F] mt-2 font-light">กลุ่มพนักงานผู้มีศักยภาพสูงที่ได้รับการประเมินว่าพร้อมขึ้นดำรงตำแหน่งทดแทนได้ทันที</p>
            {activeFilters.successionStatus === "Ready Now" && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[9px] font-medium text-[#2DBE7F] bg-white px-2 py-0.5 rounded-md border border-emerald-100 shadow-3xs">
                <span>กำลังกรอง</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#2DBE7F]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: Succession & Retirement Insights Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Succession Pipeline Donut */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-1 h-5 bg-[#4C8DFF] rounded-full" />
              <h3 className="text-sm font-medium text-[#1F2D3D]">ภาพรวมทายาทสืบทอดตำแหน่ง (Succession Planning Status)</h3>
            </div>
            <p className="text-[11px] text-[#5B6B7F] font-light">
              แสดงความพร้อมของทายาทสืบทอดตำแหน่งทั่วทั้งองค์กรเพื่อวิเคราะห์เสถียรภาพกำลังพลในอนาคต (คลิกเพื่อจัดกรองตามกลุ่มความพร้อม)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mt-6">
            <div className="sm:col-span-5 h-40 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={successionChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {successionChartData.map((entry, idx) => (
                      <Cell 
                        key={`cell-${idx}`} 
                        fill={entry.fill} 
                        className="cursor-pointer hover:opacity-80 transition-all"
                        onClick={() => onToggleFilter("successionStatus", entry.key)}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #DCE6F2", fontSize: "11px" }}
                    formatter={(value) => [`${value} คน`, "จำนวนพนักงาน"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="sm:col-span-7 space-y-2">
              {successionChartData.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onToggleFilter("successionStatus", item.key)}
                  className={`p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                    activeFilters.successionStatus === item.key
                      ? "bg-blue-50 border-blue-200"
                      : "bg-slate-50/50 border-transparent hover:bg-slate-50 hover:border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: item.fill }} />
                    <span className="text-[#1F2D3D] font-light truncate max-w-[150px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1F2D3D]">{item.value} คน</span>
                    <span className="text-[10px] text-slate-400">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Age Demographics Bar */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-1 h-5 bg-[#2DBE7F] rounded-full" />
              <h3 className="text-sm font-medium text-[#1F2D3D]">สัดส่วนช่วงอายุพนักงานหลัก (Age Demographics)</h3>
            </div>
            <p className="text-[11px] text-[#5B6B7F] font-light">
              วิเคราะห์ช่วงอายุการทำงานเพื่อประเมินระดับความอ่อนตัวและความเสี่ยงด้านสังคมผู้สูงอายุขององค์กร
            </p>
          </div>

          <div className="h-44 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDistributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#8898AA" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#8898AA" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", borderColor: "#DCE6F2", fontSize: "11px" }}
                  formatter={(value) => [`${value} คน`, "จำนวนพนักงาน"]}
                />
                <Bar dataKey="จำนวนคน" fill="#2F6FE4" radius={[4, 4, 0, 0]} barSize={28}>
                  {ageDistributionData.map((entry, index) => {
                    let fill = "#2F6FE4";
                    if (entry.name.includes("59")) fill = "#F36B6B";
                    else if (entry.name.includes("55-58")) fill = "#FFB547";
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SECTION 3: Executive Action Panel */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#DCE6F2]/50">
          <div className="p-1.5 bg-[#2F6FE4]/8 text-[#2F6FE4] rounded-lg">
            <FileText size={15} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#1F2D3D]">กลยุทธ์ป้องกันความเสี่ยง (Executive Mitigating Action Board)</h3>
            <p className="text-[11px] text-[#5B6B7F] mt-0.5">แผนงานและข้อเสนอเชิงปฏิบัติเพื่อลดความเสี่ยงด้านบุคลากรอย่างเป็นรูปธรรมสำหรับฝ่ายบริหาร</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-red-100 bg-red-50/25 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#F36B6B]">
              <span className="p-1 bg-[#F36B6B]/10 rounded-lg">🚨</span>
              <span>แผนบริหารความเสี่ยงการเกษียณ (Retirement Transition Protocol)</span>
            </div>
            <ul className="text-[11px] text-[#5B6B7F] space-y-2 pl-2 list-disc font-light leading-relaxed">
              <li><strong>ระบบปัญญาปฏิบัติภักดี (Knowledge Management Program):</strong> ถ่ายทอดองค์ความรู้และกระบวนงานสำคัญ (Critical SOP) จากผู้เชี่ยวชาญก่อนการเกษียณ 180 วัน</li>
              <li><strong>โครงการคืนสู่เหย้ากิตติมศักดิ์:</strong> พัฒนาสัญญาจ้างพิเศษสำหรับที่ปรึกษาเกษียณอายุ เพื่อประคองบทบาทสำคัญชั่วคราว</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/25 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#2DBE7F]">
              <span className="p-1 bg-[#2DBE7F]/10 rounded-lg">🎯</span>
              <span>แผนเร่งรัดทายาทสืบทอดตำแหน่ง (Successor Acceleration Plan)</span>
            </div>
            <ul className="text-[11px] text-[#5B6B7F] space-y-2 pl-2 list-disc font-light leading-relaxed">
              <li><strong>หลักสูตรบ่มเพาะดาวเด่น (Fast Track Leadership):</strong> ส่งเสริมพนักงานกลุ่ม High Performers เข้ารับการอบรมเตรียมพร้อมสืบทอดตำแหน่งใน 1 ปี</li>
              <li><strong>ระบบพี่เลี้ยงผู้บริหาร (Executive Mentorship):</strong> ผู้อำนวยการฝ่ายประกบตัวช่วยสอนงานรายบุคคลให้กับทายาทระดับ L11-12 อย่างเป็นระบบ</li>
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 4: Detailed Risk Table / Explorer */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-[#1F2D3D]">ทำเนียบผู้ปฏิบัติงานในกลุ่มวิเคราะห์ความเสี่ยง (Workforce Risk Explorer)</h3>
            <p className="text-[11px] text-[#5B6B7F] mt-0.5">ค้นหาและกรองตรวจสอบรายชื่อบุคลากรที่มีดัชนีอายุใกล้เคียงวัยวาระเกษียณและสถานภาพผู้สืบทอดตำแหน่ง</p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6B7F]" />
            <input
              type="text"
              placeholder="ค้นหารหัส, ชื่อ, หรือสังกัด..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#DCE6F2] bg-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/8 text-[#1F2D3D]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-[#5B6B7F]"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Table itself */}
        <div className="border border-[#DCE6F2] rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6F9FC] border-b border-[#DCE6F2] text-[10px] text-[#1F2D3D] font-medium uppercase tracking-wider">
                  <th className="py-3 px-4">รหัสพนักงาน</th>
                  <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                  <th className="py-3 px-4">ตำแหน่ง / ระดับ</th>
                  <th className="py-3 px-4">ฝ่ายสังกัด</th>
                  <th className="py-3 px-4 text-center">อายุตัว / อายุงาน</th>
                  <th className="py-3 px-4 text-center">ทายาทสืบทอด</th>
                  <th className="py-3 px-4 text-center">ผลงานล่าสุด</th>
                  <th className="py-3 px-4 text-center">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6F2]/50 bg-white">
                {paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-xs text-[#5B6B7F] italic">
                      ไม่พบข้อมูลตรงตามเงื่อนไขที่กำหนด
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((emp) => (
                    <tr key={emp.empId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#5B6B7F]">{emp.empId}</td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#1F2D3D]">{emp.name}</td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-[#1F2D3D] truncate max-w-[150px]">{emp.position}</div>
                        <div className="text-[10px] text-[#5B6B7F] font-medium mt-0.5">{emp.level}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-[#1F2D3D] truncate max-w-[150px]">{emp.department}</div>
                        <div className="text-[10px] text-[#5B6B7F] font-light mt-0.5">{emp.businessLine}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-[#5B6B7F]">
                        {emp.age} ปี <span className="text-slate-300 mx-1">/</span> {emp.tenure} ปี
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium leading-none ${
                            emp.successionStatus === "Ready Now"
                              ? "bg-emerald-100 text-emerald-800"
                              : emp.successionStatus === "Ready 1-2 Years"
                              ? "bg-blue-100 text-blue-800"
                              : emp.successionStatus === "Ready 3-5 Years"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {emp.successionStatus === "None" ? "ไม่มี (None)" : emp.successionStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium leading-none ${
                            emp.performanceRating === "High Performer"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : emp.performanceRating === "Meets Standard"
                              ? "bg-slate-50 text-slate-700 border border-slate-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}
                        >
                          {emp.performanceRating}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onSelectEmployee(emp)}
                          className="px-2.5 py-1 text-[10px] font-medium text-[#2F6FE4] bg-[#2F6FE4]/5 hover:bg-[#2F6FE4]/10 rounded border border-[#2F6FE4]/15 transition-all cursor-pointer"
                        >
                          ตรวจสอบ
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredTableData.length > 0 && (
            <div className="bg-[#F8FAFC] px-4 py-3 border-t border-[#DCE6F2] flex items-center justify-between text-xs text-[#5B6B7F] flex-wrap gap-2">
              <div>
                แสดงผล <span className="font-medium text-[#1F2D3D]">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTableData.length)}</span> จากทั้งหมด <span className="font-medium text-[#1F2D3D]">{filteredTableData.length.toLocaleString()} คน</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded-md border border-[#DCE6F2] hover:bg-slate-50 hover:text-[#1F2D3D] disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                
                <span className="px-2.5 text-[11px]">
                  หน้า {currentPage} / {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded-md border border-[#DCE6F2] hover:bg-slate-50 hover:text-[#1F2D3D] disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
