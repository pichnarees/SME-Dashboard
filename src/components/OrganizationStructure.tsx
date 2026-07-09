/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import { Employee } from "../data/mockData";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import {
  Activity,
  Award,
  Briefcase,
  Building,
  Calendar,
  ChevronRight,
  Grid,
  Hourglass,
  Layers,
  MapPin,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

import SectionHeader from "./SectionHeader";

interface OrganizationStructureProps {
  employees: Employee[];
}

type OrgDrillDownModel = Record<
  string,
  {
    count: number;
    groups: Record<
      string,
      {
        count: number;
        departments: Record<string, number>;
      }
    >;
  }
>;

const getLevelNumber = (level: string) => {
  const levelNumber = parseInt(level.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(levelNumber) ? levelNumber : 1;
};

const formatNumber = (value: number) => value.toLocaleString("th-TH");

const MetricCard = ({
  title,
  subtitle,
  value,
  percent,
  icon,
  accent,
  selected,
  onClick,
}: {
  title: string;
  subtitle: string;
  value: number;
  percent: string;
  icon: React.ReactNode;
  accent: "blue" | "rose" | "emerald" | "violet" | "amber";
  selected?: boolean;
  onClick?: () => void;
}) => {
  const accentStyles = {
    blue: "from-blue-500 to-indigo-500 text-blue-600 bg-blue-50 border-blue-100",
    rose: "from-rose-500 to-pink-500 text-rose-600 bg-rose-50 border-rose-100",
    emerald: "from-emerald-500 to-teal-500 text-emerald-600 bg-emerald-50 border-emerald-100",
    violet: "from-violet-500 to-purple-500 text-violet-600 bg-violet-50 border-violet-100",
    amber: "from-amber-500 to-orange-500 text-amber-600 bg-amber-50 border-amber-100",
  }[accent];

  const [gradient, , textColor, bgColor, borderColor] = accentStyles.split(" ");
  const gradientTo = accentStyles.split(" ")[1];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[24px] border bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        selected ? "border-blue-300 ring-4 ring-blue-100" : "border-slate-100"
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient} ${gradientTo}`} />
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${bgColor} ${textColor} border ${borderColor}`}>
          {icon}
        </div>
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
          {percent}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-[11px] font-medium leading-snug text-slate-500">{title}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[28px] font-medium leading-none text-slate-900">
            {formatNumber(value)}
          </span>
          <span className="text-[11px] font-light text-slate-400">คน</span>
        </div>
        <p className="mt-2 line-clamp-2 text-[10px] font-light leading-relaxed text-slate-500">
          {subtitle}
        </p>
      </div>
    </button>
  );
};

