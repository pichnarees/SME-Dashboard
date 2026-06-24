/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Employee } from "../data/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, PieChart, Pie } from "recharts";
import { 
  Layers, 
  GitBranch, 
  ShieldCheck, 
  Home, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  ChevronDown,
  Building,
  Target,
  Search,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  UserCheck,
  Activity,
  Award
} from "lucide-react";

interface OrganizationStructureProps {
  employees: Employee[];
}

export default function OrganizationStructure({ employees }: OrganizationStructureProps) {
  // Drill-down selection state
  const [selectedBusinessLine, setSelectedBusinessLine] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const totalCount = employees.length;

  // Section 1: KPI Calculations
  const stats = useMemo(() => {
    const businessLines = new Set<string>();
    const groups = new Set<string>();
    const departments = new Set<string>();
    const zones = new Set<string>();
    const lineCounts: Record<string, number> = {};

    employees.forEach(e => {
      if (e.businessLine) {
        businessLines.add(e.businessLine);
        lineCounts[e.businessLine] = (lineCounts[e.businessLine] || 0) + 1;
      }
      if (e.group) groups.add(e.group);
      if (e.department) departments.add(e.department);
      if (e.zone && e.zone !== "สำนักงานใหญ่") zones.add(e.zone);
    });

    // Find line with max employees
    let maxLine = "-";
    let maxCount = 0;
    Object.entries(lineCounts).forEach(([line, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxLine = line;
      }
    });

    return {
      totalLines: businessLines.size,
      totalGroups: groups.size,
      totalDepartments: departments.size,
      totalZones: zones.size || 5, // Default to SME bank zones
      maxLine,
      maxCount
    };
  }, [employees]);

  // Section 2: Workforce by Business Line (Data for Recharts)
  const businessLineChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(e => {
      counts[e.businessLine] = (counts[e.businessLine] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        จำนวนคน: value,
        เปอร์เซ็นต์: totalCount > 0 ? Math.round((value / totalCount) * 100 * 10) / 10 : 0
      }))
      .sort((a, b) => b.จำนวนคน - a.จำนวนคน);
  }, [employees, totalCount]);

  // Section 4: Top & Bottom Organization Units
  const rankingUnits = useMemo(() => {
    const groupCounts: Record<string, { line: string; count: number }> = {};
    employees.forEach(e => {
      if (!groupCounts[e.group]) {
        groupCounts[e.group] = { line: e.businessLine, count: 0 };
      }
      groupCounts[e.group].count += 1;
    });

    const sortedGroups = Object.entries(groupCounts)
      .map(([groupName, info]) => ({
        name: groupName,
        line: info.line,
        count: info.count
      }))
      .sort((a, b) => b.count - a.count);

    return {
      top8: sortedGroups.slice(0, 8),
      bottom8: [...sortedGroups].reverse().slice(0, 8)
    };
  }, [employees]);

  // Donut data with high-end executive palette
  const donutData = useMemo(() => {
    const colors = [
      "#2F6FE4", // Royal Blue
      "#4C8DFF", // Sky Blue
      "#2DBE7F", // Emerald Green
      "#25B7D3", // Cyan
      "#8B5CF6", // Purple
      "#FFB547", // Amber
      "#FF6B6B", // Coral
      "#94A3B8"  // Slate
    ];
    return businessLineChartData.map((item, idx) => ({
      name: item.name,
      value: item.จำนวนคน,
      percentage: item.เปอร์เซ็นต์,
      color: colors[idx % colors.length]
    }));
  }, [businessLineChartData]);

  // Section 6: Interactive Drill Down Data
  const drillDownLines = useMemo(() => {
    // Top-level lines
    const lines: Record<string, { count: number; groups: Record<string, { count: number; depts: Record<string, number> }> }> = {};

    employees.forEach(e => {
      const line = e.businessLine;
      const group = e.group;
      const dept = e.department;

      if (!lines[line]) {
        lines[line] = { count: 0, groups: {} };
      }
      lines[line].count += 1;

      if (!lines[line].groups[group]) {
        lines[line].groups[group] = { count: 0, depts: {} };
      }
      lines[line].groups[group].count += 1;

      if (!lines[line].groups[group].depts[dept]) {
        lines[line].groups[group].depts[dept] = 0;
      }
      lines[line].groups[group].depts[dept] += 1;
    });

    return lines;
  }, [employees]);

  const handleLineClick = (lineName: string) => {
    if (selectedBusinessLine === lineName) {
      setSelectedBusinessLine(null);
      setSelectedGroup(null);
    } else {
      setSelectedBusinessLine(lineName);
      setSelectedGroup(null);
    }
  };

  const handleGroupClick = (e: React.MouseEvent, groupName: string) => {
    e.stopPropagation(); // prevent collapsing the parent line
    if (selectedGroup === groupName) {
      setSelectedGroup(null);
    } else {
      setSelectedGroup(groupName);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: Organization Summary KPIs */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-5 bg-[#2F6FE4] rounded-full" />
          <div>
            <h3 className="text-sm font-medium text-[#1F2D3D]">สรุปดัชนีโครงสร้างและสายปฏิบัติการ (Section A: Organization KPI Summary)</h3>
            <p className="text-[11px] text-[#5B6B7F] mt-0.5">ภาพรวมสัดส่วนจำแนกตามโครงสร้างตามพระราชบัญญัติและสายบังคับบัญชาหลักธนาคาร</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" id="org-summary-kpis">
          {/* KPI 1 */}
          <div className="bg-white border border-[#DCE6F2] rounded-xl p-4.5 hover:shadow-xs hover:border-[#2F6FE4]/30 transition-all duration-300 flex flex-col justify-between min-h-[105px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#5B6B7F] font-medium">จำนวนสายงานหลัก</span>
              <span className="p-1.5 bg-[#2F6FE4]/8 text-[#2F6FE4] rounded-lg">
                <Layers size={14} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-lg font-medium text-[#1F2D3D] block">{stats.totalLines} สายงาน</span>
              <span className="text-[10px] text-[#5B6B7F] mt-1 block font-light">โครงสร้างฝ่ายบริหารหลัก</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-white border border-[#DCE6F2] rounded-xl p-4.5 hover:shadow-xs hover:border-[#2F6FE4]/30 transition-all duration-300 flex flex-col justify-between min-h-[105px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#5B6B7F] font-medium">จำนวนกลุ่มงานในระบบ</span>
              <span className="p-1.5 bg-[#2DBE7F]/8 text-[#2DBE7F] rounded-lg">
                <GitBranch size={14} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-lg font-medium text-[#1F2D3D] block">{stats.totalGroups} กลุ่มปฏิบัติการ</span>
              <span className="text-[10px] text-[#5B6B7F] mt-1 block font-light">สนับสนุนและการตลาดหลัก</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-white border border-[#DCE6F2] rounded-xl p-4.5 hover:shadow-xs hover:border-[#2F6FE4]/30 transition-all duration-300 flex flex-col justify-between min-h-[105px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#5B6B7F] font-medium">ฝ่ายงานย่อยปฏิบัติการ</span>
              <span className="p-1.5 bg-[#8B5CF6]/8 text-[#8B5CF6] rounded-lg">
                <ShieldCheck size={14} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-lg font-medium text-[#1F2D3D] block">{stats.totalDepartments} ส่วนงาน / ฝ่าย</span>
              <span className="text-[10px] text-[#5B6B7F] mt-1 block font-light">ฝ่ายปฏิบัติการส่วนย่อย</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-white border border-[#DCE6F2] rounded-xl p-4.5 hover:shadow-xs hover:border-[#2F6FE4]/30 transition-all duration-300 flex flex-col justify-between min-h-[105px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#5B6B7F] font-medium">เขตพื้นที่บริการและสาขา</span>
              <span className="p-1.5 bg-[#25B7D3]/8 text-[#25B7D3] rounded-lg">
                <Home size={14} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-lg font-medium text-[#1F2D3D] block">{stats.totalZones} เขตพื้นที่บริการ</span>
              <span className="text-[10px] text-[#5B6B7F] mt-1 block font-light">ครอบคลุมทั่วประเทศ</span>
            </div>
          </div>

          {/* KPI 5 */}
          <div className="bg-[#2F6FE4]/5 border border-[#2F6FE4]/15 rounded-xl p-4.5 flex flex-col justify-between col-span-2 lg:col-span-1 min-h-[105px]">
            <div>
              <span className="text-[10px] text-[#2F6FE4] font-medium block uppercase tracking-wider">สายงานกำลังพลหนาแน่นที่สุด</span>
              <span className="text-xs font-medium text-[#1F2D3D] block truncate mt-1" title={stats.maxLine}>{stats.maxLine}</span>
            </div>
            <div className="mt-2 text-right">
              <span className="text-sm font-medium text-[#2F6FE4] block">{stats.maxCount.toLocaleString()} คน</span>
              <span className="text-[9px] text-[#5B6B7F] block font-light">คิดเป็น {totalCount > 0 ? Math.round((stats.maxCount/totalCount)*100) : 0}% ของธนาคาร</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 5 MERGED: Workforce Distribution by Business Line */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm" id="workforce-distribution-section">
        
        {/* Header with Title and Subtitle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#DCE6F2]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#2F6FE4]/8 text-[#2F6FE4] rounded-xl shrink-0">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#1F2D3D]">สัดส่วนการกระจายกำลังคนตามสายงาน (Workforce Distribution by Business Line)</h3>
              <p className="text-[11px] text-[#5B6B7F] mt-0.5 font-light">
                วิเคราะห์สัดส่วนความหนาแน่นเชิงโครงสร้างและการจัดอันดับกำลังพลตามสายงานเพื่อการบริหารจัดสรรทรัพยากรบุคคลระดับสูง
              </p>
            </div>
          </div>
          
          {/* Top highlight metric tag */}
          <div className="flex items-center gap-2 bg-[#2F6FE4]/5 border border-[#2F6FE4]/15 px-3 py-1.5 rounded-xl shrink-0">
            <Award size={14} className="text-[#2F6FE4]" />
            <span className="text-[10px] text-[#5B6B7F] font-medium">สายงานกำลังคนสูงสุด:</span>
            <span className="text-xs font-medium text-[#2F6FE4]">{stats.maxLine}</span>
          </div>
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Proportions Overview (Donut Chart & Custom Legend) */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
            <div>
              <h4 className="text-xs font-medium text-[#1F2D3D] flex items-center gap-2 mb-1">
                <span className="w-1.5 h-3 bg-[#2F6FE4] rounded-full inline-block" />
                ภาพรวมสัดส่วนกำลังพล (Proportion Overview)
              </h4>
              <p className="text-[11px] text-[#5B6B7F] font-light">
                แสดงสัดส่วนสะสมของพนักงานแต่ละสายงานในรูปของเปอร์เซ็นต์อย่างชัดเจน
              </p>
            </div>

            {/* Donut Chart Container */}
            <div className="h-44 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="85%"
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", borderColor: "#DCE6F2", fontSize: "11px" }}
                    formatter={(value: any, name: any) => [`${value.toLocaleString()} คน`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Dynamic Center Headcount Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-medium text-[#1F2D3D] tracking-tight leading-none">
                  {totalCount.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#5B6B7F] font-light mt-1">พนักงานทั้งหมด</span>
              </div>
            </div>

            {/* Premium Legend Panel */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-[#DCE6F2]/30 text-xs">
              {donutData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between min-w-0 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2ECF5]/40 rounded-lg p-1.5 transition-all duration-200">
                  <div className="flex items-center gap-1.5 min-w-0 pr-1">
                    <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] text-[#5B6B7F] font-normal truncate" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-[#1F2D3D] shrink-0">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Detailed Business Line Ranking */}
          <div className="lg:col-span-7 flex flex-col space-y-3.5">
            <div>
              <h4 className="text-xs font-medium text-[#1F2D3D] flex items-center gap-2 mb-1">
                <span className="w-1.5 h-3 bg-[#4C8DFF] rounded-full inline-block" />
                ลำดับอัตรากำลังพลตามสายงาน (Detailed Business Line Ranking)
              </h4>
              <p className="text-[11px] text-[#5B6B7F] font-light">
                เปรียบเทียบขนาดอัตราพนักงานจัดเรียงจากสูงไปต่ำ พร้อมระบุจำนวนคนและสัดส่วน ณ ปลายแถบข้อมูล และไฮไลต์ 3 สายงานหลัก
              </p>
            </div>

            {/* Custom Responsive Horizontal Bar Chart List */}
            <div className="space-y-3 max-h-[390px] overflow-y-auto pr-1">
              {businessLineChartData.map((item, index) => {
                const isTop3 = index < 3;
                
                // Color strategies
                const barColor = isTop3 
                  ? index === 0 
                    ? "bg-gradient-to-r from-[#2F6FE4]/80 to-[#2F6FE4]" 
                    : index === 1 
                      ? "bg-gradient-to-r from-[#4C8DFF]/80 to-[#4C8DFF]"
                      : "bg-gradient-to-r from-[#2DBE7F]/80 to-[#2DBE7F]"
                  : "bg-gradient-to-r from-[#E2ECF5] to-[#DCE6F2]";

                const textColorClass = isTop3 ? "text-[#1F2D3D] font-medium" : "text-[#5B6B7F] font-normal";
                const rankBg = isTop3 
                  ? index === 0 
                    ? "bg-[#2F6FE4]/10 text-[#2F6FE4] font-medium"
                    : index === 1 
                      ? "bg-[#4C8DFF]/10 text-[#4C8DFF] font-medium"
                      : "bg-[#2DBE7F]/10 text-[#2DBE7F] font-medium"
                  : "bg-slate-100 text-[#5B6B7F]";

                // Find the percentage of the max value to scale the bars nicely
                const maxVal = businessLineChartData[0]?.จำนวนคน || 1;
                const barWidthPercent = Math.max(5, (item.จำนวนคน / maxVal) * 100);

                return (
                  <div key={index} className="space-y-1 group">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 font-mono ${rankBg}`}>
                          #{index + 1}
                        </span>
                        <span className={`${textColorClass} truncate text-xs hover:text-[#2F6FE4] transition-colors`} title={item.name}>
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0 pl-2">
                        <span className="text-[10px] font-medium text-[#1F2D3D]">
                          {item.จำนวนคน.toLocaleString()} คน
                        </span>
                        <span className="text-[10px] text-[#5B6B7F] font-light bg-[#F1F5F9] px-1.5 py-0.5 rounded border border-[#E2ECF5]/50">
                          {item.เปอร์เซ็นต์}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Track and Filled Bar */}
                    <div className="w-full bg-[#F4F7FC] rounded-lg h-2.5 overflow-hidden border border-[#E2ECF5]/20 shadow-inner flex">
                      <div 
                        style={{ width: `${barWidthPercent}%` }}
                        className={`${barColor} h-full rounded-lg transition-all duration-500 group-hover:brightness-95`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* SECTION 4: Top / Bottom Units - Elegant side-by-side card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="top-bottom-units-panel">
        {/* Top Units */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#DCE6F2]/50">
            <div className="p-1.5 bg-[#2DBE7F]/8 text-[#2DBE7F] rounded-lg">
              <ArrowUpRight size={14} />
            </div>
            <div>
              <h4 className="text-xs font-medium text-[#1F2D3D]">Top 8 กลุ่มงานที่มีพนักงานปฏิบัติงานสูงสุด</h4>
              <p className="text-[10px] text-[#5B6B7F] font-light">กลุ่มงานระดับหลักซึ่งเป็นเสาหลักการทำงานในองค์กร</p>
            </div>
          </div>
          <div className="space-y-2">
            {rankingUnits.top8.map((unit, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-[#F6F9FC]/50 hover:bg-[#F6F9FC] border border-[#DCE6F2]/30 rounded-xl transition-all duration-300">
                <div className="truncate pr-4 flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#5B6B7F] w-4 text-center bg-slate-100 rounded">#{idx+1}</span>
                  <div className="truncate">
                    <span className="text-[#1F2D3D] font-medium block truncate">{unit.name}</span>
                    <span className="text-[9px] text-[#5B6B7F] block truncate font-light">{unit.line}</span>
                  </div>
                </div>
                <span className="text-[#1F2D3D] text-xs font-medium shrink-0 bg-white border border-[#DCE6F2]/60 px-2 py-0.5 rounded-md">{unit.count} คน</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Units */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#DCE6F2]/50">
            <div className="p-1.5 bg-[#FFB547]/8 text-[#FFB547] rounded-lg">
              <ArrowDownRight size={14} />
            </div>
            <div>
              <h4 className="text-xs font-medium text-[#1F2D3D]">Bottom 8 กลุ่มงานที่มีพนักงานเฉพาะกิจกระชับสุด</h4>
              <p className="text-[10px] text-[#5B6B7F] font-light">กลุ่มงานเฉพาะทางที่ขับเคลื่อนผ่านบุคลากรความเชี่ยวชาญพิเศษระดับสูง</p>
            </div>
          </div>
          <div className="space-y-2">
            {rankingUnits.bottom8.map((unit, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-[#F6F9FC]/50 hover:bg-[#F6F9FC] border border-[#DCE6F2]/30 rounded-xl transition-all duration-300">
                <div className="truncate pr-4 flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#5B6B7F] w-4 text-center bg-slate-100 rounded">#{idx+1}</span>
                  <div className="truncate">
                    <span className="text-[#1F2D3D] font-medium block truncate">{unit.name}</span>
                    <span className="text-[9px] text-[#5B6B7F] block truncate font-light">{unit.line}</span>
                  </div>
                </div>
                <span className="text-[#1F2D3D] text-xs font-medium shrink-0 bg-white border border-[#DCE6F2]/60 px-2 py-0.5 rounded-md">{unit.count} คน</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 6: Drill-down Organization Table - Fully polished */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm" id="org-drilldown-table-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-[#DCE6F2]/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#2F6FE4]/8 text-[#2F6FE4] rounded-xl shrink-0">
              <Building size={16} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#1F2D3D]">สำรวจโครงสร้างและหน่วยย่อยเชิงอันดับ (Section B: Interactive Organization Explorer)</h4>
              <p className="text-[11px] text-[#5B6B7F] mt-0.5">คลิกเลือก สายงานหลัก → กลุ่มย่อย เพื่อตรวจสอบรายชื่อฝ่ายหรือส่วนงานสนับสนุนที่ขึ้นตรงอย่างโปร่งใส</p>
            </div>
          </div>
        </div>

        <div className="border border-[#DCE6F2] rounded-xl overflow-hidden shadow-2xs">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-[#F6F9FC] text-[10px] text-[#1F2D3D] font-medium py-3 px-5 uppercase tracking-wider border-b border-[#DCE6F2]">
            <div className="col-span-8 md:col-span-9">ชื่อหน่วยงานปฏิบัติการและสายบังคับบัญชา</div>
            <div className="col-span-4 md:col-span-3 text-right pr-4">สถิติจำนวนบุคลากรปฏิบัติการ</div>
          </div>

          <div className="divide-y divide-[#DCE6F2]/50 bg-white">
            {Object.keys(drillDownLines).map((lineName) => {
              const lineData = drillDownLines[lineName];
              const isLineOpen = selectedBusinessLine === lineName;
              return (
                <div key={lineName} className="transition-all duration-300">
                  {/* Business Line Row (Level 1) */}
                  <div
                    onClick={() => handleLineClick(lineName)}
                    className={`grid grid-cols-12 py-3.5 px-5 items-center cursor-pointer transition-all duration-300 ${
                      isLineOpen 
                        ? "bg-[#2F6FE4]/4 border-l-4 border-[#2F6FE4]" 
                        : "hover:bg-[#F6F9FC]/60 border-l-4 border-transparent"
                    }`}
                  >
                    <div className="col-span-8 md:col-span-9 flex items-center gap-2.5">
                      {isLineOpen ? (
                        <ChevronDown size={15} className="text-[#2F6FE4] transition-transform duration-300" />
                      ) : (
                        <ChevronRight size={15} className="text-[#5B6B7F] hover:text-[#2F6FE4] transition-transform duration-300" />
                      )}
                      <span className="text-xs font-medium text-[#1F2D3D]">{lineName}</span>
                      <span className="inline-flex items-center justify-center whitespace-nowrap bg-[#2F6FE4]/10 text-[#2F6FE4] text-[9px] px-2 py-0.5 rounded font-medium">
                        Level 1: สายงาน
                      </span>
                    </div>
                    <div className="col-span-4 md:col-span-3 text-right pr-4">
                      <span className="text-xs text-[#2F6FE4] font-medium">{lineData.count.toLocaleString()} คน</span>
                    </div>
                  </div>

                  {/* Group Level (Level 2) */}
                  {isLineOpen && (
                    <div className="bg-[#F6F9FC]/30 pl-5 divide-y divide-[#DCE6F2]/40 border-b border-[#DCE6F2]/30">
                      {Object.keys(lineData.groups).map((groupName) => {
                        const groupData = lineData.groups[groupName];
                        const isGroupOpen = selectedGroup === groupName;
                        return (
                          <div key={groupName} className="transition-all duration-300">
                            <div
                              onClick={(e) => handleGroupClick(e, groupName)}
                              className={`grid grid-cols-12 py-2.5 px-5 items-center cursor-pointer transition-colors duration-300 ${
                                isGroupOpen 
                                  ? "bg-[#2DBE7F]/4 border-l-4 border-[#2DBE7F]" 
                                  : "hover:bg-slate-100/50 border-l-4 border-transparent"
                              }`}
                            >
                              <div className="col-span-8 md:col-span-9 flex items-center gap-2.5">
                                {isGroupOpen ? (
                                  <ChevronDown size={14} className="text-[#2DBE7F] transition-transform duration-300" />
                                ) : (
                                  <ChevronRight size={14} className="text-[#5B6B7F] hover:text-[#2DBE7F] transition-transform duration-300" />
                                )}
                                <span className="text-xs font-normal text-[#1F2D3D]">{groupName}</span>
                                <span className="inline-flex items-center justify-center whitespace-nowrap bg-[#2DBE7F]/10 text-[#2DBE7F] text-[8px] px-2 py-0.5 rounded font-medium">
                                  Level 2: กลุ่มงาน
                                </span>
                              </div>
                              <div className="col-span-4 md:col-span-3 text-right pr-4">
                                <span className="text-xs text-[#2DBE7F] font-medium">{groupData.count.toLocaleString()} คน</span>
                              </div>
                            </div>

                            {/* Department / Division Level (Level 3) */}
                            {isGroupOpen && (
                              <div className="bg-white pl-10 pr-5 py-2 divide-y divide-[#DCE6F2]/20">
                                {Object.keys(groupData.depts).map((deptName) => {
                                  const deptCount = groupData.depts[deptName];
                                  return (
                                    <div key={deptName} className="grid grid-cols-12 py-2 items-center hover:bg-slate-50/50 transition-colors">
                                      <div className="col-span-8 md:col-span-9 flex items-center gap-2 text-xs text-[#5B6B7F] pl-4">
                                        <div className="w-1.5 h-1.5 bg-[#5B6B7F]/60 rounded-full shrink-0" />
                                        <span className="font-light">{deptName.replace("ฝ่าย", "ส่วนงาน / ฝ่าย")}</span>
                                        <span className="inline-flex items-center justify-center text-[8px] text-slate-400 bg-slate-50 px-1 py-0.2 rounded border border-slate-100 uppercase scale-90">
                                          Level 3: ฝ่าย
                                        </span>
                                      </div>
                                      <div className="col-span-4 md:col-span-3 text-right pr-4">
                                        <span className="text-xs font-medium text-[#5B6B7F] bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{deptCount} คน</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
