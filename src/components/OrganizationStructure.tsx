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
  Layers, 
  GitBranch, 
  Building, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  MapPin, 
  Activity, 
  Award, 
  TrendingUp, 
  ArrowUpRight, 
  Sparkles,
  Users,
  Grid
} from "lucide-react";

interface OrganizationStructureProps {
  employees: Employee[];
}

export default function OrganizationStructure({ employees }: OrganizationStructureProps) {
  
  // Drill-down selection states
  const [selectedBusinessLine, setSelectedBusinessLine] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Strategic Planning State (Mocking projection year 2026, 2027, 2028)
  const [selectedOrgYear, setSelectedOrgYear] = useState<number>(2026);

  const totalCount = employees.length;

  // General counts & metrics
  const orgStats = useMemo(() => {
    const businessLinesSet = new Set<string>();
    const groupsSet = new Set<string>();
    const departmentsSet = new Set<string>();
    const zonesSet = new Set<string>();
    const lineCounts: Record<string, number> = {};

    employees.forEach(e => {
      if (e.businessLine) {
        businessLinesSet.add(e.businessLine);
        lineCounts[e.businessLine] = (lineCounts[e.businessLine] || 0) + 1;
      }
      if (e.group) groupsSet.add(e.group);
      if (e.department) departmentsSet.add(e.department);
      if (e.zone && e.zone !== "สำนักงานใหญ่") zonesSet.add(e.zone);
    });

    let maxLineName = "-";
    let maxLineCount = 0;
    Object.entries(lineCounts).forEach(([line, count]) => {
      if (count > maxLineCount) {
        maxLineCount = count;
        maxLineName = line;
      }
    });

    return {
      totalLines: businessLinesSet.size,
      totalGroups: groupsSet.size,
      totalDepartments: departmentsSet.size,
      totalZones: zonesSet.size || 5,
      maxLineName,
      maxLineCount
    };
  }, [employees]);

  // Year adjusted headcount modifier
  const yearAdjustedCount = useMemo(() => {
    if (selectedOrgYear === 2027) return Math.round(totalCount * 1.05); // 5% growth projection
    if (selectedOrgYear === 2028) return Math.round(totalCount * 1.11); // 11% growth projection
    return totalCount;
  }, [totalCount, selectedOrgYear]);

  // Business lines data list for graphs
  const businessLinesDataList = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(e => {
      counts[e.businessLine] = (counts[e.businessLine] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name: name.replace("สายงาน", ""),
        fullName: name,
        จำนวนคน: value,
        เปอร์เซ็นต์: totalCount > 0 ? Math.round((value / totalCount) * 100 * 10) / 10 : 0
      }))
      .sort((a, b) => b.จำนวนคน - a.จำนวนคน);
  }, [employees, totalCount]);

  // Donut chart colors
  const donutColors = [
    "#2563EB", // Royal Blue
    "#3B82F6", // Medium Blue
    "#06B6D4", // Cyan
    "#10B981", // Teal
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#F59E0B", // Amber
    "#EF4444"  // Red
  ];

  const donutChartData = useMemo(() => {
    return businessLinesDataList.map((item, idx) => ({
      name: item.name,
      value: item.จำนวนคน,
      percentage: item.เปอร์เซ็นต์,
      color: donutColors[idx % donutColors.length]
    }));
  }, [businessLinesDataList]);

  // Top & Bottom group units (Departments/Groups size ranking)
  const groupRankings = useMemo(() => {
    const counts: Record<string, { line: string; count: number }> = {};
    employees.forEach(e => {
      if (!counts[e.group]) {
        counts[e.group] = { line: e.businessLine, count: 0 };
      }
      counts[e.group].count += 1;
    });

    const sorted = Object.entries(counts)
      .map(([groupName, info]) => ({
        name: groupName,
        line: info.line,
        count: info.count
      }))
      .sort((a, b) => b.count - a.count);

    return {
      topList: sorted.slice(0, 6),
      bottomList: [...sorted].reverse().slice(0, 6)
    };
  }, [employees]);

  // Structured Drill-down data builder
  const drillDownModel = useMemo(() => {
    const map: Record<string, {
      count: number;
      groups: Record<string, {
        count: number;
        departments: Record<string, number>;
      }>;
    }> = {};

    employees.forEach(e => {
      const line = e.businessLine;
      const grp = e.group;
      const dept = e.department;

      if (!map[line]) {
        map[line] = { count: 0, groups: {} };
      }
      map[line].count++;

      if (!map[line].groups[grp]) {
        map[line].groups[grp] = { count: 0, departments: {} };
      }
      map[line].groups[grp].count++;

      if (!map[line].groups[grp].departments[dept]) {
        map[line].groups[grp].departments[dept] = 0;
      }
      map[line].groups[grp].departments[dept]++;
    });

    return map;
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

  const handleGroupClick = (groupName: string) => {
    if (selectedGroup === groupName) {
      setSelectedGroup(null);
    } else {
      setSelectedGroup(groupName);
    }
  };

  return (
    <div className="space-y-6">

      {/* Dynamic strategic planning bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[28px] p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Abstract design elements */}
        <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-white/5 -mr-8 -mt-8" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 rounded-full bg-blue-500/10 -ml-8 -mb-20" />

        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-white/15 text-white text-[10px] px-2.5 py-0.5 rounded-full border border-white/10 font-sans tracking-wide">
              STRATEGIC FORECAST
            </span>
            <span className="flex items-center gap-1 text-[10px] text-teal-300">
              <Sparkles size={11} />
              <span>เครื่องมือคาดการณ์</span>
            </span>
          </div>
          <h2 className="text-base font-medium text-white tracking-tight">
            การวางแผนอัตรากำลังพลเชิงยุทธศาสตร์สถาบัน (Strategic Workforce Projection)
          </h2>
          <p className="text-[11px] text-blue-100 font-light max-w-2xl leading-relaxed">
            เลือกปีคาดการณ์การเติบโตเป้าหมายสินเชื่อของ SME D Bank เพื่อคำนวณและวางระบบบริหารองค์กร อิงเป้าหมายขยายตัวเฉลี่ย +5% ต่อปี
          </p>
        </div>

        {/* Year Selectors */}
        <div className="flex items-center gap-2 z-10">
          {[
            { year: 2026, label: "ปัจจุบัน (2569)", desc: "กำลังพลจริง 2,182 คน" },
            { year: 2027, label: "คาดการณ์ (2570)", desc: "เป้าหมายขยายตัว +5%" },
            { year: 2028, label: "คาดการณ์ (2571)", desc: "เป้าหมายขยายตัว +11%" }
          ].map((item) => (
            <button
              key={item.year}
              onClick={() => setSelectedOrgYear(item.year)}
              className={`text-left p-3 rounded-2xl transition-all border cursor-pointer shrink-0 min-w-[120px] ${
                selectedOrgYear === item.year
                  ? "bg-white text-slate-800 border-transparent shadow-md"
                  : "bg-white/10 text-white border-white/10 hover:bg-white/15"
              }`}
            >
              <p className="text-[11px] font-medium leading-tight">{item.label}</p>
              <p className={`text-[9px] mt-0.5 font-light ${selectedOrgYear === item.year ? "text-slate-500" : "text-blue-100"}`}>
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bento Grid Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">โครงสร้างสายงานหลัก</p>
            <p className="text-lg font-medium text-slate-800 tracking-tight">{orgStats.totalLines} สายงาน</p>
            <p className="text-[9px] text-slate-500 font-light mt-0.5">ครอบคลุมทุกงานสถาบัน</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <GitBranch size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">ส่วนงานและสำนัก</p>
            <p className="text-lg font-medium text-slate-800 tracking-tight">{orgStats.totalGroups} ฝ่ายงาน</p>
            <p className="text-[9px] text-slate-500 font-light mt-0.5">รวมกลุ่มงานปฏิบัติการ</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl shrink-0">
            <Building size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">ส่วนเขตบริการ / เขตสาขา</p>
            <p className="text-lg font-medium text-slate-800 tracking-tight">{orgStats.totalZones} เขต</p>
            <p className="text-[9px] text-slate-500 font-light mt-0.5">ขอบเขตบริการทั่วประเทศ</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">ประมาณกำลังคนปี {selectedOrgYear}</p>
            <p className="text-lg font-medium text-purple-700 tracking-tight">{yearAdjustedCount.toLocaleString()} คน</p>
            <p className="text-[9px] text-slate-500 font-light mt-0.5">
              {selectedOrgYear === 2026 ? "จำนวนกำลังพลจริง" : "เป้าหมายจ้างงานเชิงรุก"}
            </p>
          </div>
        </div>

      </div>

      {/* Charts section: Donut & Line headcount distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Main distribution Recharts Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-medium text-slate-800 pb-3 border-b border-slate-100">
              สัดส่วนบุคลากรตามกลุ่มสายงาน (Workforce Portion)
            </h3>
            
            <div className="h-[200px] w-full mt-6 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {donutChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ fontSize: 10, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    formatter={(value: any) => [`${value.toLocaleString()} คน`]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Central text indicator */}
              <div className="absolute text-center">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-light">กำลังพลวิเคราะห์</p>
                <p className="text-xl font-sans font-medium text-slate-800">{totalCount.toLocaleString()}</p>
                <p className="text-[9px] text-slate-500 font-light">คน</p>
              </div>
            </div>

            {/* Legends list */}
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-slate-50 pt-4">
              {donutChartData.slice(0, 8).map((d, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-500 font-light truncate" title={d.name}>{d.name}</span>
                  <span className="text-slate-700 font-medium ml-auto font-mono">{d.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-light mt-5 pt-3 border-t border-slate-50">
            * สถิติอิงข้อมูลกำลังพลล่าสุดของระบบสารสนเทศ
          </div>
        </div>

        {/* Right Card: Bento Progress Rankings (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-medium text-slate-800 pb-3 border-b border-slate-100">
              การจัดลำดับขนาดอัตรากำลังคนของฝ่ายงานย่อย (Headcount Ranking)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
              
              {/* Column 1: Top units */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                  <TrendingUp size={14} />
                  <span className="text-[11px] uppercase tracking-wider">ฝ่ายที่มีบุคลากรหนาแน่นสูงสุด</span>
                </div>
                
                <div className="space-y-2.5">
                  {groupRankings.topList.map((unit, idx) => {
                    const percent = Math.round((unit.count / 300) * 100);
                    return (
                      <div key={idx} className="p-2 bg-slate-50/50 rounded-xl border border-slate-100/30">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-slate-800 font-medium truncate max-w-[150px]">{unit.name}</span>
                          <span className="font-mono text-blue-600 font-semibold">{unit.count} คน</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                        <p className="text-[8px] text-slate-400 font-light truncate mt-1">{unit.line}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Bottom units */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-1.5 text-orange-600 font-medium">
                  <Activity size={14} />
                  <span className="text-[11px] uppercase tracking-wider">ฝ่ายที่มีขนาดอัตรากำลังกระชับ</span>
                </div>
                
                <div className="space-y-2.5">
                  {groupRankings.bottomList.map((unit, idx) => {
                    const percent = Math.max(8, Math.round((unit.count / 300) * 100));
                    return (
                      <div key={idx} className="p-2 bg-slate-50/50 rounded-xl border border-slate-100/30">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-slate-800 font-medium truncate max-w-[150px]">{unit.name}</span>
                          <span className="font-mono text-orange-600 font-semibold">{unit.count} คน</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                        <p className="text-[8px] text-slate-400 font-light truncate mt-1">{unit.line}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-light mt-5 pt-3 border-t border-slate-50">
            ฝ่ายที่มีกำลังคนน้อยเป็นผลลัพธ์จากการออกแบบอัตรางานแบบกระจายอำนาจบริการ
          </div>
        </div>

      </div>

      {/* Interactive Breadcrumb Tree Drill-Down Directory */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
        
        <div className="pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <Grid size={15} className="text-blue-600" />
            <h3 className="text-xs font-medium text-slate-800">
              สำรวจทำเนียบโครงสร้างจำแนกสายงาน (Interactive Org Directory Explorer)
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-light">
            คลิกเลือกสายงานหลัก และขยายกลุ่มเพื่อตรวจดูรายชื่อส่วนงาน/ฝ่ายงานพร้อมจำนวนอัตรากำลังคนจริงที่ปฏิบัติงานภายในสถาบัน
          </p>
        </div>

        {/* Directory Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs">
          
          {/* Level 1: Business Lines (5 cols) */}
          <div className="md:col-span-5 border border-slate-100 rounded-2xl p-4 space-y-2 max-h-[360px] overflow-y-auto bg-slate-50/30">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium block mb-2">สายงานหลัก (Business Lines)</span>
            
            {Object.keys(drillDownModel).map((lineName) => {
              const isSelected = selectedBusinessLine === lineName;
              return (
                <button
                  key={lineName}
                  onClick={() => handleLineClick(lineName)}
                  className={`w-full p-3.5 text-left rounded-xl transition-all border flex items-center justify-between cursor-pointer group ${
                    isSelected 
                      ? "bg-slate-800 text-white border-transparent shadow-xs" 
                      : "bg-white border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-800 group-hover:text-slate-950 transition-colors" style={{ color: isSelected ? "white" : "" }}>
                      {lineName}
                    </p>
                    <p className={`text-[9px] font-light mt-0.5 ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>
                      {drillDownModel[lineName].count} อัตราตำแหน่ง
                    </p>
                  </div>
                  <ChevronRight size={14} className={`transition-transform ${isSelected ? "rotate-90 text-white" : "text-slate-400"}`} />
                </button>
              );
            })}
          </div>

          {/* Level 2: Groups (4 cols) */}
          <div className="md:col-span-4 border border-slate-100 rounded-2xl p-4 space-y-2 max-h-[360px] overflow-y-auto bg-slate-50/30">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium block mb-2">กลุ่มงานและฝ่าย (Division Groups)</span>
            
            {!selectedBusinessLine ? (
              <div className="h-[260px] flex flex-col items-center justify-center text-center text-slate-400 font-light p-4">
                <Activity size={18} className="text-slate-300 mb-2" />
                <p className="text-[11px]">กรุณาเลือกสายงานหลักซ้ายมือ เพื่อขยายรายชื่อฝ่ายงานย่อย</p>
              </div>
            ) : (
              <div className="space-y-2">
                {Object.keys(drillDownModel[selectedBusinessLine].groups).map((groupName) => {
                  const isSelected = selectedGroup === groupName;
                  const item = drillDownModel[selectedBusinessLine].groups[groupName];
                  return (
                    <button
                      key={groupName}
                      onClick={() => handleGroupClick(groupName)}
                      className={`w-full p-3.5 text-left rounded-xl transition-all border flex items-center justify-between cursor-pointer group ${
                        isSelected 
                          ? "bg-blue-600 text-white border-transparent" 
                          : "bg-white border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-slate-800 group-hover:text-slate-950 transition-colors" style={{ color: isSelected ? "white" : "" }}>
                          {groupName}
                        </p>
                        <p className={`text-[9px] font-light mt-0.5 ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                          {item.count} อัตรากำลังพล
                        </p>
                      </div>
                      <ChevronDown size={14} className={`transition-transform ${isSelected ? "rotate-180 text-white" : "text-slate-400"}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Level 3: Departments & units list (3 cols) */}
          <div className="md:col-span-3 border border-slate-100 rounded-2xl p-4 space-y-2 max-h-[360px] overflow-y-auto bg-slate-50/30">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium block mb-2">ส่วนงานปฏิบัติการย่อย (Departments)</span>
            
            {!selectedGroup ? (
              <div className="h-[260px] flex flex-col items-center justify-center text-center text-slate-400 font-light p-4">
                <MapPin size={18} className="text-slate-300 mb-2" />
                <p className="text-[11px]">เลือกกลุ่มงานและฝ่าย เพื่อแจกแจงรายชื่อส่วนปฏิบัติการย่อย</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(drillDownModel[selectedBusinessLine!].groups[selectedGroup].departments).map(([deptName, count]) => (
                  <div 
                    key={deptName} 
                    className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between shadow-3xs"
                  >
                    <div>
                      <p className="font-medium text-slate-800 leading-normal">{deptName}</p>
                      <p className="text-[8px] text-slate-400 font-light uppercase tracking-wider mt-0.5">SME D BANK DEPT</p>
                    </div>
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-semibold px-2 py-1 rounded-md">
                      {count} คน
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
