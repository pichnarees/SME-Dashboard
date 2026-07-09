/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Resignation } from "../data/mockData";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  Cell, 
  CartesianGrid,
  PieChart,
  Pie
} from "recharts";
import { 
  ShieldAlert, 
  LogOut, 
  TrendingUp, 
  HelpCircle, 
  Briefcase, 
  FileWarning, 
  Flame, 
  ArrowRight, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Building,
  MapPin,
  Calendar,
  AlertTriangle,
  Info
} from "lucide-react";

import { FilterState } from "./FilterBar";
import SectionHeader from "./SectionHeader";

interface TurnoverAnalysisProps {
  resignations: Resignation[];
  totalActiveCount: number;
  activeFilters: FilterState;
  onSetFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export default function TurnoverAnalysis({ 
  resignations, 
  totalActiveCount,
  activeFilters,
  onSetFilters
}: TurnoverAnalysisProps) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Focus resignation" | "Non-Focus resignation">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalCount = resignations.length;

  // Filter resignation data based on search and local toggle
  const filteredResignationsList = useMemo(() => {
    return resignations.filter(r => {
      const matchesSearch = searchTerm === "" ||
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.resignReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "All" || r.resignType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [resignations, searchTerm, typeFilter]);

  // Reset pagination on search or type change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  const totalPages = Math.ceil(filteredResignationsList.length / itemsPerPage) || 1;
  const paginatedResignations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResignationsList.slice(start, start + itemsPerPage);
  }, [filteredResignationsList, currentPage]);

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  };

  // Resignation statistic summaries
  const statsSummary = useMemo(() => {
    const focus = resignations.filter(r => r.resignType === "Focus resignation").length;
    const nonFocus = resignations.filter(r => r.resignType === "Non-Focus resignation").length;
    const permanent = resignations.filter(r => r.isPermanent).length;
    const contract = resignations.filter(r => r.isContract).length;

    const rate = totalActiveCount > 0 ? ((totalCount / (totalActiveCount + totalCount)) * 100).toFixed(1) : "0.0";

    return {
      focus,
      nonFocus,
      permanent,
      contract,
      rate
    };
  }, [resignations, totalActiveCount, totalCount]);

  // Line Chart Monthly trend data
  const monthlyTrendChartData = useMemo(() => {
    const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน"];
    const counts: Record<string, number> = {};
    months.forEach(m => (counts[m] = 0));

    resignations.forEach(r => {
      if (counts[r.month] !== undefined) {
        counts[r.month]++;
      }
    });

    const averageValue = Math.round((totalCount / months.length) * 10) / 10;

    return months.map(m => ({
      name: m,
      จำนวนคนลาออก: counts[m],
      ค่าเฉลี่ย: averageValue
    }));
  }, [resignations, totalCount]);