export default function OrganizationStructure({ employees }: OrganizationStructureProps) {
  const [selectedBusinessLine, setSelectedBusinessLine] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedOrgYear, setSelectedOrgYear] = useState<number>(2026);
  const [selectedMetric, setSelectedMetric] = useState<string>("headcount");

  const yearFilteredEmployees = useMemo(() => {
    const yearDiff = selectedOrgYear - 2026;
    if (yearDiff === 0) return employees;

    return employees.map((emp) => {
      let adjustedSuccession: Employee["successionStatus"] = emp.successionStatus;

      if (yearDiff >= 2 && emp.successionStatus === "Ready 1-2 Years") {
        adjustedSuccession = "Ready Now";
      }

      if (yearDiff >= 3 && emp.successionStatus === "Ready 3-5 Years") {
        adjustedSuccession = "Ready 1-2 Years";
      }

      return {
        ...emp,
        age: emp.age + yearDiff,
        tenure: emp.tenure + yearDiff,
        successionStatus: adjustedSuccession,
      };
    });
  }, [employees, selectedOrgYear]);

  const totalCount = yearFilteredEmployees.length;

  const orgStats = useMemo(() => {
    const businessLinesSet = new Set<string>();
    const groupsSet = new Set<string>();
    const departmentsSet = new Set<string>();
    const zonesSet = new Set<string>();
    const lineCounts: Record<string, number> = {};

    yearFilteredEmployees.forEach((employee) => {
      if (employee.businessLine) {
        businessLinesSet.add(employee.businessLine);
        lineCounts[employee.businessLine] = (lineCounts[employee.businessLine] || 0) + 1;
      }
      if (employee.group) groupsSet.add(employee.group);
      if (employee.department) departmentsSet.add(employee.department);
      if (employee.zone && employee.zone !== "สำนักงานใหญ่") zonesSet.add(employee.zone);
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
      maxLineCount,
    };
  }, [yearFilteredEmployees]);

  const retirementCohort = useMemo(() => {
    return yearFilteredEmployees
      .filter((employee) => employee.age >= 55)
      .map((employee) => {
        const yearsToRetire = Math.max(0, 60 - employee.age);
        return {
          ...employee,
          yearsToRetire,
          retireYear: selectedOrgYear + yearsToRetire,
        };
      })
      .sort((a, b) => b.age - a.age);
  }, [yearFilteredEmployees, selectedOrgYear]);

  const pyramidBands = useMemo(() => {
    let executiveCount = 0;
    let managementCount = 0;
    let seniorCount = 0;
    let operationCount = 0;

    yearFilteredEmployees.forEach((employee) => {
      const level = getLevelNumber(employee.level);
      if (level >= 9) executiveCount += 1;
      else if (level >= 6) managementCount += 1;
      else if (level >= 4) seniorCount += 1;
      else operationCount += 1;
    });

    return [
      {
        id: "apex",
        label: "L9-L11",
        title: "ผู้บริหารระดับสูง",
        count: executiveCount,
        percent: Math.round((executiveCount / (totalCount || 1)) * 100),
        width: 42,
        gradient: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
        dot: "bg-violet-500",
      },
      {
        id: "management",
        label: "L6-L8",
        title: "ผู้จัดการ / หัวหน้าฝ่าย",
        count: managementCount,
        percent: Math.round((managementCount / (totalCount || 1)) * 100),
        width: 62,
        gradient: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
        dot: "bg-blue-500",
      },
      {
        id: "senior",
        label: "L4-L5",
        title: "อาวุโส / หัวหน้างาน",
        count: seniorCount,
        percent: Math.round((seniorCount / (totalCount || 1)) * 100),
        width: 80,
        gradient: "linear-gradient(135deg, #14B8A6 0%, #10B981 100%)",
        dot: "bg-emerald-500",
      },
      {
        id: "base",
        label: "L1-L3",
        title: "ฐานปฏิบัติการ",
        count: operationCount,
        percent: Math.round((operationCount / (totalCount || 1)) * 100),
        width: 96,
        gradient: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
        dot: "bg-cyan-500",
      },
    ];
  }, [yearFilteredEmployees, totalCount]);

  const successionStats = useMemo(() => {
    let readyNow = 0;
    let readySoon = 0;
    let risk = 0;
    let noSuccessor = 0;

    yearFilteredEmployees.forEach((employee) => {
      const level = getLevelNumber(employee.level);
      if (level >= 9) {
        if (employee.successionStatus === "Ready Now") readyNow += 1;
        else if (employee.successionStatus === "Ready 1-2 Years") readySoon += 1;
        else if (employee.successionStatus === "Ready 3-5 Years") risk += 1;
        else noSuccessor += 1;
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
      noSuccessorPct: Math.round((noSuccessor / totalKeyRoles) * 100),
    };
  }, [yearFilteredEmployees]);

  const successionChartData = useMemo(() => {
    return [
      { name: "พร้อมทันที", value: successionStats.readyNow, color: "#10B981" },
      { name: "พร้อมใน 1-2 ปี", value: successionStats.readySoon, color: "#3B82F6" },
      { name: "ต้องพัฒนา", value: successionStats.risk, color: "#F59E0B" },
      { name: "ไม่มีผู้สืบทอด", value: successionStats.noSuccessor, color: "#F43F5E" },
    ].filter((item) => item.value > 0);
  }, [successionStats]);

  const drillDownModel = useMemo<OrgDrillDownModel>(() => {
    const model: OrgDrillDownModel = {};

    yearFilteredEmployees.forEach((employee) => {
      const line = employee.businessLine || "ไม่ระบุสายงาน";
      const group = employee.group || "ไม่ระบุกลุ่มงาน";
      const department = employee.department || "ไม่ระบุหน่วยงาน";

      if (!model[line]) model[line] = { count: 0, groups: {} };
      model[line].count += 1;

      if (!model[line].groups[group]) {
        model[line].groups[group] = { count: 0, departments: {} };
      }
      model[line].groups[group].count += 1;
      model[line].groups[group].departments[department] =
        (model[line].groups[group].departments[department] || 0) + 1;
    });

    return model;
  }, [yearFilteredEmployees]);

  const businessLineItems = useMemo(() => {
    return Object.entries(drillDownModel)
      .map(([name, item]) => ({ name, count: (item as any).count as number }))
      .sort((a, b) => b.count - a.count);
  }, [drillDownModel]);

  const selectedLineModel = selectedBusinessLine ? drillDownModel[selectedBusinessLine] : undefined;
  const groupItems = selectedLineModel
    ? Object.entries(selectedLineModel.groups)
        .map(([name, item]) => ({ name, count: (item as any).count as number }))
        .sort((a, b) => b.count - a.count)
    : [];

  const selectedGroupModel = selectedLineModel && selectedGroup ? selectedLineModel.groups[selectedGroup] : undefined;
  const departmentItems = selectedGroupModel
    ? Object.entries(selectedGroupModel.departments)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
    : [];

  const insightCards = [
    {
      title: "Retirement Risk",
      value: `${formatNumber(retirementCohort.length)} คน`,
      detail: "ควรเตรียมแผนทดแทนก่อนครบกำหนดเกษียณ",
      color: "border-rose-100 bg-rose-50 text-rose-700",
      icon: <ShieldAlert size={15} />,
    },
    {
      title: "Succession Gap",
      value: `${formatNumber(successionStats.noSuccessor)} ตำแหน่ง`,
      detail: "ตำแหน่งหลักที่ยังไม่มีผู้สืบทอดชัดเจน",
      color: "border-amber-100 bg-amber-50 text-amber-700",
      icon: <Hourglass size={15} />,
    },
    {
      title: "Structure Focus",
      value: orgStats.maxLineName.replace("สายงาน", ""),
      detail: `สายงานกำลังพลมากที่สุด ${formatNumber(orgStats.maxLineCount)} คน`,
      color: "border-blue-100 bg-blue-50 text-blue-700",
      icon: <TrendingUp size={15} />,
    },
    {
      title: "Readiness Target",
      value: `${successionStats.readyNowPct + successionStats.readySoonPct}%`,
      detail: "เป้าหมายรวม Ready Now และ Ready 1-2 ปี มากกว่า 70%",
      color: "border-emerald-100 bg-emerald-50 text-emerald-700",
      icon: <Award size={15} />,
    },
  ];

  const handleBusinessLineClick = (lineName: string) => {
    setSelectedBusinessLine((current) => (current === lineName ? null : lineName));
    setSelectedGroup(null);
  };

  const handleGroupClick = (groupName: string) => {
    setSelectedGroup((current) => (current === groupName ? null : groupName));
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-blue-100 bg-white shadow-sm">
        <div className="flex flex-col gap-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-medium uppercase text-white">
                Strategic Calendar Year
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-medium text-emerald-100">
                <Sparkles size={11} /> Dynamic Workforce Projection
              </span>
            </div>
            <h2 className="text-[18px] font-medium leading-snug">
              วิเคราะห์โครงสร้างองค์กรและกำลังพลตามปีปฏิทิน
            </h2>
            <p className="mt-1 max-w-3xl text-[12px] font-light leading-relaxed text-blue-50">
              เลือกปีเพื่อจำลองผลกระทบจากอายุพนักงาน ความเสี่ยงเกษียณ และความพร้อมของแผนสืบทอดตำแหน่ง
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              { year: 2026, label: "2569", desc: "ปีปัจจุบัน" },
              { year: 2027, label: "2570", desc: "+1 ปี" },
              { year: 2028, label: "2571", desc: "+2 ปี" },
              { year: 2029, label: "2572", desc: "+3 ปี" },
            ].map((item) => {
              const active = selectedOrgYear === item.year;
              return (
                <button
                  key={item.year}
                  type="button"
                  onClick={() => {
                    setSelectedOrgYear(item.year);
                    setSelectedBusinessLine(null);
                    setSelectedGroup(null);
                  }}
                  className={`min-w-[100px] rounded-2xl border px-4 py-3 text-left transition-all ${
                    active
                      ? "border-white bg-white text-slate-900 shadow-lg"
                      : "border-white/15 bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  <p className="text-[15px] font-medium leading-none">{item.label}</p>
                  <p className={`mt-1 text-[10px] font-light ${active ? "text-slate-500" : "text-blue-100"}`}>{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          icon={<Activity size={18} />}
          eyebrow="Organization KPI Summary"
          title={`ภาพรวมโครงสร้างกำลังพล ปี ${selectedOrgYear}`}
          description="ตัวชี้วัดหลักที่ช่วยให้ผู้บริหารเห็นภาพรวมกำลังพล ความเสี่ยงเกษียณ และความพร้อมสืบทอดตำแหน่ง"
          right={
            selectedMetric && (
              <button
                type="button"
                onClick={() => setSelectedMetric("headcount")}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-500 shadow-sm hover:text-blue-600"
              >
                Clear selection
              </button>
            )
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="กำลังพลทั้งหมด"
            subtitle="จำนวนพนักงานทั้งหมดตามปีจำลองที่เลือก"
            value={totalCount}
            percent="100%"
            icon={<Users size={19} />}
            accent="blue"
            selected={selectedMetric === "headcount"}
            onClick={() => setSelectedMetric("headcount")}
          />
          <MetricCard
            title="ใกล้เกษียณ 55 ปีขึ้นไป"
            subtitle="กลุ่มที่ควรติดตามเพื่อจัดทำแผนทดแทน"
            value={retirementCohort.length}
            percent={`${Math.round((retirementCohort.length / (totalCount || 1)) * 100)}%`}
            icon={<ShieldAlert size={19} />}
            accent="rose"
            selected={selectedMetric === "retirement"}
            onClick={() => setSelectedMetric("retirement")}
          />
          <MetricCard
            title="Ready Now"
            subtitle="ผู้สืบทอดตำแหน่งหลักที่พร้อมปฏิบัติทันที"
            value={successionStats.readyNow}
            percent={`${successionStats.readyNowPct}%`}
            icon={<UserCheck size={19} />}
            accent="emerald"
            selected={selectedMetric === "succession"}
            onClick={() => setSelectedMetric("succession")}
          />
          <MetricCard
            title="กลุ่มผู้จัดการ L6-L8"
            subtitle="แกนกลางของโครงสร้างบริหารและการถ่ายทอดกลยุทธ์"
            value={pyramidBands[1].count}
            percent={`${pyramidBands[1].percent}%`}
            icon={<Briefcase size={19} />}
            accent="violet"
            selected={selectedMetric === "management"}
            onClick={() => setSelectedMetric("management")}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-4 rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
          <SectionHeader
            icon={<Calendar size={18} />}
            eyebrow="Retirement Watchlist"
            title="รายชื่อพนักงานเตรียมเกษียณ"
            description={`อายุ 55-60 ปี ณ ปี ${selectedOrgYear}`}
            themeColor="rose"
            right={<span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-medium text-rose-600">{formatNumber(retirementCohort.length)} รายการ</span>}
          />

          <div className="max-h-[410px] space-y-3 overflow-y-auto pr-1">
            {retirementCohort.slice(0, 12).map((employee) => (
              <div key={employee.empId} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:border-rose-100 hover:bg-rose-50/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[13px] font-medium text-slate-900">{employee.name}</p>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500">{employee.level}</span>
                    </div>
                    <p className="mt-1 truncate text-[11px] font-light text-slate-500">{employee.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[18px] font-medium leading-none text-slate-900">{employee.age}</p>
                    <p className="mt-1 text-[10px] text-slate-400">ปี</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white pt-3 text-[10px]">
                  <span className="font-light text-slate-500">ปีเกษียณ {employee.retireYear}</span>
                  <span className={`font-medium ${employee.yearsToRetire === 0 ? "text-rose-600" : "text-amber-600"}`}>
                    {employee.yearsToRetire === 0 ? "เกษียณสิ้นปีนี้" : `อีก ${employee.yearsToRetire} ปี`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-5 p-6 bg-transparent border-none shadow-none">
          <SectionHeader
            icon={<Layers size={18} />}
            eyebrow="Employee Level Pyramid"
            title="พีระมิดระดับชั้นกำลังพล"
            description="แสดงสัดส่วนระดับพนักงานแบบพีระมิดเพื่อให้เห็นฐานกำลังพลและชั้นบริหารชัดเจน"
            themeColor="blue"
            right={<span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-600">{formatNumber(totalCount)} คน</span>}
          />

          <div className="py-2">
            <div className="relative mx-auto flex w-full max-w-[380px] items-center justify-center gap-2 py-2">
              {/* Left Labels Column */}
              <div className="hidden sm:flex flex-col w-[100px] text-right pr-2">
                {pyramidBands.map((band) => (
                  <div key={`left-${band.id}`} className="flex h-[35px] flex-col justify-center">
                    <p className="text-[10px] font-medium text-slate-600 leading-tight">{band.label}</p>
                    <p className="text-[8.5px] font-light text-slate-400 mt-0.5 truncate">{band.title}</p>
                  </div>
                ))}
              </div>

              {/* Center Pyramid Column using Vector SVG for Perfect Alignment and Sharp Point */}
              <div className="w-[140px] h-[140px] shrink-0 select-none">
                <svg viewBox="0 0 200 160" className="w-full h-full overflow-visible drop-shadow-sm">
                  <defs>
                    <linearGradient id="apex-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                    <linearGradient id="mgmt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#4F46E5" />
                    </linearGradient>
                    <linearGradient id="sr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#14B8A6" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                    <linearGradient id="base-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>

                  {/* Level Apex - Truly Pointed Top Triangle */}
                  <polygon 
                    points="100,0 120,40 80,40" 
                    fill="url(#apex-grad)" 
                    className="transition-all duration-300 hover:brightness-[1.1] cursor-pointer"
                  />

                  {/* Level Management */}
                  <polygon 
                    points="80,40 120,40 140,80 60,80" 
                    fill="url(#mgmt-grad)" 
                    className="transition-all duration-300 hover:brightness-[1.1] cursor-pointer"
                  />

                  {/* Level Senior */}
                  <polygon 
                    points="60,80 140,80 160,120 40,120" 
                    fill="url(#sr-grad)" 
                    className="transition-all duration-300 hover:brightness-[1.1] cursor-pointer"
                  />

                  {/* Level Base */}
                  <polygon 
                    points="40,120 160,120 180,160 20,160" 
                    fill="url(#base-grad)" 
                    className="transition-all duration-300 hover:brightness-[1.1] cursor-pointer"
                  />
                </svg>
              </div>

              {/* Right Labels Column */}
              <div className="hidden sm:flex flex-col w-[90px] text-left pl-2">
                {pyramidBands.map((band) => (
                  <div key={`right-${band.id}`} className="flex h-[35px] flex-col justify-center">
                    <p className="text-[11px] font-medium text-slate-800 leading-none">{formatNumber(band.count)} คน</p>
                    <p className="text-[9px] font-normal text-[#2F6FE4] mt-0.5">{band.percent}%</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
              {pyramidBands.map((band) => (
                <div key={band.id} className="rounded-2xl border border-slate-100 bg-white px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${band.dot}`} />
                    <span className="text-[11px] font-medium text-slate-700">{band.label}</span>
                  </div>
                  <p className="mt-1 text-[10px] font-light text-slate-400">{band.percent}% ของกำลังพล</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
          <SectionHeader
            icon={<UserCheck size={18} />}
            eyebrow="Succession Plan"
            title="ความพร้อมสืบทอดตำแหน่งหลัก"
            description="สถานะผู้สืบทอดของตำแหน่งบริหารระดับ L9-L11"
            themeColor="emerald"
          />

          <div className="rounded-[26px] border border-slate-100 bg-slate-50/70 p-4">
            <div className="relative h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={successionChartData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                    {successionChartData.map((entry, index) => (
                      <Cell key={`succession-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: "1px solid #E2E8F0" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-light text-slate-400">ตำแหน่งหลัก</p>
                <p className="text-[26px] font-medium leading-none text-slate-900">{formatNumber(successionStats.totalKeyRoles)}</p>
                <p className="mt-1 text-[10px] font-light text-slate-400">อัตรา</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: "Ready Now", value: successionStats.readyNow, pct: successionStats.readyNowPct, color: "bg-emerald-500" },
                { label: "Ready 1-2 Years", value: successionStats.readySoon, pct: successionStats.readySoonPct, color: "bg-blue-500" },
                { label: "Developing", value: successionStats.risk, pct: successionStats.riskPct, color: "bg-amber-500" },
                { label: "No Successor", value: successionStats.noSuccessor, pct: successionStats.noSuccessorPct, color: "bg-rose-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-[11px]">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${item.color}`} />
                    <span className="truncate font-light text-slate-600">{item.label}</span>
                  </div>
                  <span className="font-medium text-slate-900">{formatNumber(item.value)} คน ({item.pct}%)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-[11px] leading-relaxed text-amber-800">
            <div className="mb-1 flex items-center gap-2 font-medium">
              <ShieldAlert size={15} /> Management Action
            </div>
            ควรเร่งพัฒนาแผนสืบทอดสำหรับกลุ่มที่ยังไม่มีผู้สืบทอด {formatNumber(successionStats.noSuccessor)} ตำแหน่ง
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {insightCards.map((item) => (
          <div key={item.title} className={`rounded-[24px] border p-4 ${item.color}`}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[12px] font-medium">
                {item.icon}
                {item.title}
              </div>
              <ChevronRight size={14} />
            </div>
            <p className="text-[20px] font-medium leading-none">{item.value}</p>
            <p className="mt-2 text-[10px] font-light leading-relaxed opacity-80">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={<Grid size={18} />}
          eyebrow="Interactive Org Directory Explorer"
          title="สำรวจโครงสร้างองค์กรแบบ Drill-down"
          description="เลือกสายงานหลัก กลุ่มงาน และหน่วยงานย่อย เพื่อดูจำนวนกำลังพลตามลำดับโครงสร้าง"
          themeColor="slate"
          right={
            <div className="hidden items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-500 md:flex">
              <Search size={13} />
              {selectedBusinessLine ? selectedBusinessLine.replace("สายงาน", "") : "ยังไม่ได้เลือกสายงาน"}
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-4 rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase text-slate-500">Business Line</p>
              <span className="text-[10px] text-slate-400">{businessLineItems.length} สายงาน</span>
            </div>
            <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {businessLineItems.map((item) => {
                const active = selectedBusinessLine === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleBusinessLineClick(item.name)}
                    className={`w-full rounded-2xl border p-3 text-left transition-all ${
                      active ? "border-blue-200 bg-blue-600 text-white shadow-md" : "border-slate-100 bg-white text-slate-700 hover:border-blue-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium">{item.name}</p>
                        <p className={`mt-0.5 text-[10px] font-light ${active ? "text-blue-100" : "text-slate-400"}`}>{formatNumber(item.count)} คน</p>
                      </div>
                      <ChevronRight size={15} className={active ? "rotate-90" : "text-slate-400"} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4 rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase text-slate-500">Division Group</p>
              <span className="text-[10px] text-slate-400">{groupItems.length} กลุ่ม</span>
            </div>
            {!selectedBusinessLine ? (
              <div className="flex h-[300px] flex-col items-center justify-center rounded-2xl bg-white text-center text-slate-400">
                <Building size={22} className="mb-2 text-slate-300" />
                <p className="text-[12px] font-light">เลือกสายงานหลักเพื่อดู Division Group</p>
              </div>
            ) : (
              <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                {groupItems.map((item) => {
                  const active = selectedGroup === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleGroupClick(item.name)}
                      className={`w-full rounded-2xl border p-3 text-left transition-all ${
                        active ? "border-indigo-200 bg-indigo-600 text-white shadow-md" : "border-slate-100 bg-white text-slate-700 hover:border-indigo-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-medium">{item.name}</p>
                          <p className={`mt-0.5 text-[10px] font-light ${active ? "text-indigo-100" : "text-slate-400"}`}>{formatNumber(item.count)} คน</p>
                        </div>
                        <ChevronRight size={15} className={active ? "rotate-90" : "text-slate-400"} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase text-slate-500">Department / Unit</p>
              <span className="text-[10px] text-slate-400">{departmentItems.length} หน่วยงาน</span>
            </div>
            {!selectedGroup ? (
              <div className="flex h-[300px] flex-col items-center justify-center rounded-2xl bg-white text-center text-slate-400">
                <MapPin size={22} className="mb-2 text-slate-300" />
                <p className="text-[12px] font-light">เลือกกลุ่มงานเพื่อดูหน่วยงานย่อย</p>
              </div>
            ) : (
              <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                {departmentItems.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-slate-100 bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium leading-snug text-slate-800">{item.name}</p>
                        <p className="mt-1 text-[9px] font-light uppercase text-slate-400">SME D BANK DEPT</p>
                      </div>
                      <span className="shrink-0 rounded-xl bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-blue-600">
                        {formatNumber(item.count)} คน
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
