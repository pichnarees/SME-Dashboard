/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Employee } from "../data/mockData";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  CartesianGrid, 
  PieChart, 
  Pie 
} from "recharts";
import { 
  ShieldAlert, 
  Users, 
  Award, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight,
  UserCheck,
  AlertTriangle,
  FileText,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Lock,
  ArrowUpRight,
  Eye,
  Info
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
  const itemsPerPage = 8;

  // Local tab toggling for succession strategy insights
  const [activeInsightTab, setActiveInsightTab] = useState<"succession" | "demographics">("succession");

  const totalCount = employees.length;

  // Calculate critical KPIs for succession/retirement
  const riskStats = useMemo(() => {
    const retirementCritical = employees.filter(e => e.age === 59).length;
    const retirementWarning = employees.filter(e => e.age >= 57 && e.age <= 58).length;
    const retirementUpcoming = employees.filter(e => e.age >= 55 && e.age <= 56).length;

    const managementCohort = employees.filter(e => {
      const num = parseInt(e.level.replace(/[^0-9]/g, "")) || 0;
      return num >= 9 || e.level.includes("13");
    });
    const noSuccessor = managementCohort.filter(e => e.successionStatus === "None").length;
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

  // Succession distribution chart data
  const successionChartData = useMemo(() => {
    const counts: Record<string, number> = {
      "Ready Now": 0,
      "Ready 1-2 Years": 0,
      "Ready 3-5 Years": 0,
      "None": 0
    };
    employees.forEach(e => {
      if (e.successionStatus && e.successionStatus !== "None") {
        counts[e.successionStatus] = (counts[e.successionStatus] || 0) + 1;
      } else if (e.successionStatus === "None") {
        counts["None"] = (counts["None"] || 0) + 1;
      }
    });

    const colors: Record<string, string> = {
      "Ready Now": "#10B981", // Emerald
      "Ready 1-2 Years": "#3B82F6", // Blue
      "Ready 3-5 Years": "#F59E0B", // Amber
      "None": "#EF4444" // Red
    };

    const labels: Record<string, string> = {
      "Ready Now": "พร้อมสืบทอดทันที (Ready Now)",
      "Ready 1-2 Years": "พร้อมใน 1-2 ปี (Ready 1-2 Years)",
      "Ready 3-5 Years": "พร้อมใน 3-5 ปี (Ready 3-5 Years)",
      "None": "ไม่มีผู้สืบทอดตำแหน่ง (None)"
    };

    return Object.entries(counts).map(([key, value]) => ({
      key,
      name: labels[key] || key,
      value,
      percentage: totalCount > 0 ? Math.round((value / totalCount) * 100) : 0,
      fill: colors[key] || "#94A3B8"
    }));
  }, [employees, totalCount]);

  // Age distribution ranges progress metrics
  const ageRangesList = useMemo(() => {
    const brackets = [
      { name: "ต่ำกว่า 30 ปี (Gen Z)", min: 0, max: 29, count: 0, color: "bg-teal-500" },
      { name: "30-39 ปี (Gen Y)", min: 30, max: 39, count: 0, color: "bg-cyan-500" },
      { name: "40-49 ปี (Gen X)", min: 40, max: 49, count: 0, color: "bg-blue-500" },
      { name: "50-54 ปี (กลุ่มเก๋า)", min: 50, max: 54, count: 0, color: "bg-purple-500" },
      { name: "55-58 ปี (กลุ่มเฝ้าระวังเกษียณ)", min: 55, max: 58, count: 0, color: "bg-amber-500" },
      { name: "59 ปีขึ้นไป (กลุ่มใกล้เกษียณสูงสุด)", min: 59, max: 99, count: 0, color: "bg-rose-500" }
    ];

    employees.forEach(e => {
      brackets.forEach(b => {
        if (e.age >= b.min && e.age <= b.max) {
          b.count++;
        }
      });
    });

    return brackets.map(b => ({
      ...b,
      percentage: totalCount > 0 ? Math.round((b.count / totalCount) * 100) : 0
    }));
  }, [employees, totalCount]);

  // Filtering for candidate explorer table
  const tableFilteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = searchTerm === "" ||
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.businessLine.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [employees, searchTerm]);

  // Resets pagination on search
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  return (
    <div className="space-y-6">

      {/* Top row: Interactive Strategic Indicators Grid */}
      <div>
        <div className="flex items-center justify-between mb-4.5">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
            <h2 className="text-sm font-medium text-slate-800 tracking-tight">
              ดัชนีชี้วัดความเสี่ยงบุคลากรเชิงวิกฤต (SME D Bank Workforce Risk Matrices)
            </h2>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-light">
            <Info size={11} />
            <span>อิงระบบสืบค้นอัตราจ้างงานล่าสุด</span>
          </div>
        </div>

        {/* The Grid of risk indicators */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          
          {/* Standard Card 1: เกษียณวิกฤต */}
          <div className="bg-white border border-slate-100/95 shadow-xs hover:shadow-md p-4.5 rounded-[22px] relative overflow-hidden group transition-all duration-300 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100 shrink-0">
                <ShieldAlert size={14} className="animate-pulse" />
              </div>
              <span className="text-[9px] font-sans font-medium bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full uppercase">
                Critical
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-medium tracking-wide uppercase text-slate-400">เกษียณวิกฤต (อายุ 59)</p>
              <p className="text-[9px] font-light text-slate-400">Retirement Critical</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-sans font-medium tracking-tight text-slate-800">
                  {riskStats.retirementCritical.toLocaleString()}
                </span>
                <span className="text-[10px] font-medium text-slate-400">คน</span>
              </div>
            </div>
            <div className="mt-3.5 pt-2 border-t border-slate-50 flex items-center justify-between text-[8px] text-slate-400 font-light">
              <span>เกษียณปีนี้ทางกฎหมาย</span>
              <span className="font-mono text-rose-600 font-medium">L1-L11</span>
            </div>
          </div>

          {/* Standard Card 2: เกษียณเฝ้าระวัง */}
          <div className="bg-white border border-slate-100/95 shadow-xs hover:shadow-md p-4.5 rounded-[22px] relative overflow-hidden group transition-all duration-300 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 shrink-0">
                <AlertTriangle size={14} />
              </div>
              <span className="text-[9px] font-sans font-medium bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full uppercase">
                Warning
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-medium tracking-wide uppercase text-slate-400">เกษียณเฝ้าระวัง (57-58)</p>
              <p className="text-[9px] font-light text-slate-400">Retirement Warning</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-sans font-medium tracking-tight text-slate-800">
                  {riskStats.retirementWarning.toLocaleString()}
                </span>
                <span className="text-[10px] font-medium text-slate-400">คน</span>
              </div>
            </div>
            <div className="mt-3.5 pt-2 border-t border-slate-50 flex items-center justify-between text-[8px] text-slate-400 font-light">
              <span>เกษียณภายใน 3 ปี</span>
              <span className="font-mono text-amber-600 font-medium">L1-L11</span>
            </div>
          </div>

          {/* Standard Card 3: เตรียมเกษียณ */}
          <div className="bg-white border border-slate-100/95 shadow-xs hover:shadow-md p-4.5 rounded-[22px] relative overflow-hidden group transition-all duration-300 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 shrink-0">
                <Calendar size={14} />
              </div>
              <span className="text-[9px] font-sans font-medium bg-blue-50 text-blue-500 border border-blue-100 px-2 py-0.5 rounded-full uppercase">
                Upcoming
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-medium tracking-wide uppercase text-slate-400">เตรียมเกษียณ (55-56)</p>
              <p className="text-[9px] font-light text-slate-400">Upcoming Retirement</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-sans font-medium tracking-tight text-slate-800">
                  {riskStats.retirementUpcoming.toLocaleString()}
                </span>
                <span className="text-[10px] font-medium text-slate-400">คน</span>
              </div>
            </div>
            <div className="mt-3.5 pt-2 border-t border-slate-50 flex items-center justify-between text-[8px] text-slate-400 font-light">
              <span>เกษียณภายใน 5 ปี</span>
              <span className="font-mono text-blue-600 font-medium">L1-L11</span>
            </div>
          </div>

          {/* Standard Card 4: ผู้บริหารพร้อม */}
          <div className="bg-white border border-slate-100/95 shadow-xs hover:shadow-md p-4.5 rounded-[22px] relative overflow-hidden group transition-all duration-300 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 shrink-0">
                <UserCheck size={14} />
              </div>
              <span className="text-[9px] font-sans font-medium bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full uppercase">
                Ready Now
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-medium tracking-wide uppercase text-slate-400">ผู้บริหารพร้อมสืบทอด</p>
              <p className="text-[9px] font-light text-slate-400">Ready Candidates</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-sans font-medium tracking-tight text-slate-800">
                  {riskStats.readyNow.toLocaleString()}
                </span>
                <span className="text-[10px] font-medium text-slate-400">คน</span>
              </div>
            </div>
            <div className="mt-3.5 pt-2 border-t border-slate-50 flex items-center justify-between text-[8px] text-slate-400 font-light">
              <span>สืบทอดได้ทันที</span>
              <span className="font-mono text-purple-600 font-medium">L9-L11</span>
            </div>
          </div>

          {/* Standard Card 5: สุญญากาศผู้บริหาร */}
          <div className="bg-white border border-slate-100/95 shadow-xs hover:shadow-md p-4.5 rounded-[22px] relative overflow-hidden group transition-all duration-300 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100 shrink-0">
                <Lock size={14} />
              </div>
              <span className="text-[9px] font-sans font-medium bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full uppercase">
                Vacancy Risk
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-medium tracking-wide uppercase text-slate-400">สุญญากาศผู้บริหาร</p>
              <p className="text-[9px] font-light text-slate-400">No Succession Model</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-sans font-medium tracking-tight text-slate-800">
                  {riskStats.noSuccessor.toLocaleString()}
                </span>
                <span className="text-[10px] font-medium text-slate-400">อัตรา</span>
              </div>
            </div>
            <div className="mt-3.5 pt-2 border-t border-slate-50 flex items-center justify-between text-[8px] text-slate-400 font-light">
              <span>ตำแหน่งบริหารขาดแคลน</span>
              <span className="font-mono text-rose-600 font-medium">L9+ Risk</span>
            </div>
          </div>

          {/* Standard Card 6: ดาวเด่น */}
          <div className="bg-white border border-slate-100/95 shadow-xs hover:shadow-md p-4.5 rounded-[22px] relative overflow-hidden group transition-all duration-300 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 shrink-0">
                <Award size={14} />
              </div>
              <span className="text-[9px] font-sans font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">
                Stars
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-medium tracking-wide uppercase text-slate-400">ดาวเด่นในสถาบัน</p>
              <p className="text-[9px] font-light text-slate-400">High Performers</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-sans font-medium tracking-tight text-slate-800">
                  {riskStats.highPerformers.toLocaleString()}
                </span>
                <span className="text-[10px] font-medium text-slate-400">คน</span>
              </div>
            </div>
            <div className="mt-3.5 pt-2 border-t border-slate-50 flex items-center justify-between text-[8px] text-slate-400 font-light">
              <span>กลุ่มพนักงานเกรดดีเลิศ</span>
              <span className="font-mono text-emerald-600 font-medium">L1-L11</span>
            </div>
          </div>

        </div>
      </div>

      {/* Analytics Section: Charts & Groupings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Succession donut breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-medium text-slate-800 pb-3 border-b border-slate-100">
              โครงสร้างสัดส่วนการสืบทอดตำแหน่ง (Succession Planning Status)
            </h3>

            <div className="h-[180px] w-full mt-6 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={successionChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {successionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ fontSize: 10, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    formatter={(value: any) => [`${value.toLocaleString()} คน`]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-light">กำลังพลหลัก</p>
                <p className="text-xl font-sans font-medium text-slate-800">{totalCount.toLocaleString()}</p>
                <p className="text-[8px] text-slate-500">คน</p>
              </div>
            </div>

            {/* Legends */}
            <div className="mt-4 space-y-2 border-t border-slate-50 pt-4 text-[10px]">
              {successionChartData.map((tag, i) => (
                <div key={i} className="flex items-center justify-between p-1 bg-slate-50/40 rounded-lg">
                  <div className="flex items-center gap-1.5 font-light">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.fill }} />
                    <span className="text-slate-600 truncate max-w-[200px]" title={tag.name}>{tag.name}</span>
                  </div>
                  <span className="font-mono font-medium text-slate-800">{tag.value.toLocaleString()} คน ({tag.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-light mt-5 pt-3 border-t border-slate-50">
            * สถิติอิงข้อมูลกำลังพลระดับผู้จัดการ (L9 ขึ้นไป) และผู้เชี่ยวชาญพิเศษ
          </p>
        </div>

        {/* Right Column: Demographics Age Matrix Progress Bars (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <h3 className="text-xs font-medium text-slate-800">
                สเปกตรัมช่วงอายุประชากรองค์กรภาพรวม (Age Spectrum Profile)
              </h3>
              
              {/* Toggler */}
              <div className="inline-flex bg-slate-50 p-1 rounded-xl border border-slate-200/50 self-start">
                <button
                  onClick={() => setActiveInsightTab("succession")}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded-lg transition-all cursor-pointer ${
                    activeInsightTab === "succession" 
                      ? "bg-slate-800 text-white shadow-xs" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  แผนบริหาร
                </button>
                <button
                  onClick={() => setActiveInsightTab("demographics")}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded-lg transition-all cursor-pointer ${
                    activeInsightTab === "demographics" 
                      ? "bg-slate-800 text-white shadow-xs" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  ภาพรวมสถาบัน
                </button>
              </div>
            </div>

            {/* Matrix details */}
            <div className="mt-5 space-y-4">
              {ageRangesList.map((item, idx) => (
                <div key={idx} className="space-y-1.5 p-1 hover:bg-slate-50/50 rounded-xl transition-colors">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <span className="font-mono text-slate-500">
                      <span className="font-semibold text-slate-800">{item.count.toLocaleString()} คน</span> ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-light">
            <span>Gen Y (30-39 ปี) เป็นกลุ่มกำลังหลักของสถาบันในขณะนี้</span>
            <span className="text-emerald-600 font-medium">ความแข็งแกร่งทรัพยากรระดับสูง</span>
          </div>

        </div>

      </div>

      {/* Candidate Database / Explorer */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
        
        {/* Table header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 bg-rose-500 rounded-full animate-ping" />
              <h3 className="text-xs font-medium text-slate-800">
                รายชื่อพนักงานในเกณฑ์เฝ้าระวังความเสี่ยง (Strategic Candidate & Risk Database)
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-light">
              รายชื่อรวมทั้งพนักงานกลุ่มใกล้เกษียณ และพนักงานกลุ่มสายงานเป้าหมายที่ควรจัดวางแผนผู้สืบทอด
            </p>
          </div>

          {/* Search tool */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              placeholder="ค้นหารหัส, ชื่อ-นามสกุล หรือแผนกย่อย..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 py-1.5 text-xs rounded-lg border border-slate-200/70 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-light"
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
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto mt-4">
          {tableFilteredEmployees.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Users size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">ไม่พบข้อมูลรายชื่อประชากรองค์กรตามเงื่อนไขค้นหา</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-medium text-slate-400 uppercase tracking-wider bg-slate-50/30">
                  <th className="py-3 px-4 font-medium">รหัส</th>
                  <th className="py-3 px-4 font-medium">ชื่อพนักงาน</th>
                  <th className="py-3 px-4 font-medium">ตำแหน่งและฝ่ายปฏิบัติงาน</th>
                  <th className="py-3 px-4 font-medium">อายุตัว</th>
                  <th className="py-3 px-4 font-medium">อายุงาน</th>
                  <th className="py-3 px-4 font-medium">สถานะผู้สืบทอด (Succession)</th>
                  <th className="py-3 px-4 font-medium">ประเมินผลงาน (Performance)</th>
                  <th className="py-3 px-4 font-medium text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedEmployees.map((emp) => {
                  const initials = emp.name.split(" ")[0].slice(0, 2);
                  return (
                    <tr key={emp.empId} className="hover:bg-slate-50/60 transition-colors group">
                      
                      {/* ID */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {emp.empId}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4 font-medium text-slate-700">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-sans font-medium text-white bg-gradient-to-tr ${
                            emp.gender === "ชาย" ? "from-blue-400 to-indigo-500" : "from-pink-400 to-purple-500"
                          } shadow-xs`}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-slate-800 font-medium">{emp.name}</p>
                            <p className="text-[9px] text-slate-400 font-light">{emp.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Position & Division */}
                      <td className="py-3 px-4 text-slate-600 font-light">
                        <p className="font-normal text-slate-700">{emp.position}</p>
                        <p className="text-[10px] text-slate-400">{emp.department}</p>
                      </td>

                      {/* Age */}
                      <td className="py-3 px-4 font-mono font-light text-slate-600">
                        <span className={emp.age >= 58 ? "text-rose-600 font-medium bg-rose-50 px-1.5 py-0.5 rounded-sm" : ""}>
                          {emp.age} ปี
                        </span>
                      </td>

                      {/* Tenure */}
                      <td className="py-3 px-4 font-mono font-light text-slate-600">
                        {emp.tenure} ปี
                      </td>

                      {/* Succession */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full ${
                          emp.successionStatus === "Ready Now" 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : emp.successionStatus === "Ready 1-2 Years"
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : emp.successionStatus === "Ready 3-5 Years"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-slate-50 text-slate-400"
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{
                            emp.successionStatus === "Ready Now" ? "Ready Now (สืบทอดทันที)" :
                            emp.successionStatus === "Ready 1-2 Years" ? "พร้อมใน 1-2 ปี" :
                            emp.successionStatus === "Ready 3-5 Years" ? "พร้อมใน 3-5 ปี" : "ไม่มี (None)"
                          }</span>
                        </span>
                      </td>

                      {/* Performance */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${
                          emp.performanceRating === "High Performer"
                            ? "bg-emerald-100/70 text-emerald-700"
                            : emp.performanceRating === "Meets Standard"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-rose-100 text-rose-600"
                        }`}>
                          <span>{emp.performanceRating}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectEmployee(emp)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:text-white hover:bg-slate-800 rounded-lg transition-all border border-slate-200 hover:border-transparent cursor-pointer shadow-3xs"
                        >
                          <Eye size={10} />
                          <span>ส่องประวัติ</span>
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination bar */}
        {tableFilteredEmployees.length > 0 && (
          <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-4 text-xs text-slate-500">
            <span className="font-light">
              แสดงหน้า <span className="font-normal text-slate-800">{currentPage}</span> ใน <span className="font-normal text-slate-800">{totalPages}</span> หน้า (รวมค้นพบทั้งหมด {tableFilteredEmployees.length.toLocaleString()} คน)
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
                        ? "bg-slate-800 text-white" 
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