  // Bar Chart Resignation reasons sorted
  const exitReasonsChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    resignations.forEach(r => {
      counts[r.resignReason] = (counts[r.resignReason] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        จำนวนคน: value
      }))
      .sort((a, b) => b.จำนวนคน - a.จำนวนคน);
  }, [resignations]);

  // Pie chart turnover by organization grouping
  const orgTurnoverPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    resignations.forEach(r => {
      const isBranch = r.division.includes("สาขา");
      const label = isBranch ? "สายงานสาขาหลักภูมิภาค (Branches)" : "สำนักงานใหญ่ (HQ Support)";
      counts[label] = (counts[label] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: idx === 0 ? "#3B82F6" : "#10B981"
    }));
  }, [resignations]);

  // Resignation count by Level distribution
  const levelTurnoverChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    resignations.forEach(r => {
      counts[r.level] = (counts[r.level] || 0) + 1;
    });

    const levelOrder = [
      "Level 10 ผู้จัดการอาวุโส", 
      "Level 9 ผู้จัดการ", 
      "Level 8 ผู้ช่วยผู้จัดการ", 
      "Level 8 เจ้าหน้าที่อาวุโส", 
      "Level 7", 
      "Level 6", 
      "Level 5"
    ];

    return levelOrder.map(lvl => {
      const nameShort = lvl
        .replace("ผู้จัดการอาวุโส", "ผจก.อาวุโส")
        .replace("ผู้จัดการ", "ผจก.")
        .replace("ผู้ช่วยผู้จัดการ", "ผช.ผจก.")
        .replace("เจ้าหน้าที่อาวุโส", "จก.อาวุโส");

      return {
        name: nameShort,
        จำนวนคน: counts[lvl] || 0
      };
    }).filter(item => item.จำนวนคน > 0);
  }, [resignations]);

  return (
    <div className="space-y-6">

      {/* Main KPI indicator panel */}
      <div>
        <SectionHeader
          icon={<LogOut size={18} />}
          eyebrow="Exit & Turnover Metrics"
          title="สถิติตัวเลขวิเคราะห์การลาออกปี 2569"
          description="การติดตามข้อมูลสถิติการลาออก อัตราการสูญเสียบุคลากร และสัดส่วนกลุ่มเป้าหมายยุทธศาสตร์ต่าง ๆ"
          themeColor="rose"
          right={
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-light">
              <Info size={11} />
              <span>อัปเดตรายเดือนผ่านระบบ HR Portal</span>
            </div>
          }
        />

        {/* The Grid of turnover stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          {/* Standard Card 1: Turnover Rate */}
          <div className="bg-white border border-slate-100/95 shadow-xs hover:shadow-md p-4.5 rounded-[22px] relative overflow-hidden group transition-all duration-300 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100 shrink-0">
                <TrendingUp size={14} className="text-rose-500" />
              </div>
              <span className="text-[9px] font-sans font-medium bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full uppercase">
                Rate
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-medium tracking-wide uppercase text-slate-400">อัตราการลาออกสะสม</p>
              <p className="text-[9px] font-light text-slate-400">Turnover Rate</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-sans font-medium tracking-tight text-slate-800">
                  {statsSummary.rate}%
                </span>
              </div>
            </div>
            <div className="mt-3.5 pt-2 border-t border-slate-50 flex items-center justify-between text-[8px] text-slate-400 font-light">
              <span>เทียบกำลังคนแอคทีฟทั้งหมด</span>
              <span className="font-mono text-rose-600 font-medium">Accumulated</span>
            </div>
          </div>

          {/* Standard Card 2: Focus Resign */}
          <div className="bg-white border border-slate-100/95 shadow-xs hover:shadow-md p-4.5 rounded-[22px] relative overflow-hidden group transition-all duration-300 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100 shrink-0">
                <Flame size={14} className="text-rose-500 animate-pulse" />
              </div>
              <span className="text-[9px] font-sans font-medium bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full uppercase">
                Focus
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-medium tracking-wide uppercase text-slate-400">กลุ่มงานกลยุทธ์สำคัญ</p>
              <p className="text-[9px] font-light text-slate-400">Focus Resignations</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-sans font-medium tracking-tight text-slate-800">
                  {statsSummary.focus.toLocaleString()}
                </span>
                <span className="text-[10px] font-medium text-slate-400">คน</span>
              </div>
            </div>
            <div className="mt-3.5 pt-2 border-t border-slate-50 flex items-center justify-between text-[8px] text-rose-600 font-medium">
              <span>ความเสี่ยงกำลังผลิตสูง</span>
              <span className="font-mono text-rose-600">Critical</span>
            </div>
          </div>

          {/* Standard Card 3: Non-Focus */}
          <div className="bg-white border border-slate-100/95 shadow-xs hover:shadow-md p-4.5 rounded-[22px] relative overflow-hidden group transition-all duration-300 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-slate-100 shrink-0">
                <LogOut size={14} />
              </div>
              <span className="text-[9px] font-sans font-medium bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-full uppercase">
                Support
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-medium tracking-wide uppercase text-slate-400">กลุ่มงานธุรการ/สนับสนุน</p>
              <p className="text-[9px] font-light text-slate-400">Non-Focus Resignations</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-sans font-medium tracking-tight text-slate-800">
                  {statsSummary.nonFocus.toLocaleString()}
                </span>
                <span className="text-[10px] font-medium text-slate-400">คน</span>
              </div>
            </div>
            <div className="mt-3.5 pt-2 border-t border-slate-50 flex items-center justify-between text-[8px] text-slate-400 font-light">
              <span>สัดส่วนลาออกตามวาระปกติ</span>
              <span className="font-mono text-slate-500 font-medium">Standard</span>
            </div>
          </div>

          {/* Standard Card 4: Permanent Resign */}
          <div className="bg-white border border-slate-100/95 shadow-xs hover:shadow-md p-4.5 rounded-[22px] relative overflow-hidden group transition-all duration-300 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 shrink-0">
                <Briefcase size={14} />
              </div>
              <span className="text-[9px] font-sans font-medium bg-blue-50 text-blue-500 border border-blue-100 px-2 py-0.5 rounded-full uppercase">
                Permanent
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-medium tracking-wide uppercase text-slate-400">กลุ่มพนักงานประจำ</p>
              <p className="text-[9px] font-light text-slate-400">Permanent Resignations</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-sans font-medium tracking-tight text-slate-800">
                  {statsSummary.permanent.toLocaleString()}
                </span>
                <span className="text-[10px] font-medium text-slate-400">คน</span>
              </div>
            </div>
            <div className="mt-3.5 pt-2 border-t border-slate-50 flex items-center justify-between text-[8px] text-slate-400 font-light">
              <span>สถิติลาออกพนักงานประจำ</span>
              <span className="font-mono text-blue-600 font-medium">Regular Staff</span>
            </div>
          </div>

          {/* Standard Card 5: Contract End */}
          <div className="bg-white border border-slate-100/95 shadow-xs hover:shadow-md p-4.5 rounded-[22px] relative overflow-hidden group transition-all duration-300 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100 shrink-0">
                <Calendar size={14} />
              </div>
              <span className="text-[9px] font-sans font-medium bg-cyan-50 text-cyan-500 border border-cyan-100 px-2 py-0.5 rounded-full uppercase">
                Contract
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-medium tracking-wide uppercase text-slate-400">กลุ่มสัญญาจ้างสิ้นสุดวาระ</p>
              <p className="text-[9px] font-light text-slate-400">Contract Endings</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-sans font-medium tracking-tight text-slate-800">
                  {statsSummary.contract.toLocaleString()}
                </span>
                <span className="text-[10px] font-medium text-slate-400">คน</span>
              </div>
            </div>
            <div className="mt-3.5 pt-2 border-t border-slate-50 flex items-center justify-between text-[8px] text-slate-400 font-light">
              <span>หมดสัญญาจ้าง/ไม่ต่อสัญญา</span>
              <span className="font-mono text-cyan-600 font-medium">Term End</span>
            </div>
          </div>

        </div>
      </div>

      {/* Charts panel: Trend & Reasons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Line chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <SectionHeader
              icon={<TrendingUp size={18} />}
              eyebrow="Monthly Trend"
              title="แนวโน้มและปริมาณการลาออกสะสมรายเดือน"
              description="แสดงสถิติการยื่นคำร้องขอลาออกและอัตราการสูญเสียบุคลากรสะสมเปรียบเทียบในรอบปี"
              themeColor="rose"
            />
            
            <div className="h-[200px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748B', fontSize: 10 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#64748B', fontSize: 10 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: 11, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line 
                    type="monotone" 
                    dataKey="จำนวนคนลาออก" 
                    stroke="#EF4444" 
                    strokeWidth={3} 
                    dot={{ fill: '#EF4444', r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ค่าเฉลี่ย" 
                    stroke="#94A3B8" 
                    strokeWidth={1.5} 
                    strokeDasharray="5 5" 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-light mt-5 pt-3 border-t border-slate-50">
            * เดือนเมษายน ตรวจพบสถิติลาออกพุ่งขึ้นสูงเป็นประวัติการณ์จากการโยกย้ายหลังประเมินประจำปี
          </p>
        </div>

        {/* Right Column: Reasons list progress bar (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <SectionHeader
              icon={<FileWarning size={18} />}
              eyebrow="Exit Reasons"
              title="วิเคราะห์สาเหตุและปัจจัยการตัดสินใจออกจากงาน"
              description="สถิติการเก็บข้อมูลสรุปปัจจัยและสิ่งดึงดูดใจที่ทำให้บุคลากรตัดสินใจเปลี่ยนเส้นทางอาชีพ"
              themeColor="rose"
            />

            <div className="mt-5 space-y-3.5">
              {exitReasonsChartData.map((item, idx) => {
                const percent = Math.round((item.จำนวนคน / (totalCount || 1)) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-700">{item.name}</span>
                      <span className="font-mono text-slate-500 font-medium">
                        <span className="font-semibold text-slate-800">{item.จำนวนคน} คน</span> ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-light mt-5 pt-3 border-t border-slate-50">
            * สหวิเคราะห์ชี้ อัตราได้งานใหม่ภายนอกเป็นหัวข้อหลักที่พนักงานให้เหตุผลหลัก
          </p>
        </div>

      </div>

      {/* Organization and Level details row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Organization breakdown (Pie) */}
        <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
          <SectionHeader
            icon={<Building size={18} />}
            eyebrow="Structure Segment"
            title="การแบ่งตามโครงสร้างปฏิบัติการภูมิภาค"
            description="เปรียบเทียบระหว่างกำลังพลสาขาหลักและฝ่ายสนับสนุนในสำนักงานใหญ่"
            themeColor="rose"
          />
          <div className="h-[160px] w-full mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orgTurnoverPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {orgTurnoverPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-[10px] space-y-1 ml-4 border-l pl-4 shrink-0">
              {orgTurnoverPieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-500 truncate max-w-[120px] font-light">{d.name}</span>
                  <span className="text-slate-800 font-medium font-mono">({d.value} คน)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Level breakdown (Bar chart) */}
        <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
          <SectionHeader
            icon={<Briefcase size={18} />}
            eyebrow="Level Breakdown"
            title="จำนวนผู้ลาออกจำแนกตามระดับชั้นงาน"
            description="การแจกแจงจำนวนการลาออกตามระดับความรับผิดชอบในสายองค์กร"
            themeColor="rose"
          />
          <div className="h-[160px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelTurnoverChartData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12 }} />
                <Bar dataKey="จำนวนคน" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Resignation Explorer table */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
        
        <SectionHeader
          icon={<Search size={18} />}
          eyebrow="Exit Database"
          title="รายบัญชีประวัติผู้ลาออกสะสมรายบุคคล"
          description="ระบบสืบค้นประวัติการลาออกทั้งหมด เพื่อตรวจสอบรายละเอียด ปลายทาง และสาเหตุเชิงลึก"
          themeColor="rose"
          right={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Toggler */}
              <div className="inline-flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs shrink-0">
                {[
                  { id: "All", label: "ทุกกลุ่ม" },
                  { id: "Focus resignation", label: "เฉพาะกลุ่ม Focus" },
                  { id: "Non-Focus resignation", label: "กลุ่ม Non-Focus" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTypeFilter(item.id as any)}
                    className={`px-2.5 py-1 text-[10px] font-medium rounded-lg transition-all cursor-pointer ${
                      typeFilter === item.id 
                        ? "bg-slate-800 text-white shadow-xs" 
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Table Search */}
              <div className="relative min-w-[200px]">
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อ, รหัส, เหตุผล..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 py-1.5 text-xs rounded-lg border border-slate-200/70 dark:border-slate-700/70 focus:outline-hidden focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 dark:bg-slate-800 dark:text-white transition-all font-light"
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
          }
        />

        {/* Table content */}
        <div className="overflow-x-auto mt-4">
          {filteredResignationsList.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <FileWarning size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">ไม่พบข้อมูลรายบัญชีผู้ลาออกตามเงื่อนไขสืบค้น</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-medium text-slate-400 uppercase tracking-wider bg-slate-50/30">
                  <th className="py-3 px-4 font-medium">รหัสพนักงาน</th>
                  <th className="py-3 px-4 font-medium">ชื่อ-นามสกุล</th>
                  <th className="py-3 px-4 font-medium">ตำแหน่งล่าสุด</th>
                  <th className="py-3 px-4 font-medium">ส่วนงาน/ฝ่าย</th>
                  <th className="py-3 px-4 font-medium">ระดับงาน</th>
                  <th className="py-3 px-4 font-medium">วันที่ลาออก</th>
                  <th className="py-3 px-4 font-medium">ประเภทลาออก</th>
                  <th className="py-3 px-4 font-medium">เหตุผลหลักในการลาออก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {paginatedResignations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{r.empId}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{r.name}</td>
                    <td className="py-3 px-4 font-light">{r.position}</td>
                    <td className="py-3 px-4 font-light">{r.department}</td>
                    <td className="py-3 px-4 font-light">
                      <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-sans">
                        {r.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-light text-slate-600">{r.resignDate}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${
                        r.resignType === "Focus resignation"
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : "bg-slate-50 text-slate-500 border border-slate-200/50"
                      }`}>
                        <span>{r.resignType === "Focus resignation" ? "Focus" : "Non-Focus"}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-light text-slate-700">
                      <p className="bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg inline-block">
                        {r.resignReason}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination bar */}
        {filteredResignationsList.length > 0 && (
          <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-4 text-xs text-slate-500">
            <span className="font-light">
              แสดงหน้า <span className="font-normal text-slate-800">{currentPage}</span> ใน <span className="font-normal text-slate-800">{totalPages}</span> หน้า (รวมค้นพบทั้งหมด {filteredResignationsList.length.toLocaleString()} อัตรา)
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

              {/* Page numbers */}
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
