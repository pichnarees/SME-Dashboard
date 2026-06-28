/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Resignation } from "../data/mockData";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, Cell, CartesianGrid } from "recharts";
import { 
  ShieldAlert, 
  LogOut, 
  TrendingUp, 
  HelpCircle, 
  Briefcase, 
  FileWarning, 
  Eye, 
  Sparkles,
  Building,
  MapPin,
  Flame,
  ArrowRight,
  Search,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { FilterState } from "./FilterBar";

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
  const itemsPerPage = 6;

  const totalCount = resignations.length;

  const filteredTableData = useMemo(() => {
    return resignations.filter(r => {
      const matchesSearch = searchTerm === "" ||
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.resignReason.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "All" || r.resignType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [resignations, searchTerm, typeFilter]);

  const paginatedResignations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTableData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTableData, currentPage]);

  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage) || 1;

  // Reset pagination on search or filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  // Section 1: KPI Cards
  const stats = useMemo(() => {
    const focus = resignations.filter(r => r.resignType === "Focus resignation").length;
    const nonFocus = resignations.filter(r => r.resignType === "Non-Focus resignation").length;
    const permanent = resignations.filter(r => r.isPermanent).length;
    const contract = resignations.filter(r => r.isContract).length;

    // Turnover Rate based on current Active headcount
    const rate = totalActiveCount > 0 ? ((totalCount / (totalActiveCount + totalCount)) * 100).toFixed(1) : "0.0";

    return {
      focus,
      nonFocus,
      permanent,
      contract,
      rate
    };
  }, [resignations, totalActiveCount, totalCount]);

  // Section 2: Monthly Turnover Trend
  const monthlyTrendData = useMemo(() => {
    const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน"];
    const counts: Record<string, number> = {};
    months.forEach(m => (counts[m] = 0));

    resignations.forEach(r => {
      if (counts[r.month] !== undefined) counts[r.month]++;
    });

    return months.map(m => ({
      name: m,
      จำนวนคนลาออก: counts[m],
      ค่าเฉลี่ย: Math.round((totalCount / months.length) * 10) / 10
    }));
  }, [resignations, totalCount]);

  // Section 3: Resignation Reasons
  const reasonsData = useMemo(() => {
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

  // Section 4: Turnover by Organization (Business Line)
  const turnoverByLine = useMemo(() => {
    const counts: Record<string, number> = {};
    resignations.forEach(r => {
      const line = r.division.includes("สาขา") ? "สายงานสาขาหลัก" : "สายงานสนับสนุนสำนักงานใหญ่";
      counts[line] = (counts[line] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      จำนวนคน: value
    }));
  }, [resignations]);

  // Resignation by Level distribution
  const turnoverByLevel = useMemo(() => {
    const counts: Record<string, number> = {};
    resignations.forEach(r => {
      counts[r.level] = (counts[r.level] || 0) + 1;
    });

    const levelOrder = ["Level 10 ผู้จัดการอาวุโส", "Level 9 ผู้จัดการ", "Level 8 ผู้ช่วยผู้จัดการ", "Level 8 เจ้าหน้าที่อาวุโส", "Level 7", "Level 6", "Level 5"];
    return levelOrder.map(lvl => ({
      name: lvl.replace("ผู้จัดการอาวุโส", "ผจก.อาวุโส").replace("ผู้จัดการ", "ผจก.").replace("ผู้ช่วยผู้จัดการ", "ผช.ผจก.").replace("เจ้าหน้าที่อาวุโส", "จก.อาวุโส"),
      จำนวนคน: counts[lvl] || 0
    })).filter(item => item.จำนวนคน > 0);
  }, [resignations]);

  const branchTurnoverCount = resignations.filter(r => r.division.includes("สาขา")).length;
  const hqTurnoverCount = resignations.filter(r => !r.division.includes("สาขา")).length;

  const branchPercent = totalCount > 0 ? Math.round((branchTurnoverCount / totalCount) * 100) : 0;
  const hqPercent = totalCount > 0 ? Math.round((hqTurnoverCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: Turnover Summary KPIs */}
      <div className="bg-white border border-[#DCE6F2]/70 rounded-2xl p-6.5 shadow-md shadow-[#2F6FE4]/4">
        <div className="flex items-center gap-2.5 mb-5.5">
          <div className="w-1 h-5 bg-[#2F6FE4] rounded-full" />
          <div>
            <h3 className="text-sm font-semibold text-[#1F2D3D]">อัตราและสถิติการลาออก (Section A: Corporate Turnover Metrics)</h3>
            <p className="text-[11px] text-[#5B6B7F] mt-0.5">วัดผลแนวโน้มการรักษาสมดุลกำลังพนักงาน ดัชนีการเข้าออกรายเดือน และกลุ่มงานที่อ่อนไหวสูง</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4.5" id="turnover-summary-cards">
          {/* Card 1 */}
          <div className="bg-white border border-[#DCE6F2]/70 rounded-2xl p-4.5 hover-card-premium flex flex-col justify-between min-h-[110px] shadow-sm">
            <div className="flex items-center justify-between text-[#5B6B7F]">
              <span className="text-[11px] font-semibold text-[#5B6B7F]">จำนวนการลาออกรวม</span>
              <span className="p-2 bg-[#F36B6B]/8 text-[#F36B6B] rounded-xl">
                <LogOut size={14} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-lg font-bold text-[#1F2D3D] block">{(totalCount).toLocaleString()} คน</span>
              <span className="text-[9.5px] text-[#5B6B7F] mt-1.5 block font-light">ข้อมูลสะสม 6 เดือนล่าสุด</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#2F6FE4]/4 border border-[#2F6FE4]/18 rounded-2xl p-4.5 flex flex-col justify-between min-h-[110px] shadow-xs relative overflow-hidden">
            <div className="absolute right-0 top-0 w-12 h-12 bg-[#2F6FE4]/4 rounded-full translate-x-4 -translate-y-4" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#2F6FE4]">อัตราการลาออก</span>
              <span className="p-2 bg-[#2F6FE4]/10 text-[#2F6FE4] rounded-xl">
                <TrendingUp size={14} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-lg font-bold text-[#2F6FE4] block">{stats.rate}%</span>
              <span className="text-[9.5px] text-[#2F6FE4] mt-1.5 block font-medium">ต่ำกว่าเกณฑ์อุตสาหกรรม</span>
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => {
              onSetFilters(prev => ({
                ...prev,
                resignType: prev.resignType === "Focus resignation" ? "All" : "Focus resignation"
              }));
            }}
            className={`cursor-pointer select-none border rounded-2xl p-4.5 transition-all duration-300 flex flex-col justify-between min-h-[110px] hover-card-premium shadow-sm ${
              activeFilters.resignType === "Focus resignation"
                ? "bg-red-50/50 border-[#F36B6B] ring-1 ring-[#F36B6B]/30"
                : "bg-white border-[#DCE6F2]/70 hover:border-[#F36B6B]/35"
            }`}
          >
            <div className="flex items-center justify-between text-[#5B6B7F]">
              <span className="text-[11px] font-semibold text-[#5B6B7F]">Focus Resignation</span>
              <span className="p-2 bg-[#F36B6B]/8 text-[#F36B6B] rounded-xl">
                <ShieldAlert size={14} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-lg font-bold text-[#1F2D3D] block">{(stats.focus).toLocaleString()} คน</span>
              <span className="text-[9.5px] text-[#F36B6B] mt-1.5 block font-semibold">กลุ่มตำแหน่งวิกฤตสูญเสีย</span>
            </div>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => {
              onSetFilters(prev => ({
                ...prev,
                resignType: prev.resignType === "Non-Focus resignation" ? "All" : "Non-Focus resignation"
              }));
            }}
            className={`cursor-pointer select-none border rounded-2xl p-4.5 transition-all duration-300 flex flex-col justify-between min-h-[110px] hover-card-premium shadow-sm ${
              activeFilters.resignType === "Non-Focus resignation"
                ? "bg-slate-50 border-slate-400 ring-1 ring-slate-400/30"
                : "bg-white border-[#DCE6F2]/70 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between text-[#5B6B7F]">
              <span className="text-[11px] font-semibold text-[#5B6B7F]">Non-Focus Resign</span>
              <span className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                <HelpCircle size={14} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-lg font-bold text-[#1F2D3D] block">{(stats.nonFocus).toLocaleString()} คน</span>
              <span className="text-[9.5px] text-[#5B6B7F] mt-1.5 block font-light">กลุ่มงานทั่วไปและสนับสนุน</span>
            </div>
          </div>

          {/* Card 5 */}
          <div 
            onClick={() => {
              onSetFilters(prev => ({
                ...prev,
                contractType: prev.contractType === "พนักงานประจำ" ? "All" : "พนักงานประจำ"
              }));
            }}
            className={`cursor-pointer select-none border rounded-2xl p-4.5 transition-all duration-300 flex flex-col justify-between min-h-[110px] hover-card-premium shadow-sm ${
              activeFilters.contractType === "พนักงานประจำ"
                ? "bg-blue-50/50 border-[#2F6FE4] ring-1 ring-[#2F6FE4]/30"
                : "bg-white border-[#DCE6F2]/70 hover:border-[#2F6FE4]/35"
            }`}
          >
            <div className="flex items-center justify-between text-[#5B6B7F]">
              <span className="text-[11px] font-semibold text-[#5B6B7F]">ลาออกพนักงานประจำ</span>
              <span className="p-2 bg-[#4C8DFF]/8 text-[#4C8DFF] rounded-xl">
                <Briefcase size={14} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-lg font-bold text-[#1F2D3D] block">{(stats.permanent).toLocaleString()} คน</span>
              <span className="text-[9.5px] text-[#5B6B7F] mt-1.5 block font-light">พนักงานในระบบสัญญาหลัก</span>
            </div>
          </div>

          {/* Card 6 */}
          <div 
            onClick={() => {
              onSetFilters(prev => ({
                ...prev,
                contractType: prev.contractType === "พนักงานสัญญาจ้าง" ? "All" : "พนักงานสัญญาจ้าง"
              }));
            }}
            className={`cursor-pointer select-none border rounded-2xl p-4.5 transition-all duration-300 flex flex-col justify-between min-h-[110px] hover-card-premium shadow-sm ${
              activeFilters.contractType === "พนักงานสัญญาจ้าง"
                ? "bg-cyan-50/50 border-[#25B7D3] ring-1 ring-[#25B7D3]/30"
                : "bg-white border-[#DCE6F2]/70 hover:border-[#25B7D3]/35"
            }`}
          >
            <div className="flex items-center justify-between text-[#5B6B7F]">
              <span className="text-[11px] font-semibold text-[#5B6B7F]">ลาออกสัญญาจ้าง</span>
              <span className="p-2 bg-[#8B5CF6]/8 text-[#8B5CF6] rounded-xl">
                <FileWarning size={14} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-lg font-bold text-[#1F2D3D] block">{(stats.contract).toLocaleString()} คน</span>
              <span className="text-[9.5px] text-[#5B6B7F] mt-1.5 block font-light">สัญญาชั่วคราว/เฉพาะโครงการ</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: Monthly Trend & Reasons Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line chart: monthly trend */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-4 bg-[#2F6FE4] rounded-full" />
              <h4 className="text-sm font-medium text-[#1F2D3D]">แนวโน้มการลาออกรายเดือน (Monthly Retention Trend)</h4>
            </div>
            <p className="text-[11px] text-[#5B6B7F] mb-5">แสดงอัตราพนักงานลาออกจริงเปรียบเทียบกับเกณฑ์มาตรฐานเพื่อเฝ้าระวังสัญญาณเตือนภัย</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2ECF5" />
                <XAxis dataKey="name" stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", fontSize: "11px", color: "#FFFFFF", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)" }}
                  itemStyle={{ color: "#E2E8F0" }}
                  labelStyle={{ color: "#94A3B8" }}
                  formatter={(value) => [`${value} คน`, "ลาออก"]}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" name="ปริมาณคนลาออกจริง" dataKey="จำนวนคนลาออก" stroke="#2F6FE4" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line type="monotone" name="ค่าเฉลี่ยสะสม 6 เดือน" strokeDasharray="5 5" dataKey="ค่าเฉลี่ย" stroke="#5B6B7F" strokeWidth={1.2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart: Reasons */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-4 bg-[#25B7D3] rounded-full" />
              <h4 className="text-sm font-medium text-[#1F2D3D]">เหตุผลการแจ้งออกจากงาน (Primary Resignation Reasons)</h4>
            </div>
            <p className="text-[11px] text-[#5B6B7F] mb-5">จัดอันดับข้อมูลสะสมเพื่อระบุช่องโหว่ความมั่นคงด้านสวัสดิการและการเลื่อนขั้นในระดับสาขา</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reasonsData} layout="vertical" margin={{ top: 5, right: 30, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#E2ECF5" />
                <XAxis type="number" stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#1F2D3D" fontSize={9} tickLine={false} axisLine={false} width={135} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", fontSize: "11px", color: "#FFFFFF", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)" }}
                  itemStyle={{ color: "#E2E8F0" }}
                  labelStyle={{ color: "#94A3B8" }}
                  formatter={(value) => [`${value} คน`, "จำนวนพนักงาน"]}
                />
                <Bar dataKey="จำนวนคน" fill="#4C8DFF" radius={[0, 4, 4, 0]} barSize={10}>
                  {reasonsData.map((entry, index) => {
                    const isNewJob = entry.name === "ได้งานใหม่";
                    return <Cell key={`cell-${index}`} fill={isNewJob ? "#2F6FE4" : "#25B7D3"} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 4 & 5: Turnover by organization & employee level */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Turnover by Line - Visual progress meters instead of just raw grids */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-4 bg-[#2F6FE4] rounded-full" />
              <h4 className="text-sm font-medium text-[#1F2D3D]">อัตราลาออก: สำนักงานใหญ่ vs ภูมิภาค</h4>
            </div>
            <p className="text-[11px] text-[#5B6B7F] mb-6">วิเคราะห์ความเปราะบางเปรียบเทียบเชิงทำเล เพื่อหามาตรการดูแลให้ตรงเป้าหมาย</p>
          </div>

          <div className="space-y-6 my-auto">
            {/* Branches Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-light">
                <span className="text-[#1F2D3D] flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#2F6FE4]" /> กลุ่มสาขาและภูมิภาค
                </span>
                <span className="font-medium text-[#2F6FE4]">{branchTurnoverCount} คน ({branchPercent}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#2F6FE4] h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${branchPercent}%` }}
                />
              </div>
              <span className="text-[9px] text-[#5B6B7F] block">ส่วนใหญ่อยู่ในภูมิภาค 1 และ 2 มีความถี่ลาออกเพื่อย้ายกลับภูมิลำเนาเดิม</span>
            </div>

            {/* HQ Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-light">
                <span className="text-[#1F2D3D] flex items-center gap-1.5">
                  <Building size={13} className="text-[#4C8DFF]" /> สำนักงานใหญ่ (HQ)
                </span>
                <span className="font-medium text-[#4C8DFF]">{hqTurnoverCount} คน ({hqPercent}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#4C8DFF] h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${hqPercent}%` }}
                />
              </div>
              <span className="text-[9px] text-[#5B6B7F] block">ส่วนใหญ่สังกัดทีมวิจัยสินเชื่อและทีมเทคโนโลยี ได้รับผลตอบแทนสูงทดแทนภายนอก</span>
            </div>
          </div>
        </div>

        {/* Resignation by level */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-4 bg-[#2DBE7F] rounded-full" />
              <h4 className="text-sm font-medium text-[#1F2D3D]">สถิติการลาออกจำแนกตามระดับพนักงาน (Turnover by Level)</h4>
            </div>
            <p className="text-[11px] text-[#5B6B7F] mb-5">แสดงความถี่การลาออกของบุคลากรในแต่ละระดับ เพื่อวิเคราะห์จุดอับในการเติบโตทางอาชีพ</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={turnoverByLevel} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2ECF5" />
                <XAxis dataKey="name" stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", fontSize: "11px", color: "#FFFFFF", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)" }}
                  itemStyle={{ color: "#E2E8F0" }}
                  labelStyle={{ color: "#94A3B8" }}
                  formatter={(value) => [`${value} คน`, "จำนวนคน"]}
                />
                <Bar dataKey="จำนวนคน" fill="#2DBE7F" radius={[4, 4, 0, 0]} barSize={26}>
                  {turnoverByLevel.map((entry, index) => {
                    const isHigh = entry.name.includes("จก.อาวุโส") || entry.name.includes("ผช.ผจก.");
                    return <Cell key={`cell-${index}`} fill={isHigh ? "#2DBE7F" : "#4C8DFF"} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 6: Redesigned Executive Strategy Panel */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm" id="retention-insights-panel">
        
        {/* Banner header */}
        <div className="flex items-start gap-3.5 pb-5 border-b border-[#DCE6F2]/60 mb-6">
          <div className="p-2.5 bg-[#2F6FE4]/8 text-[#2F6FE4] rounded-xl shrink-0">
            <Eye size={20} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#1F2D3D]">แผนกลยุทธ์การรักษาบุคลากรและการสร้างความมั่นคง (Corporate Talent Retention & Stability Board)</h4>
            <p className="text-xs text-[#5B6B7F] mt-0.5">แผนผังปฏิบัติการทางนโยบายเพื่อลดความผันผวนของอัตรากำลังพลระดับปฏิบัติการอย่างเป็นรูปธรรม</p>
          </div>
        </div>

        {/* Content columns as Action Card Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1 */}
          <div className="bg-[#F6F9FC] border border-[#DCE6F2] rounded-xl p-5 hover:border-[#2F6FE4]/30 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2F6FE4]" />
                <h5 className="text-xs font-medium text-[#1F2D3D]">1. การยกระดับการจัดการรางวัลและสิทธิประโยชน์ยืดหยุ่น (Flexible Reward Packages)</h5>
              </div>
              <p className="text-xs text-[#5B6B7F] leading-relaxed font-light">
                สอดรับกับสถิติ <span className="font-medium text-[#1F2D3D]">"ได้งานใหม่"</span> ซึ่งเป็นสาเหตุการลาออกอันดับสูงสุดของพนักงานระดับ Level 6-8 (เจ้าหน้าที่อาวุโส) ธนาคารควรเร่งนำร่องแผนความยืดหยุ่นทางสวัสดิการ (Flexible Benefits) เช่น ค่าสนับสนุนตรวจสุขภาพครอบครัว และการอุดหนุนดอกเบี้ยกู้บ้าน เพื่อจูงใจคนเก่งให้อยู่กับองค์กรยาวนานขึ้น
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#DCE6F2]/70 flex items-center justify-between text-[11px] text-[#2F6FE4]">
              <span className="font-medium">ความสำคัญอันดับหนึ่ง: สรรหาแบบรักษาคนเก่า (High Priority)</span>
              <div className="flex items-center gap-1 cursor-pointer hover:underline">
                <span>เปิดแผนร่างงบประมาณ</span>
                <ArrowRight size={11} />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#F6F9FC] border border-[#DCE6F2] rounded-xl p-5 hover:border-[#2F6FE4]/30 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2DBE7F]" />
                <h5 className="text-xs font-medium text-[#1F2D3D]">2. การฟูมฟักส้นทางสายวิชาชีพ (Career Path Architecture) ประจำสาขาภูมิภาค</h5>
              </div>
              <p className="text-xs text-[#5B6B7F] leading-relaxed font-light">
                เพื่อรับมืออัตราลาออกหนาแน่นในฝั่งภูมิภาคที่มักประสบปัญหาการหมุนเวียนงานและขีดข้อจำกัดการปรับเลื่อนชั้นงาน เสนอให้จัดตั้งโครงการจัดทำแผนที่ทักษะความก้าวหน้าและเพิ่มระบบ <span className="font-medium text-[#1F2D3D]">"Internal Career Mobility"</span> ให้สามารถโอนย้ายสลับบทบาทเพื่อลดความอัดอั้นจากการขายผลผลิตสินเชื่อท้องถิ่น
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#DCE6F2]/70 flex items-center justify-between text-[11px] text-[#2DBE7F]">
              <span className="font-medium">แนวทางบรรเทาระยะกลาง: แผนปรับย้ายภายในองค์กร (Stability Plan)</span>
              <div className="flex items-center gap-1 cursor-pointer hover:underline">
                <span>โครงสร้างโปรแกรมสลับสาย</span>
                <ArrowRight size={11} />
              </div>
            </div>
          </div>

        </div>

        {/* Footnotes with updates indicators */}
        <div className="mt-6 pt-5 border-t border-[#DCE6F2]/60 flex items-center justify-between flex-wrap gap-2 text-[11px] text-[#5B6B7F]">
          <span className="font-light flex items-center gap-1">
            <Sparkles size={12} className="text-[#FFB547]" /> สถิตินี้ได้รับการตรวจสอบยืนยันสัญญารับแจ้งล่วงหน้า 30 วันตามระเบียบงานบุคคลอย่างเป็นทางการ
          </span>
          <span className="font-medium text-[#2F6FE4]">จัดทำโดย ทีมวิเคราะห์ข้อมูลทรัพยากรมนุษย์ (HR Analytics - SME D Bank)</span>
        </div>

      </div>

      {/* SECTION 4: Detailed Explorer / Table */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-[#DCE6F2]/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#2F6FE4]/8 text-[#2F6FE4] rounded-xl shrink-0">
              <Search size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#1F2D3D]">ทำเนียบประวัติและสืบค้นการลาออก (Section D: Detailed Resignation Explorer)</h3>
              <p className="text-[11px] text-[#5B6B7F] mt-0.5">ค้นหาข้อมูลรายชื่อพนักงานที่ลาออก ตรวจสอบสังกัด วันที่พ้นสภาพ และเหตุผลสำคัญสำหรับประกอบการวางนโยบาย</p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="relative w-full md:max-w-xs">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6B7F]" />
            <input
              type="text"
              placeholder="ค้นหารหัส, ชื่อ, หรือสาเหตุ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#DCE6F2] bg-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#2F6FE4]/8 focus:border-[#2F6FE4]/30 transition-all text-[#1F2D3D]"
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

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-[#5B6B7F]">ประเภทการลาออก:</span>
            <div className="flex bg-[#F4F7FC] p-0.5 rounded-lg border border-slate-200/50">
              {(["All", "Focus resignation", "Non-Focus resignation"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
                    typeFilter === t
                      ? "bg-white text-[#2F6FE4] shadow-xs border border-slate-200/20"
                      : "text-[#5B6B7F] hover:text-[#2F6FE4]"
                  }`}
                >
                  {t === "All" ? "ทั้งหมด" : t === "Focus resignation" ? "Focus" : "Non-Focus"}
                </button>
              ))}
            </div>
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
                  <th className="py-3 px-4">ส่วนงาน / สังกัดฝ่าย</th>
                  <th className="py-3 px-4">วันที่ลาออก</th>
                  <th className="py-3 px-4">เหตุผลในการลาออก</th>
                  <th className="py-3 px-4">สถานะลาออก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6F2]/50 bg-white">
                {paginatedResignations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-xs text-[#5B6B7F] italic">
                      ไม่พบข้อมูลตรงตามเงื่อนไขที่กำหนด
                    </td>
                  </tr>
                ) : (
                  paginatedResignations.map((res) => (
                    <tr key={res.empId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#5B6B7F]">{res.empId}</td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#1F2D3D]">{res.name}</td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-[#1F2D3D] truncate max-w-[180px]">{res.position}</div>
                        <div className="text-[10px] text-[#5B6B7F] font-medium mt-0.5">{res.level}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-[#1F2D3D] truncate max-w-[180px]">{res.department}</div>
                        <div className="text-[10px] text-[#5B6B7F] font-light mt-0.5">{res.division}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#5B6B7F] font-mono">{res.resignDate}</td>
                      <td className="py-3.5 px-4 text-xs text-[#1F2D3D]">{res.resignReason}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium leading-none ${
                            res.resignType === "Focus resignation"
                              ? "bg-[#F36B6B]/10 text-[#F36B6B]"
                              : "bg-[#94A3B8]/10 text-[#5B6B7F]"
                          }`}
                        >
                          {res.resignType === "Focus resignation" ? "Focus" : "Non-Focus"}
                        </span>
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
