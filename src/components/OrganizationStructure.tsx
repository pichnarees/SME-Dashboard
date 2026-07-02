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
  Pie,
  Legend
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
  Grid,
  ShieldAlert,
  UserCheck,
  Calendar,
  Briefcase,
  Hourglass,
  Check,
  Info
} from "lucide-react";

interface OrganizationStructureProps {
  employees: Employee[];
}

export default function OrganizationStructure({ employees }: OrganizationStructureProps) {
  
  // Drill-down selection states
  const [selectedBusinessLine, setSelectedBusinessLine] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Strategic Planning State (Calendar year 2026, 2027, 2028, 2029)
  const [selectedOrgYear, setSelectedOrgYear] = useState<number>(2026);

  // DYNAMIC COMPONENT STATE AGER: Ages employees realistically based on chosen year
  const yearFilteredEmployees = useMemo(() => {
    const yearDiff = selectedOrgYear - 2026;
    if (yearDiff === 0) return employees;
    return employees.map(emp => {
      const aged = emp.age + yearDiff;
      const agedTenure = emp.tenure + yearDiff;
      
      // Let's also predictively adjust succession statuses: as time passes, some "Ready 1-2 Years" become "Ready Now"
      let adjustedSuccession = emp.successionStatus;
      if (yearDiff >= 2 && emp.successionStatus === "Ready 1-2 Years") {
        adjustedSuccession = "Ready Now";
      }
      
      return {
        ...emp,
        age: aged,
        tenure: agedTenure,
        successionStatus: adjustedSuccession
      };
    });
  }, [employees, selectedOrgYear]);

  const totalCount = yearFilteredEmployees.length;

  // General counts & metrics computed on aged employees
  const orgStats = useMemo(() => {
    const businessLinesSet = new Set<string>();
    const groupsSet = new Set<string>();
    const departmentsSet = new Set<string>();
    const zonesSet = new Set<string>();
    const lineCounts: Record<string, number> = {};

    yearFilteredEmployees.forEach(e => {
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
  }, [yearFilteredEmployees]);

  // Retirement aged group list (age >= 55) sorted closest to 60 (retirement)
  const retirementCohort = useMemo(() => {
    return yearFilteredEmployees
      .filter(e => e.age >= 55)
      .map(e => {
        const yearsToRetire = Math.max(0, 60 - e.age);
        const retireYear = selectedOrgYear + yearsToRetire;
        return {
          ...e,
          yearsToRetire,
          retireYear
        };
      })
      .sort((a, b) => b.age - a.age); // Older people first
  }, [yearFilteredEmployees, selectedOrgYear]);

  // Employee level pyramid calculation
  const pyramidBands = useMemo(() => {
    let executiveCount = 0; // L9 - L11
    let middleCount = 0;    // L6 - L8
    let juniorCount = 0;    // L4 - L5
    let professionalCount = 0; // L1 - L3

    yearFilteredEmployees.forEach(e => {
      const lvlStr = e.level.replace(/[^0-9]/g, "");
      const lvl = parseInt(lvlStr) || 1;
      if (lvl >= 9) executiveCount++;
      else if (lvl >= 6) middleCount++;
      else if (lvl >= 4) juniorCount++;
      else professionalCount++;
    });

    const maxVal = Math.max(executiveCount, middleCount, juniorCount, professionalCount, 1);

    return [
      { bandName: "ระดับบริหารระดับสูง (L9-L11)", count: executiveCount, percent: Math.round((executiveCount / totalCount) * 100), widthPercent: Math.max(15, Math.round((executiveCount / maxVal) * 100)), color: "from-indigo-600 to-violet-600", text: "Apex Layer" },
      { bandName: "ผู้จัดการและหัวหน้าฝ่าย (L6-L8)", count: middleCount, percent: Math.round((middleCount / totalCount) * 100), widthPercent: Math.max(30, Math.round((middleCount / maxVal) * 100)), color: "from-blue-600 to-indigo-600", text: "Management" },
      { bandName: "หัวหน้างานและเจ้าหน้าที่อาวุโส (L4-L5)", count: juniorCount, percent: Math.round((juniorCount / totalCount) * 100), widthPercent: Math.max(45, Math.round((juniorCount / maxVal) * 100)), color: "from-teal-500 to-emerald-600", text: "Senior Professional" },
      { bandName: "เจ้าหน้าที่ปฏิบัติการ (L1-L3)", count: professionalCount, percent: Math.round((professionalCount / totalCount) * 100), widthPercent: 100, color: "from-cyan-500 to-blue-500", text: "Professional Base" }
    ];
  }, [yearFilteredEmployees, totalCount]);

  // Succession counts
  const successionStats = useMemo(() => {
    let readyNow = 0;
    let readySoon = 0; // 1-2 Years
    let risk = 0;
    let noSuccessor = 0;

    yearFilteredEmployees.forEach(e => {
      // Look at high level roles only L9-L11 for succession
      const lvlStr = e.level.replace(/[^0-9]/g, "");
      const lvl = parseInt(lvlStr) || 1;
      if (lvl >= 9) {
        if (e.successionStatus === "Ready Now") readyNow++;
        else if (e.successionStatus === "Ready 1-2 Years") readySoon++;
        else if (e.successionStatus === "Risk") risk++;
        else noSuccessor++;
      }
    });

    const totalKeyRoles = readyNow + readySoon + risk + noSuccessor || 1;

    return {
      readyNow,
      readySoon,
      risk,
      noSuccessor,
      totalKeyRoles,
      readyNowPct: Math.round((readyNow / totalKeyRoles) * 100),
      readySoonPct: Math.round((readySoon / totalKeyRoles) * 100),
      riskPct: Math.round((risk / totalKeyRoles) * 100),
      noSuccessorPct: Math.round((noSuccessor / totalKeyRoles) * 100)
    };
  }, [yearFilteredEmployees]);

  // Chart data for succession donut
  const successionChartData = useMemo(() => {
    return [
      { name: "พร้อมปฏิบัติทันที", value: successionStats.readyNow, color: "#10B981" },
      { name: "พร้อมใน 1-2 ปี", value: successionStats.readySoon, color: "#3B82F6" },
      { name: "มีความเสี่ยงขาดแคลน", value: successionStats.risk, color: "#F59E0B" },
      { name: "ไม่มีผู้สืบทอด", value: successionStats.noSuccessor, color: "#EF4444" }
    ].filter(d => d.value > 0);
  }, [successionStats]);

  // Business lines data list for directory matching
  const businessLinesDataList = useMemo(() => {
    const counts: Record<string, number> = {};
    yearFilteredEmployees.forEach(e => {
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
  }, [yearFilteredEmployees, totalCount]);

  // Structured Drill-down data builder
  const drillDownModel = useMemo(() => {
    const map: Record<string, {
      count: number;
      groups: Record<string, {
        count: number;
        departments: Record<string, number>;
      }>;
    }> = {};

    yearFilteredEmployees.forEach(e => {
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
  }, [yearFilteredEmployees]);

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

  // Standardized KPI Cards mapping (matching ExecutiveOverview tab style perfectly!)
  const standardizedKpiCards = [
    {
      id: "headcount",
      title: `กำลังพลคาดการณ์ (ปี ${selectedOrgYear})`,
      subtitle: "Projected Headcount",
      value: totalCount,
      percent: "100%",
      badge: "อิงตามเป้าหมายปีปฏิทิน",
      gradient: "from-blue-500/10 to-indigo-500/10",
      icon: <Users size={18} className="text-blue-600" />,
      colorClass: "text-blue-600"
    },
    {
      id: "retirement",
      title: "พนักงานอายุ 55 ปีขึ้นไป",
      subtitle: "Near Retirement Risk",
      value: retirementCohort.length,
      percent: `${Math.round((retirementCohort.length / (totalCount || 1)) * 100)}%`,
      badge: "กลุ่มเฝ้าระวังการทดแทน",
      gradient: "from-rose-500/10 to-pink-500/10",
      icon: <ShieldAlert size={18} className="text-rose-600" />,
      colorClass: "text-rose-600"
    },
    {
      id: "succession",
      title: "ความพร้อมสืบทอด (Ready Now)",
      subtitle: "Succession Security",
      value: successionStats.readyNow,
      percent: `${successionStats.readyNowPct}%`,
      badge: "ผู้บริหารสืบทอดพร้อมทันที",
      gradient: "from-purple-500/10 to-violet-500/10",
      icon: <UserCheck size={18} className="text-purple-600" />,
      colorClass: "text-purple-600"
    },
    {
      id: "middle_mgmt",
      title: "ผู้จัดการยุทธศาสตร์ (L6-L8)",
      subtitle: "Strategic Middle Managers",
      value: pyramidBands[1].count,
      percent: `${pyramidBands[1].percent}%`,
      badge: "แกนหลักประสานกลยุทธ์",
      gradient: "from-teal-500/10 to-emerald-500/10",
      icon: <Briefcase size={18} className="text-teal-600" />,
      colorClass: "text-teal-600"
    }
  ];

  return (
    <div className="space-y-6">

      {/* Dynamic strategic planning bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[28px] p-6 text-white shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-5 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-white/5 -mr-8 -mt-8" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 rounded-full bg-blue-500/10 -ml-8 -mb-20" />

        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-white/15 text-white text-[10px] px-2.5 py-0.5 rounded-full border border-white/10 font-sans tracking-wide">
              STRATEGIC CALENDAR YEAR SELECTOR
            </span>
            <span className="flex items-center gap-1 text-[10px] text-teal-300 font-medium">
              <Sparkles size={11} className="animate-pulse" />
              <span>คาดการณ์ผลกระทบองค์กรรายปีปฏิทิน</span>
            </span>
          </div>
          <h2 className="text-base font-medium text-white tracking-tight">
            สลับปีปฏิทินเพื่อวิเคราะห์โครงสร้างองค์กรล่วงหน้า (Workforce Year Selection)
          </h2>
          <p className="text-[11px] text-blue-100 font-light max-w-2xl leading-relaxed">
            เลือกปีปฏิทินเพื่อทดสอบจำลองภาวะอายุกำลังพลเกษียณ (Aged Retirement) ความพร้อมผู้สืบทอดอัตโนมัติตามระยะทางเวลา
          </p>
        </div>

        {/* Year Selectors */}
        <div className="flex flex-wrap items-center gap-2 z-10">
          {[
            { year: 2026, label: "2569 (ปัจจุบัน)", desc: "สถิติจริงกำลังคนปัจจุบัน" },
            { year: 2027, label: "2570 (+1 ปี)", desc: "คำนวณอายุพนักงานเพิ่ม 1 ปี" },
            { year: 2028, label: "2571 (+2 ปี)", desc: "คำนวณอายุพนักงานเพิ่ม 2 ปี" },
            { year: 2029, label: "2572 (+3 ปี)", desc: "คำนวณจำลองสิทธิ์เกษียณล่วงหน้า" }
          ].map((item) => {
            const isSelected = selectedOrgYear === item.year;
            return (
              <button
                key={item.year}
                onClick={() => {
                  setSelectedOrgYear(item.year);
                  // Reset select directory tree to avoid mismatch
                  setSelectedBusinessLine(null);
                  setSelectedGroup(null);
                }}
                className={`text-left p-3 rounded-2xl transition-all border cursor-pointer shrink-0 min-w-[130px] ${
                  isSelected
                    ? "bg-white text-slate-800 border-transparent shadow-md shadow-blue-900/15 ring-2 ring-blue-500/10"
                    : "bg-white/10 text-white border-white/10 hover:bg-white/15"
                }`}
              >
                <p className="text-[11px] font-medium leading-tight">{item.label}</p>
                <p className={`text-[9px] mt-0.5 font-light ${isSelected ? "text-slate-500" : "text-blue-100"}`}>
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Standardized KPI Row matching ExecutiveOverview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
            <h2 className="text-sm font-medium text-slate-800 tracking-tight">
              ตัวบ่งชี้ประสิทธิภาพโครงสร้างกำลังพลและแผนผู้สืบทอด (Standard KPIs - ปี {selectedOrgYear})
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-light">
            <Info size={11} />
            <span>ข้อมูลผันแปรตามสภาวะอายุล่วงหน้าของปีที่เลือก</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {standardizedKpiCards.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-100/90 shadow-xs hover:shadow-md text-left p-4.5 rounded-[22px] relative overflow-hidden group transition-all duration-300"
            >
              {/* Decorative background glow */}
              <div className="absolute -right-6 -bottom-6 w-16 h-16 rounded-full opacity-10 bg-blue-600 text-blue-600" />
              
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-500 group-hover:bg-slate-100 shrink-0">
                  {item.icon}
                </div>
                <span className="text-[9.5px] font-sans font-medium bg-slate-50 text-slate-400 border border-slate-200/30 px-2 py-0.5 rounded-full uppercase">
                  KPI
                </span>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-medium tracking-wide uppercase text-slate-400">
                  {item.title}
                </p>
                <p className="text-[9px] font-light text-slate-400 truncate">
                  {item.subtitle}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-sans font-medium tracking-tight text-slate-800">
                    {item.value.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    ({item.percent})
                  </span>
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-slate-50 flex items-center justify-between text-[9px] text-slate-400 font-light">
                <span>{item.badge}</span>
                <span className="font-mono text-blue-600 font-medium">SME D Bank</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RESTRUCTURED 3-COLUMN WORKSPACE AREA */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Retirement Employee Table (xl:col-span-4) */}
        <div className="xl:col-span-4 bg-white/95 backdrop-blur-md rounded-[28px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[10px] font-medium text-rose-600 uppercase tracking-wide">
                    รายชื่อผู้เตรียมเกษียณอายุ (Retirement Watchlist)
                  </span>
                </div>
                <h3 className="text-xs font-medium text-slate-800 mt-0.5">
                  พนักงานที่มีความเสี่ยงเกษียณ (อายุ 55-60 ปี) ณ ปี {selectedOrgYear}
                </h3>
              </div>
              <span className="text-[9.5px] font-sans bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-0.5 rounded-full">
                {retirementCohort.length} รายการ
              </span>
            </div>

            {/* List Table Container */}
            {retirementCohort.length === 0 ? (
              <div className="h-[280px] flex flex-col items-center justify-center text-center text-slate-400 p-6">
                <ShieldAlert size={22} className="text-slate-300 mb-2" />
                <p className="text-xs">ไม่พบข้อมูลผู้เตรียมเกษียณอายุในช่วงเวลาปีปฏิทินป้อนเข้า</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {retirementCohort.slice(0, 15).map((emp, index) => (
                  <div 
                    key={emp.empId}
                    className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5 max-w-[65%]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-800">{emp.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono">({emp.level})</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{emp.department}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="font-medium text-slate-700 font-mono">{emp.age}</span>
                        <span className="text-[9px] text-slate-400">ปี</span>
                      </div>
                      <div className="text-[9px] text-rose-600 font-light">
                        {emp.yearsToRetire === 0 
                          ? "เกษียณสิ้นปีนี้!" 
                          : `เกษียณในอีก ${emp.yearsToRetire} ปี (${emp.retireYear})`}
                      </div>
                    </div>
                  </div>
                ))}
                {retirementCohort.length > 15 && (
                  <p className="text-center text-[9px] text-slate-400 pt-2 font-light">
                    แสดงเฉพาะ 15 รายงานอาวุโสสูงสุด... ขยายดูที่รายงานความเสี่ยงกำลังคนหลัก
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="text-[9.5px] text-slate-400 font-light mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-1.5">
            <Info size={11} />
            <span>พยากรณ์อ้างอิงอายุเกษียณภาคบังคับที่ 60 ปีถ้วน</span>
          </div>
        </div>

        {/* CENTER COLUMN: Employee Level Pyramid Chart (xl:col-span-4) */}
        <div className="xl:col-span-4 bg-white/95 backdrop-blur-md rounded-[28px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-blue-50 text-blue-600 rounded-md shrink-0">
                  <Layers size={13} />
                </div>
                <span className="text-[10px] font-medium text-blue-600 uppercase tracking-wide">
                  พีระมิดระดับชั้นกำลังพล (Employee Level Pyramid)
                </span>
              </div>
              <h3 className="text-xs font-medium text-slate-800 mt-0.5">
                สัดส่วนโครงสร้างสายงานแยกตามระดับชั้นประเมินปี {selectedOrgYear}
              </h3>
            </div>

            {/* Pyramid visual layers stack */}
            <div className="space-y-4 mt-6">
              {pyramidBands.map((band, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{band.bandName}</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-semibold text-slate-900">{band.count} คน</span>
                      <span className="text-slate-400">({band.percent}%)</span>
                    </div>
                  </div>

                  {/* Centered progressive bar */}
                  <div className="flex justify-center w-full bg-slate-50 p-1 rounded-xl">
                    <div className="w-full bg-slate-100/50 h-6.5 rounded-lg overflow-hidden relative flex items-center justify-center">
                      {/* Interactive progress filler */}
                      <div 
                        className={`h-full absolute left-0 bg-gradient-to-r ${band.color} opacity-85 transition-all duration-500`}
                        style={{ width: `${band.widthPercent}%` }}
                      />
                      {/* Label text inside pyramid */}
                      <span className="z-10 text-[10px] font-medium text-slate-800 drop-shadow-xs flex items-center gap-1">
                        <span className="opacity-80">{band.text}:</span>
                        <span>{band.widthPercent}%</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[9.5px] text-slate-400 font-light mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-1">
            <Check size={11} className="text-emerald-500" />
            <span>โครงสร้างกำลังพลสมมาตรเชิงเสถียรภาพสถาบันการเงิน</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Succession Plan / Successor Readiness (xl:col-span-4) */}
        <div className="xl:col-span-4 bg-white/95 backdrop-blur-md rounded-[28px] border border-slate-100 p-6 shadow-sm flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wide">
                    ความพร้อมสืบทอดตำแหน่งหลัก (Succession Plan)
                  </span>
                </div>
                <h3 className="text-xs font-medium text-slate-800 mt-0.5">
                  สถานะการเตรียมผู้นำสำรองตำแหน่งบริหาร (L9-L11)
                </h3>
              </div>
              <span className="text-[9px] font-sans font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">
                Successor Chart
              </span>
            </div>

            {/* Recharts Pie Chart & statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mt-2 items-center">
              
              {/* Succession Donut chart (sm:col-span-5) */}
              <div className="sm:col-span-5 h-[130px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={successionChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {successionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 9, borderRadius: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Central headcount display */}
                <div className="absolute text-center">
                  <p className="text-[8px] uppercase text-slate-400">ตำแหน่งหลัก</p>
                  <p className="text-sm font-sans font-medium text-slate-800">{successionStats.totalKeyRoles}</p>
                  <p className="text-[8px] text-slate-400">อัตรา</p>
                </div>
              </div>

              {/* Stat breakdowns (sm:col-span-7) */}
              <div className="sm:col-span-7 space-y-2 pl-2">
                {[
                  { name: "พร้อมปฏิบัติทันที (Ready Now)", value: successionStats.readyNow, pct: successionStats.readyNowPct, colorClass: "text-emerald-500 border-emerald-500/10", dotColor: "bg-emerald-500" },
                  { name: "พร้อมใน 1-2 ปี", value: successionStats.readySoon, pct: successionStats.readySoonPct, colorClass: "text-blue-500 border-blue-500/10", dotColor: "bg-blue-500" },
                  { name: "ความเสี่ยงขาดแคลน (Risk)", value: successionStats.risk, pct: successionStats.riskPct, colorClass: "text-amber-500 border-amber-500/10", dotColor: "bg-amber-500" },
                  { name: "ไม่มีผู้สืบทอด (No Successor)", value: successionStats.noSuccessor, pct: successionStats.noSuccessorPct, colorClass: "text-rose-500 border-rose-500/10", dotColor: "bg-rose-500" }
                ].map((item, idx) => (
                  <div key={idx} className="p-1.5 bg-slate-50/50 rounded-lg border border-slate-100/30 text-[10px] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`} />
                      <span className="text-slate-600 truncate">{item.name}</span>
                    </div>
                    <span className="font-medium text-slate-800 font-mono">{item.value} คน ({item.pct}%)</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Quick alert bar inside Succession plan */}
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-700 flex items-start gap-1.5 leading-relaxed">
              <ShieldAlert size={14} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-semibold">ข้อเสนอแนะฝ่ายจัดการ:</span> มีความเสี่ยงขาดแคลนผู้สืบทอด {successionStats.risk} ตำแหน่ง และไม่มีผู้บริหารสำรองเลยอีก {successionStats.noSuccessor} ตำแหน่ง ควรผลักดันให้ดำเนินโครงการพัฒนาเร่งด่วน!
              </div>
            </div>

          </div>

          <div className="text-[9.5px] text-slate-400 font-light mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
            <span>SME D Bank Leadership Pipeline</span>
            <span className="text-blue-600 font-mono text-[9px]">เป้าหมาย Readiness &gt; 70%</span>
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
            คลิกเลือกสายงานหลัก และขยายกลุ่มเพื่อตรวจดูรายชื่อส่วนงาน/ฝ่ายงานพร้อมจำนวนอัตรากำลังคนจริงที่ปฏิบัติงานภายในสถาบัน ณ ปี {selectedOrgYear}
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
