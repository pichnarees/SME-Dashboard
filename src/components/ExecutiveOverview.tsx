/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Employee } from "../data/mockData";
import { FilterState } from "./FilterBar";
import { 
  Users, 
  ShieldAlert, 
  Award, 
  TrendingDown, 
  Hourglass, 
  Calendar, 
  UserCheck, 
  Briefcase, 
  Building, 
  MapPin, 
  TrendingUp, 
  Cpu, 
  Sparkles, 
  Check, 
  Search, 
  User,
  ChevronLeft,
  ChevronRight,
  Sparkle,
  X
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid,
  LabelList
} from "recharts";

interface ExecutiveOverviewProps {
  employees: Employee[];
  totalResignationsCount: number;
  onSelectEmployee: (emp: Employee) => void;
  activeFilters: FilterState;
  onSetFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export default function ExecutiveOverview({
  employees,
  totalResignationsCount,
  onSelectEmployee,
  activeFilters,
  onSetFilters,
}: ExecutiveOverviewProps) {
  // Pagination & Search States inside the table
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Active filters for specific columns
  const [typeFilter, setTypeFilter] = useState<"All" | "พนักงานประจำ" | "พนักงานสัญญาจ้าง">("All");
  const [perfFilter, setPerfFilter] = useState<"All" | "High" | "Meets" | "Needs">("All");

  // Reset pagination on search or filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, perfFilter]);

  // Local UI states for tab groupings to reduce layout clutter and consolidate cards
  const [activeDonutTab, setActiveDonutTab] = useState<"contract" | "hb" | "fb" | "gender">("contract");
  const [activeStructureTab, setActiveStructureTab] = useState<"level" | "performance">("level");
  const [activeSuccessionTab, setActiveSuccessionTab] = useState<"management" | "retirement">("management");
  const [controlSpanView, setControlSpanView] = useState<"chart" | "cards">("chart");
  const [activeTierDetail, setActiveTierDetail] = useState<"high" | "mid" | "lead" | "staff">("high");

  // Calculations based on filtered list (the parent filters applied to 'employees')
  const totalCount = employees.length;
  const permanentCount = employees.filter(e => e.contractType === "พนักงานประจำ").length;
  const contractCount = employees.filter(e => e.contractType === "พนักงานสัญญาจ้าง").length;

  const getCohortStats = (cohort: typeof employees) => {
    if (cohort.length === 0) return { avgAge: 0, avgTenure: 0, highPerfPct: 0 };
    const totalAge = cohort.reduce((acc, c) => acc + c.age, 0);
    const totalTenure = cohort.reduce((acc, c) => acc + c.tenure, 0);
    const highPerf = cohort.filter(e => e.performanceRating === "High Performer").length;
    return {
      avgAge: Math.round((totalAge / cohort.length) * 10) / 10,
      avgTenure: Math.round((totalTenure / cohort.length) * 10) / 10,
      highPerfPct: Math.round((highPerf / cohort.length) * 100)
    };
  };

  const averageAge = useMemo(() => {
    if (totalCount === 0) return 0;
    const total = employees.reduce((acc, curr) => acc + curr.age, 0);
    return Math.round((total / totalCount) * 10) / 10;
  }, [employees, totalCount]);

  const averageTenure = useMemo(() => {
    if (totalCount === 0) return 0;
    const total = employees.reduce((acc, curr) => acc + curr.tenure, 0);
    return Math.round((total / totalCount) * 10) / 10;
  }, [employees, totalCount]);

  const seniorCount = useMemo(() => {
    return employees.filter(e => e.age >= 55).length;
  }, [employees]);

  // Turnover rate approximation based on the filtered cohort's proportional resignation
  const turnoverRate = useMemo(() => {
    if (totalCount === 0) return 0;
    // Scale turnover based on total active headcount proportion
    const proportion = totalCount / 2182;
    const relativeResignations = Math.max(1, Math.round(totalResignationsCount * proportion));
    return Math.round((relativeResignations / (totalCount + relativeResignations)) * 100 * 10) / 10;
  }, [totalCount, totalResignationsCount]);

  // Charts data preparation
  // 1. Contract Type Donut Data
  const contractDonutData = useMemo(() => {
    return [
      { name: "พนักงานประจำ", value: permanentCount, color: "#2F6FE4" },
      { name: "พนักงานสัญญาจ้าง", value: contractCount, color: "#4C8DFF" }
    ];
  }, [permanentCount, contractCount]);

  // 2. Head Office / Branch Donut Data
  const hbDonutData = useMemo(() => {
    const ho = employees.filter(e => e.hb === "Head Office").length;
    const br = employees.filter(e => e.hb === "Branch").length;
    return [
      { name: "สำนักงานใหญ่", value: ho, color: "#2F6FE4" },
      { name: "สาขาภูมิภาค", value: br, color: "#25B7D3" }
    ];
  }, [employees]);

  // 3. Front / Back Office Donut Data
  const fbDonutData = useMemo(() => {
    const front = employees.filter(e => e.frontBack === "Front").length;
    const back = employees.filter(e => e.frontBack === "Back").length;
    return [
      { name: "Front Office (บริการ/ตลาด)", value: front, color: "#2DBE7F" },
      { name: "Back Office (สนับสนุน)", value: back, color: "#F36B6B" }
    ];
  }, [employees]);

  // 4. Gender Donut Data
  const genderDonutData = useMemo(() => {
    const male = employees.filter(e => e.gender === "ชาย").length;
    const female = employees.filter(e => e.gender === "หญิง").length;
    return [
      { name: "เพศหญิง", value: female, color: "#25B7D3" },
      { name: "เพศชาย", value: male, color: "#2F6FE4" }
    ];
  }, [employees]);

  // Position Level chart (Horizontal Bar Chart)
  const levelDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(e => {
      counts[e.level] = (counts[e.level] || 0) + 1;
    });

    const levelOrder = [
      "Level 13 ขึ้นไป", "Level 12", "Level 11", "Level 10", "Level 9",
      "Level 8 ผู้ช่วยผู้จัดการ", "Level 8 เจ้าหน้าที่อาวุโส", "Level 7", "Level 6", "Level 5", "Level 4 หรือต่ำกว่า"
    ];

    return levelOrder.map(lvl => ({
      name: lvl,
      จำนวนคน: counts[lvl] || 0
    })).filter(item => item.จำนวนคน > 0);
  }, [employees]);

  const levelChartData = useMemo(() => {
    return levelDistribution.map(entry => {
      let shortName = entry.name;
      if (entry.name.includes("13")) shortName = "L13+";
      else if (entry.name.includes("12")) shortName = "L12";
      else if (entry.name.includes("11")) shortName = "L11";
      else if (entry.name.includes("10")) shortName = "L10";
      else if (entry.name.includes("9")) shortName = "L9";
      else if (entry.name.includes("8 ผู้ช่วย")) shortName = "L8 (ผช.ผจก.)";
      else if (entry.name.includes("8 เจ้าหน้าที่")) shortName = "L8 (จนท.อาวุโส)";
      else if (entry.name.includes("7")) shortName = "L7";
      else if (entry.name.includes("6")) shortName = "L6";
      else if (entry.name.includes("5")) shortName = "L5";
      else if (entry.name.includes("4")) shortName = "L4-";
      
      return {
        ...entry,
        shortName,
        fullName: entry.name
      };
    });
  }, [levelDistribution]);

  // Management vs Staff Snapshot
  const managementData = useMemo(() => {
    const managerCount = employees.filter(e => {
      const num = parseInt(e.level.replace(/[^0-9]/g, "")) || 0;
      return num >= 9 || e.level.includes("13");
    }).length;

    const staffCount = totalCount - managerCount;
    const ratio = managerCount > 0 ? (staffCount / managerCount).toFixed(1) : "0";

    return {
      managers: managerCount,
      staff: staffCount,
      ratio: ratio,
      spanOfControl: ratio
    };
  }, [employees, totalCount]);

  // Management Tier breakdown
  const managementTiers = useMemo(() => {
    const high = employees.filter(e => e.level.includes("13") || e.level.includes("12") || e.level.includes("11")).length;
    const mid = employees.filter(e => e.level.includes("10") || e.level.includes("9")).length;
    const lead = employees.filter(e => e.level.includes("8") || e.level.includes("7")).length;
    const staff = totalCount - (high + mid + lead);
    return { high, mid, lead, staff };
  }, [employees, totalCount]);

  // Management Tier chart data
  const managementChartData = useMemo(() => {
    return [
      { name: "บริหารสูง (L11-13)", "จำนวนคน": managementTiers.high, grad: "url(#barHighGrad)" },
      { name: "บริหารกลาง (L9-10)", "จำนวนคน": managementTiers.mid, grad: "url(#barMidGrad)" },
      { name: "หัวหน้างาน (L7-8)", "จำนวนคน": managementTiers.lead, grad: "url(#vertPurpleGrad)" },
      { name: "ผู้ปฏิบัติการ (L6ลงไป)", "จำนวนคน": managementTiers.staff, grad: "url(#barLowGrad)" }
    ];
  }, [managementTiers]);

  // Performance distribution Donut Data
  const performanceDonutData = useMemo(() => {
    const high = employees.filter(e => e.performanceRating === "High Performer").length;
    const meets = employees.filter(e => e.performanceRating === "Meets Standard").length;
    const needs = employees.filter(e => e.performanceRating === "Needs Support").length;
    return [
      { name: "กลุ่มดาวเด่น (High Performer)", value: high, color: "#2DBE7F" },
      { name: "กลุ่มตามมาตรฐาน (Meets Standard)", value: meets, color: "#FFB547" },
      { name: "กลุ่มต้องการพัฒนา (Needs Support)", value: needs, color: "#F36B6B" }
    ];
  }, [employees]);

  // Retirement risk years & Mini Bar Data
  const retirementForecast = useMemo(() => {
    const r1 = employees.filter(e => e.age === 59).length;
    const r3 = employees.filter(e => e.age >= 57 && e.age <= 59).length;
    const r5 = employees.filter(e => e.age >= 55 && e.age <= 59).length;
    return { r1, r3, r5 };
  }, [employees]);

  const retirementBarData = useMemo(() => {
    return [
      { name: "ภายใน 1 ปี (อายุ 59)", จำนวนพนักงาน: retirementForecast.r1, fill: "#F36B6B" },
      { name: "ภายใน 3 ปี (อายุ 57-59)", จำนวนพนักงาน: retirementForecast.r3, fill: "#FFB547" },
      { name: "ภายใน 5 ปี (อายุ 55-59)", จำนวนพนักงาน: retirementForecast.r5, fill: "#4C8DFF" }
    ];
  }, [retirementForecast]);

  // Dynamic insights builder grouped into risks, opportunities, and recommendations
  const executiveHighlights = useMemo(() => {
    if (totalCount === 0) return { risks: [], opportunities: [], recommendations: [] };

    const risks = [];
    const opportunities = [];
    const recommendations = [];

    // 1. Risks calculations
    const seniorPct = totalCount > 0 ? Math.round((seniorCount / totalCount) * 100) : 0;
    if (seniorCount > 50) {
      risks.push({
        title: "ความเสี่ยงการเกษียณอายุสูงในกลุ่มตำแหน่งงานหลัก",
        desc: `มีพนักงานอายุ 55 ปีขึ้นไปสูงถึง ${seniorCount.toLocaleString()} คน (${seniorPct}%) ในขณะนี้ โดยจะทยอยพ้นวาระสัญญาใน 1-5 ปี ควรเร่งถ่ายทอดทักษะ`,
        icon: <ShieldAlert size={16} className="text-[#F36B6B]" />,
        bg: "bg-[#F36B6B]/5 border-[#F36B6B]/15",
        labelColor: "text-[#F36B6B]"
      });
    }

    const needsSupportCount = employees.filter(e => e.performanceRating === "Needs Support").length;
    const needsPct = totalCount > 0 ? Math.round((needsSupportCount / totalCount) * 100) : 0;
    if (needsSupportCount > 0) {
      risks.push({
        title: "อัตราผู้ปฏิบัติงานที่ต้องการการสนับสนุนเพิ่มผลงาน",
        desc: `พบพนักงานจำนวน ${needsSupportCount.toLocaleString()} คน (${needsPct}%) อยู่ในกลุ่มประเมินผล Needs Support ควรกำหนดโปรแกรมเพิ่มประสิทธิภาพงาน`,
        icon: <TrendingDown size={16} className="text-[#F36B6B]" />,
        bg: "bg-[#F36B6B]/5 border-[#F36B6B]/15",
        labelColor: "text-[#F36B6B]"
      });
    }

    // 2. Opportunities calculations
    const highPerformerCount = employees.filter(e => e.performanceRating === "High Performer").length;
    const highPct = totalCount > 0 ? Math.round((highPerformerCount / totalCount) * 100) : 0;
    opportunities.push({
      title: "กลุ่มบุคลากรศักยภาพสูงพร้อมก้าวขึ้นเป็นผู้นำรุ่นถัดไป",
      desc: `มีพนักงานดาวรุ่ง High Performer อยู่ที่ ${highPct}% (${highPerformerCount.toLocaleString()} คน) สามารถนำเข้ามาเป็นแกนหลักในโครงการกลยุทธ์ธนาคาร`,
      icon: <Award size={16} className="text-[#2DBE7F]" />,
      bg: "bg-[#2DBE7F]/5 border-[#2DBE7F]/15",
      labelColor: "text-[#2DBE7F]"
    });

    const branchLineCount = employees.filter(e => e.businessLine.includes("สาขา")).length;
    const branchLinePct = totalCount > 0 ? Math.round((branchLineCount / totalCount) * 100) : 0;
    opportunities.push({
      title: "พลังขับเคลื่อนจากสายบริการสาขาภูมิภาค",
      desc: `สัดส่วนกำลังพลหลัก ${branchLinePct}% ทำงานส่วนท้องถิ่น เป็นโอกาสทองในการผลักดันเป้าหมายช่วยเหลือลูกค้ากลุ่มวิสาหกิจชุมชนเชิงรุก`,
      icon: <Building size={16} className="text-[#25B7D3]" />,
      bg: "bg-[#25B7D3]/5 border-[#25B7D3]/15",
      labelColor: "text-[#25B7D3]"
    });

    // 3. Recommendations
    if (seniorCount > 50) {
      recommendations.push({
        title: "ริเริ่มจัดทำแผนสืบทอดตำแหน่งสถาบันอย่างจริงจัง",
        desc: "ควรกำหนดแผนผู้รับทอดสายงานหลัก (Succession Planning) สำหรับหัวหน้ากลุ่มปฏิบัติการสาขาภูมิภาคเพื่อป้องกันปัญหาการทำงานสะดุดเมื่อเกษียณ",
        icon: <Calendar size={16} className="text-[#2F6FE4]" />,
        bg: "bg-[#2F6FE4]/5 border-[#2F6FE4]/15",
        labelColor: "text-[#2F6FE4]"
      });
    }

    if (needsSupportCount > 0) {
      recommendations.push({
        title: "โปรแกรม Mentorship จับคู่เพื่อยกระดับทักษะทำงาน",
        desc: "จับคู่เรียนรู้ระหว่างพนักงานกลุ่มผลงานโดดเด่นร่วมกับทีมงานที่ต้องการความช่วยเหลือ เพื่อฟูมฟักมาตรฐานทัศนคติบริการที่เป็นเลิศร่วมกัน",
        icon: <Users size={16} className="text-[#2F6FE4]" />,
        bg: "bg-[#2F6FE4]/5 border-[#2F6FE4]/15",
        labelColor: "text-[#2F6FE4]"
      });
    }

    const ratioNum = parseFloat(managementData.ratio);
    if (ratioNum < 5) {
      recommendations.push({
        title: "การจัดระเบียบสายควบคุม (Span of Control Optimization)",
        desc: `สัดส่วนเฉลี่ยปัจจุบันอยู่ที่ 1:${managementData.ratio} ควรลดความซับซ้อนโครงสร้างเพื่อความรวดเร็วคล่องตัวในการตอบสนองคำขอกู้ยืมของกลุ่ม SME`,
        icon: <TrendingUp size={16} className="text-[#FFB547]" />,
        bg: "bg-[#FFB547]/5 border-[#FFB547]/15",
        labelColor: "text-[#FFB547]"
      });
    } else {
      recommendations.push({
        title: "รักษาเสถียรภาพสายควบคุมระดับสมดุลเชิงรุก",
        desc: "สนับสนุนพนักงานประจำสาขาให้มีอำนาจดำเนินงานและรับฟังนโยบายเชิงระนาบ เพื่อธำรงความสัมพันธ์และประสิทธิภาพความร่วมมืออย่างราบรื่น",
        icon: <Check size={16} className="text-[#2DBE7F]" />,
        bg: "bg-[#2DBE7F]/5 border-[#2DBE7F]/15",
        labelColor: "text-[#2DBE7F]"
      });
    }

    return { risks, opportunities, recommendations };
  }, [employees, totalCount, seniorCount, managementData]);

  // Employee Explorer Search & Filter Logic
  const filteredTableData = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch =
        searchTerm === "" ||
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "All" || emp.contractType === typeFilter;

      const matchesPerf =
        perfFilter === "All" ||
        (perfFilter === "High" && emp.performanceRating === "High Performer") ||
        (perfFilter === "Meets" && emp.performanceRating === "Meets Standard") ||
        (perfFilter === "Needs" && emp.performanceRating === "Needs Support");

      return matchesSearch && matchesType && matchesPerf;
    });
  }, [employees, searchTerm, typeFilter, perfFilter]);

  // Pagination slice
  const paginatedTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTableData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTableData, currentPage]);

  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage) || 1;

  // Render sub-donut helper to keep code perfectly clean and maintainable
  const renderDonutChart = (title: string, data: { name: string; value: number; color: string }[], icon?: React.ReactNode) => {
    const totalVal = data.reduce((sum, item) => sum + item.value, 0);
    const maxItem = data.reduce((max, item) => item.value > max.value ? item : max, data[0]);
    const maxPct = totalVal > 0 ? Math.round((maxItem.value / totalVal) * 100) : 0;
    
    // Clean label for display inside donut
    const centerLabel = maxItem.name.includes("(") 
      ? maxItem.name.split("(")[0].trim() 
      : maxItem.name;

    return (
      <div className="bg-white border border-[#DCE6F2] rounded-xl p-4.5 flex flex-col justify-between hover:shadow-lg hover:border-[#2F6FE4]/35 hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-medium text-[#1F2D3D] block mb-0.5 tracking-tight">{title}</span>
            <span className="text-[10px] text-[#5B6B7F] font-light">รวม {totalVal.toLocaleString()} คน</span>
          </div>
          {icon && (
            <div className="p-1.5 bg-[#F4F7FC] group-hover:bg-[#2F6FE4]/8 text-[#5B6B7F] group-hover:text-[#2F6FE4] rounded-lg transition-colors duration-300 shrink-0">
              {icon}
            </div>
          )}
        </div>
        
        <div className="h-32 w-full my-3 flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={50}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", fontSize: "11px", color: "#FFFFFF", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)" }}
                itemStyle={{ color: "#E2E8F0" }}
                labelStyle={{ color: "#94A3B8" }}
                formatter={(value) => [`${value} คน`, "จำนวน"]}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Centered label inside donut chart */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-sm font-medium tracking-tight text-[#1F2D3D] leading-none" style={{ color: maxItem.color }}>
              {maxPct}%
            </span>
            <span className="text-[8px] text-[#5B6B7F] max-w-[54px] truncate text-center font-normal leading-tight mt-1" title={centerLabel}>
              {centerLabel}
            </span>
          </div>
        </div>

        {/* Proportional Segmented Progress Bar */}
        <div className="w-full bg-[#F4F7FC] rounded-full h-2 flex overflow-hidden my-2.5 border border-[#E2ECF5]/40 shadow-inner shrink-0">
          {data.map((item, idx) => {
            const pct = totalVal > 0 ? (item.value / totalVal) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={idx}
                style={{ width: `${pct}%`, backgroundColor: item.color }}
                className="h-full transition-all duration-500 hover:opacity-90 cursor-pointer"
                title={`${item.name}: ${item.value.toLocaleString()} คน (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        <div className="space-y-1.5 pt-2 border-t border-[#DCE6F2]/40">
          {data.map((item, idx) => {
            const pct = totalVal > 0 ? Math.round((item.value / totalVal) * 100) : 0;
            return (
              <div key={idx} className="flex justify-between items-center text-[10px]">
                <span className="flex items-center gap-1.5 text-[#5B6B7F] truncate">
                  <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-medium text-[#1F2D3D] shrink-0">
                  {item.value.toLocaleString()} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const kpiClicks: Record<string, () => void> = {
    "พนักงานประจำ": () => {
      onSetFilters(prev => ({
        ...prev,
        contractType: prev.contractType === "พนักงานประจำ" ? "All" : "พนักงานประจำ"
      }));
    },
    "พนักงานสัญญาจ้าง": () => {
      onSetFilters(prev => ({
        ...prev,
        contractType: prev.contractType === "พนักงานสัญญาจ้าง" ? "All" : "พนักงานสัญญาจ้าง"
      }));
    },
    "กำลังกลุ่มเตรียมเกษียณ": () => {
      onSetFilters(prev => ({
        ...prev,
        retirementRisk: prev.retirementRisk === "r5" ? "All" : "r5"
      }));
    },
    "ผู้ปฏิบัติงานผลงานโดดเด่น": () => {
      onSetFilters(prev => ({
        ...prev,
        performanceRating: prev.performanceRating === "High Performer" ? "All" : "High Performer"
      }));
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION A: KPI Summary (Consolidated to 3 main Cards to reduce clutter) */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#DCE6F2]/40">
          <div className="w-1 h-5 bg-[#2F6FE4] rounded-full" />
          <div>
            <h3 className="text-sm font-semibold text-[#1F2D3D]">สรุปดัชนีชี้วัดหลักกำลังพล (Executive KPI Snapshot)</h3>
            <p className="text-[11px] text-[#5B6B7F] mt-0.5">ภาพรวมสถิติกำลังพลหลักที่จัดกลุ่มเป็นหมวดหมู่ความสำคัญอย่างเป็นระบบ (คลิกเพื่อจัดกรองตาราง)</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="kpi-cards-grid">
          {/* Card 1: Workforce & Contracts Snapshot */}
          <div className="bg-white border border-[#DCE6F2]/80 rounded-2xl p-5.5 flex flex-col justify-between hover-card-premium relative overflow-hidden pl-6 shadow-sm">
            <div className="absolute left-0 top-0 bottom-0 w-1.2 bg-[#2F6FE4]" />
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">กำลังคนรวมทั้งหมด</span>
                <span className="text-3xl font-extrabold text-[#1F2D3D] mt-1.5 block tracking-tight leading-none">
                  {totalCount.toLocaleString()} <span className="text-xs font-normal text-[#5B6B7F]">คน</span>
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#2F6FE4]/8 text-[#2F6FE4] hover-glow-blue transition-all">
                <Users size={18} />
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-[#DCE6F2]/40 space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 block mb-1">สัดส่วนประเภทสัญญา (คลิกเพื่อกรอง):</span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => kpiClicks["พนักงานประจำ"]()}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer select-none ${
                    activeFilters.contractType === "พนักงานประจำ"
                      ? "bg-blue-50/80 border-[#2F6FE4] text-[#2F6FE4] font-semibold shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:text-[#2F6FE4]"
                  }`}
                >
                  <div className="text-[9px] text-slate-400 leading-none">พนักงานประจำ</div>
                  <div className="text-xs font-bold mt-1 text-slate-800">{permanentCount.toLocaleString()} คน</div>
                  <div className="text-[8.5px] mt-0.5 text-slate-400 font-normal">สัดส่วน {totalCount > 0 ? Math.round((permanentCount/totalCount)*100) : 0}%</div>
                </button>
                
                <button
                  onClick={() => kpiClicks["พนักงานสัญญาจ้าง"]()}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer select-none ${
                    activeFilters.contractType === "พนักงานสัญญาจ้าง"
                      ? "bg-blue-50/80 border-[#25B7D3] text-[#25B7D3] font-semibold shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:border-cyan-200 hover:text-[#25B7D3]"
                  }`}
                >
                  <div className="text-[9px] text-slate-400 leading-none">สัญญาจ้าง</div>
                  <div className="text-xs font-bold mt-1 text-slate-800">{contractCount.toLocaleString()} คน</div>
                  <div className="text-[8.5px] mt-0.5 text-slate-400 font-normal">สัดส่วน {totalCount > 0 ? Math.round((contractCount/totalCount)*100) : 0}%</div>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Workforce Stability & Health */}
          <div className="bg-white border border-[#DCE6F2]/80 rounded-2xl p-5.5 flex flex-col justify-between hover-card-premium relative overflow-hidden pl-6 shadow-sm">
            <div className="absolute left-0 top-0 bottom-0 w-1.2 bg-[#2DBE7F]" />
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ความมั่นคงและเสถียรภาพ</span>
                <span className="text-3xl font-extrabold text-[#1F2D3D] mt-1.5 block tracking-tight leading-none">
                  {averageTenure} <span className="text-xs font-normal text-[#5B6B7F]">ปี (อายุงานเฉลี่ย)</span>
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#2DBE7F]/8 text-[#2DBE7F] hover-glow-emerald transition-all">
                <Calendar size={18} />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#DCE6F2]/40 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">อัตราการลาออกสะสม (YTD):</span>
                <span className="font-extrabold text-[#F36B6B] bg-red-50 px-2 py-0.5 rounded-md text-[11px] border border-red-100">
                  {turnoverRate}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div style={{ width: `${Math.min(100, (turnoverRate / 10) * 100)}%` }} className="bg-gradient-to-r from-[#2DBE7F] to-[#F36B6B] h-full rounded-full" />
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 font-medium">อายุเฉลี่ยพนักงาน:</span>
                <span className="font-bold text-slate-700 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-[11px]">{averageAge} ปี</span>
              </div>
            </div>
          </div>

          {/* Card 3: Strategic Talent & Demographics */}
          <div className="bg-white border border-[#DCE6F2]/80 rounded-2xl p-5.5 flex flex-col justify-between hover-card-premium relative overflow-hidden pl-6 shadow-sm">
            <div className="absolute left-0 top-0 bottom-0 w-1.2 bg-[#FFB547]" />
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">กลุ่มเป้าหมายเชิงยุทธศาสตร์</span>
                <p className="text-[10px] text-[#5B6B7F] mt-0.5">กรองตามเงื่อนไขเพื่อการสืบทอดและพัฒนา</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FFB547]/8 text-[#FFB547] transition-all">
                <Award size={18} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button
                onClick={() => kpiClicks["กำลังกลุ่มเตรียมเกษียณ"]()}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer select-none ${
                  activeFilters.retirementRisk === "r5"
                    ? "bg-amber-50/70 border-[#FFB547] text-amber-800 font-semibold shadow-2xs"
                    : "bg-white border-slate-200 text-slate-600 hover:border-amber-200 hover:text-amber-800"
                }`}
              >
                <div className="text-[9px] text-slate-400 leading-none">กลุ่มเตรียมเกษียณ</div>
                <div className="text-xs font-bold mt-1 text-slate-800">{seniorCount.toLocaleString()} คน</div>
                <div className="text-[8.5px] mt-0.5 text-slate-400 font-normal">อายุ 55 ปีขึ้นไป (r5)</div>
              </button>

              <button
                onClick={() => kpiClicks["ผู้ปฏิบัติงานผลงานโดดเด่น"]()}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer select-none ${
                  activeFilters.performanceRating === "High Performer"
                    ? "bg-emerald-50/70 border-[#2DBE7F] text-[#2DBE7F] font-semibold shadow-2xs"
                    : "bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-[#2DBE7F]"
                }`}
              >
                <div className="text-[9px] text-slate-400 leading-none">พนักงานผลงานเลิศ</div>
                <div className="text-xs font-bold mt-1 text-slate-800">
                  {employees.filter(e => e.performanceRating === "High Performer").length.toLocaleString()} คน
                </div>
                <div className="text-[8.5px] mt-0.5 text-slate-400 font-normal">ดาวเด่น (High)</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: Workforce Composition Charts (Consolidated to a tabbed interactive Card) */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#DCE6F2]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 bg-[#2F6FE4] rounded-full" />
            <div>
              <h3 className="text-sm font-semibold text-[#1F2D3D]">สัดส่วนและลักษณะโครงสร้างกำลังคน (Workforce Composition Profiles)</h3>
              <p className="text-[11px] text-[#5B6B7F] mt-0.5">สถิติและสัดส่วนโครงสร้างกำลังคนในมิติต่างๆ แบบโต้ตอบได้เพื่อการบริหารเชิงยุทธศาสตร์</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5 bg-[#F4F7FC] p-1 rounded-xl border border-slate-200/50">
            {[
              { id: "contract", label: "ประเภทสัญญา" },
              { id: "hb", label: "สำนักงานใหญ่ / สาขา" },
              { id: "fb", label: "Front / Back Office" },
              { id: "gender", label: "สัดส่วนเพศ" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDonutTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeDonutTab === tab.id
                    ? "bg-white text-[#2F6FE4] shadow-xs border border-slate-200/20 font-bold"
                    : "text-[#5B6B7F] hover:text-[#2F6FE4]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" id="section-b-content-grid">
          {/* Left: Donut Chart representation */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[220px]" id="section-b-donut-container">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={
                    activeDonutTab === "contract"
                      ? contractDonutData
                      : activeDonutTab === "hb"
                      ? hbDonutData
                      : activeDonutTab === "fb"
                      ? fbDonutData
                      : genderDonutData
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(activeDonutTab === "contract"
                    ? contractDonutData
                    : activeDonutTab === "hb"
                    ? hbDonutData
                    : activeDonutTab === "fb"
                    ? fbDonutData
                    : genderDonutData
                  ).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", fontSize: "11px", color: "#FFFFFF", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)" }}
                  itemStyle={{ color: "#E2E8F0" }}
                  labelStyle={{ color: "#94A3B8" }}
                  formatter={(value) => [`${value} คน`, "จำนวน"]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-[#1F2D3D] tracking-tight">
                {totalCount.toLocaleString()}
              </span>
              <span className="text-[8px] text-[#5B6B7F] font-bold tracking-wider uppercase mt-0.5">กำลังพลรวม</span>
            </div>
          </div>

          {/* Right: Detailed Breakdown Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4" id="section-b-breakdown-grid">
            {(activeDonutTab === "contract"
              ? contractDonutData
              : activeDonutTab === "hb"
              ? hbDonutData
              : activeDonutTab === "fb"
              ? fbDonutData
              : genderDonutData
            ).map((item, idx) => {
              const pct = totalCount > 0 ? Math.round((item.value / totalCount) * 100) : 0;
              return (
                <div 
                  key={idx} 
                  className="p-4 rounded-2xl border border-slate-100 bg-[#F8FAFC]/50 hover:bg-white hover:border-slate-200 hover:shadow-xs transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-[#344054]">{item.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-baseline mt-4">
                    <span className="text-lg font-black text-slate-800">
                      {item.value.toLocaleString()} <span className="text-xs font-normal text-slate-400">คน</span>
                    </span>
                    <span className="text-sm font-bold text-slate-600">
                      {pct}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2 border border-slate-200/20">
                    <div style={{ width: `${pct}%`, backgroundColor: item.color }} className="h-full rounded-full" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    <div className="space-y-6" id="redesigned-analytics-sections">
        
        {/* Row 1: Workforce Structure & Performance Profiles */}
        <div id="workforce-structure-performance-section" className="bg-white border border-[#DCE6F2] rounded-2xl p-6.5 shadow-sm hover:shadow-md transition-all duration-300">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#DCE6F2]/40" id="row1-header">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 bg-[#2F6FE4] rounded-full" />
              <div>
                <h3 className="text-sm font-semibold text-[#1F2D3D]">1. โครงสร้างระดับงานและผลการปฏิบัติงาน (Workforce Structure & Performance Profiles)</h3>
                <p className="text-[11px] text-[#5B6B7F] mt-0.5">วิเคราะห์สัดส่วนระดับพนักงานและทักษะขีดความสามารถ ร่วมกับสถิติระดับผลประเมินประจำปี</p>
              </div>
            </div>
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8" id="row1-grid">
            {/* Column 1: Level Distribution (L1-L13) */}
            <div className="xl:col-span-7 flex flex-col justify-between" id="level-distribution-card">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F6FE4]" />
                  <span className="text-xs font-semibold text-[#344054]">การแจกแจงตามระดับตำแหน่ง (Level Distribution)</span>
                </div>
                <p className="text-[11px] text-[#5B6B7F] mb-4">แสดงปริมาณกำลังพลและสัดส่วนของแต่ละกลุ่มระดับขั้นตำแหน่งภายในองค์กรอย่างชัดเจน</p>
                
                <div className="h-[280px] w-full" id="level-distribution-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={levelChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 35, left: -10, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="barHighGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#1E52B6" />
                          <stop offset="100%" stopColor="#2F6FE4" />
                        </linearGradient>
                        <linearGradient id="barMidGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#0D9488" />
                          <stop offset="100%" stopColor="#25B7D3" />
                        </linearGradient>
                        <linearGradient id="barLowGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#475569" />
                          <stop offset="100%" stopColor="#94A3B8" />
                        </linearGradient>
                        <linearGradient id="vertPurpleGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6D28D9" />
                          <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid horizontal={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                      <XAxis type="number" stroke="#8898AA" fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis dataKey="shortName" type="category" stroke="#344054" fontSize={9} fontWeight={600} tickLine={false} axisLine={false} width={85} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", fontSize: "11px", color: "#FFFFFF", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)" }}
                        itemStyle={{ color: "#E2E8F0" }}
                        labelStyle={{ color: "#94A3B8" }}
                        formatter={(value, name, props) => [`${value} คน`, props.payload.fullName]}
                      />
                      <Bar dataKey="จำนวนคน" radius={[0, 4, 4, 0]} barSize={12}>
                        {levelChartData.map((entry, index) => {
                          const name = entry.name;
                          let color = "url(#barLowGrad)";
                          if (name.includes("13") || name.includes("12") || name.includes("11")) color = "url(#barHighGrad)";
                          else if (name.includes("10") || name.includes("9")) color = "url(#barMidGrad)";
                          else if (name.includes("8") || name.includes("7")) color = "url(#vertPurpleGrad)";
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                        <LabelList dataKey="จำนวนคน" position="right" style={{ fill: "#1F2D3D", fontSize: 9, fontWeight: 700 }} offset={8} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-slate-100 text-[9px] text-slate-500 font-bold" id="level-chart-legends">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2F6FE4]" />
                  <span>บริหารสูง (L11-13)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#25B7D3]" />
                  <span>บริหารกลาง (L9-10)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                  <span>หัวหน้างาน (L7-8)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" />
                  <span>ผู้ปฏิบัติการ (L6ลงไป)</span>
                </div>
              </div>
            </div>

            {/* Column 2: Performance Distribution (Donut & Breakdown) */}
            <div className="xl:col-span-5 flex flex-col justify-between border-l border-slate-100 xl:pl-6" id="performance-distribution-card">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2DBE7F]" />
                  <span className="text-xs font-semibold text-[#344054]">สัดส่วนระดับผลการประเมิน (Performance Evaluation)</span>
                </div>
                <p className="text-[11px] text-[#5B6B7F] mb-4">สัดส่วนบุคลากรศักยภาพสูง (High Performer) เทียบกับผลการประเมินตามเกณฑ์มาตรฐาน</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-[250px] px-2" id="performance-donut-wrapper">
                  <div className="h-44 w-44 shrink-0 relative flex items-center justify-center" id="perf-piechart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={performanceDonutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={68}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {performanceDonutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", fontSize: "11px", color: "#FFFFFF", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)" }}
                          itemStyle={{ color: "#E2E8F0" }}
                          labelStyle={{ color: "#94A3B8" }}
                          formatter={(value) => [`${value} คน`, "จำนวน"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-[#1F2D3D] tracking-tight leading-none">
                        {totalCount.toLocaleString()}
                      </span>
                      <span className="text-[8px] text-[#5B6B7F] font-semibold tracking-wider uppercase mt-1">พนักงานรวม</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 w-full max-w-[220px]" id="performance-breakdown-list">
                    {performanceDonutData.map((p, idx) => {
                      const pct = totalCount > 0 ? Math.round((p.value / totalCount) * 100) : 0;
                      return (
                        <div key={idx} className="flex flex-col gap-1.5 p-2 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-2xs transition-all duration-300">
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-[#344054] truncate">
                              <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: p.color }} />
                              <span className="truncate">{p.name.split(" ")[0]}</span>
                            </span>
                            <span className="text-[10px] font-bold text-[#1F2D3D]">
                              {pct}% <span className="text-[9px] font-medium text-[#5B6B7F] ml-0.5">({p.value.toLocaleString()})</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div style={{ width: `${pct}%`, backgroundColor: p.color }} className="h-full rounded-full transition-all duration-500" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/20 border border-blue-100/50 rounded-xl p-2.5 mt-4 text-[10px] text-[#5B6B7F] leading-relaxed flex items-center gap-2" id="perf-strategic-card-note">
                <span className="text-xs">📈</span>
                <span>ระบบใช้ข้อมูลจากการประเมินผลงานล่าสุด โดยจำแนกตามมาตรฐาน 3 กลุ่มระดับขีดความสามารถ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2A: Redesigned Span of Control Panel */}
        <div id="span-of-control-section" className="bg-white border border-[#DCE6F2] rounded-2xl p-6.5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#DCE6F2]/40" id="row2-span-of-control-header">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-6 bg-[#8B5CF6] rounded-full" />
              <div>
                <h3 className="text-sm font-semibold text-[#1F2D3D]">2. สายการควบคุมและวิเคราะห์โครงสร้างพนักงาน (Span of Control & Tier Analytics)</h3>
                <p className="text-[11px] text-[#5B6B7F] mt-0.5">วิเคราะห์ขอบเขตการกำกับดูแล สัดส่วนโครงสร้างพนักงาน และสถิติเชิงลึกตามกลุ่มระดับพนักงานอย่างเรียบง่ายและเป็นระบบ</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/40">
                HEADCOUNT: {totalCount.toLocaleString()} คน
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Key metrics & gauges */}
            <div className="lg:col-span-5 space-y-5" id="span-of-control-left-col">
              {/* Span of Control circular badge layout */}
              <div id="span-of-control-gauge-card" className="bg-gradient-to-br from-purple-50/20 via-white to-white border border-purple-100/80 rounded-2xl p-5 hover:border-purple-200 hover:shadow-xs transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100/20 rounded-full blur-xl pointer-events-none" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Span of Control (สัดส่วนดูแลเฉลี่ย)</span>
                
                <div className="flex items-center gap-5 mt-4">
                  {/* Gauge indicator using stylized CSS */}
                  <div className="relative w-16 h-16 rounded-full border-4 border-purple-100 flex items-center justify-center shrink-0 shadow-inner bg-white">
                    <div className="absolute inset-1 rounded-full border-2 border-dashed border-purple-200/60" />
                    <span className="text-xs font-black text-[#8B5CF6]">1 : {Math.round(parseFloat(managementData.spanOfControl))}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-800">1 : {managementData.spanOfControl}</span>
                      <span className="text-[9px] bg-purple-100/60 text-[#8B5CF6] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        {parseFloat(managementData.spanOfControl) < 5 ? "โครงสร้างลึก (Narrow)" : parseFloat(managementData.spanOfControl) <= 10 ? "สมดุล (Balanced)" : "แบนราบ (Flat)"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5B6B7F] leading-relaxed font-light">
                      ผู้บริหาร 1 คนรับผิดชอบดูแลและตัดสินใจร่วมกับทีมปฏิบัติการเฉลี่ย {managementData.spanOfControl} คน เพื่อความกระชับและว่องไวขององค์กร
                    </p>
                  </div>
                </div>
              </div>

              {/* Management vs Staff progress with actual stats */}
              <div id="span-of-control-managers-staff-card" className="bg-gradient-to-br from-blue-50/10 via-white to-white border border-blue-100/80 rounded-2xl p-5 hover:border-blue-200 hover:shadow-xs transition-all duration-300">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">สัดส่วนผู้บริหาร vs ผู้ปฏิบัติการ</span>
                  <span className="text-[10px] text-[#2F6FE4] bg-blue-50 border border-blue-100/60 px-2.5 py-0.5 rounded-full font-bold">
                    ฝ่ายจัดการ {Math.round(totalCount > 0 ? (managementData.managers / totalCount) * 100 : 0)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 my-2.5">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-3xs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">ฝ่ายจัดการ (L9-13)</span>
                    <span className="text-lg font-black text-[#2F6FE4] block mt-0.5">{managementData.managers.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">คน</span></span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-3xs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">ผู้ปฏิบัติการ (L1-8)</span>
                    <span className="text-lg font-black text-[#4C8DFF] block mt-0.5">{managementData.staff.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">คน</span></span>
                  </div>
                </div>

                {(() => {
                  const managerPct = totalCount > 0 ? (managementData.managers / totalCount) * 100 : 0;
                  const staffPct = totalCount > 0 ? (managementData.staff / totalCount) * 100 : 0;
                  return (
                    <div className="space-y-1.5 mt-4">
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex border border-slate-200/20">
                        <div style={{ width: `${managerPct}%` }} className="bg-[#2F6FE4] h-full transition-all duration-500" />
                        <div style={{ width: `${staffPct}%` }} className="bg-[#4C8DFF] h-full transition-all duration-500" />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                        <span>กลุ่มผู้บริหารและผู้นำ: {Math.round(managerPct)}%</span>
                        <span>ทีมงานฝ่ายปฏิบัติงาน: {Math.round(staffPct)}%</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right Column: Interactive Tier Selection + Detail Panel */}
            <div className="lg:col-span-7 space-y-4" id="span-of-control-right-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">กลุ่มระดับพนักงาน (คลิกเพื่อดูสถิติเจาะลึกรายกลุ่ม)</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" id="span-of-control-legend-boxes-new">
                {[
                  { id: "high", name: "บริหารสูง", count: managementTiers.high, pct: totalCount > 0 ? Math.round((managementTiers.high / totalCount) * 100) : 0, color: "#2F6FE4", bg: "border-blue-100 hover:bg-blue-50/20", activeBg: "bg-blue-50/50 border-[#2F6FE4] ring-2 ring-[#2F6FE4]/10", levels: "L11 - L13" },
                  { id: "mid", name: "บริหารกลาง", count: managementTiers.mid, pct: totalCount > 0 ? Math.round((managementTiers.mid / totalCount) * 100) : 0, color: "#25B7D3", bg: "border-cyan-100 hover:bg-cyan-50/20", activeBg: "bg-cyan-50/50 border-[#25B7D3] ring-2 ring-[#25B7D3]/10", levels: "L9 - L10" },
                  { id: "lead", name: "หัวหน้างาน", count: managementTiers.lead, pct: totalCount > 0 ? Math.round((managementTiers.lead / totalCount) * 100) : 0, color: "#8B5CF6", bg: "border-purple-100 hover:bg-purple-50/20", activeBg: "bg-purple-50/50 border-[#8B5CF6] ring-2 ring-[#8B5CF6]/10", levels: "L7 - L8" },
                  { id: "staff", name: "ผู้ปฏิบัติการ", count: managementTiers.staff, pct: totalCount > 0 ? Math.round((managementTiers.staff / totalCount) * 100) : 0, color: "#94A3B8", bg: "border-slate-200 hover:bg-slate-50", activeBg: "bg-slate-50 border-slate-400 ring-2 ring-slate-400/10", levels: "L6 ลงไป" }
                ].map((tier) => {
                  const isActive = activeTierDetail === tier.id;
                  return (
                    <button
                      key={tier.id}
                      onClick={() => setActiveTierDetail(tier.id as any)}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                        isActive ? tier.activeBg : `bg-white ${tier.bg}`
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block leading-none">{tier.levels}</span>
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mt-1">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tier.color }} />
                          {tier.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline mt-4 w-full">
                        <span className="text-base font-black text-slate-800">{tier.count.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">คน</span></span>
                        <span className="text-[11px] font-bold text-slate-500">{tier.pct}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Insight Card for Selected Tier */}
              {(() => {
                const tierInfoMap = {
                  high: {
                    title: "กลุ่มบริหารระดับสูง (Senior Executives)",
                    levels: "L11, L12, L13",
                    desc: "รับผิดชอบด้านการวางแผนยุทธศาสตร์องค์กรในระยะยาว กำหนดทิศทางการขับเคลื่อนธุรกิจ ตัดสินใจเชิงนโยบายการจัดสรรเงินทุน และการลงทุนระดับเมกะโปรเจกต์ของธนาคาร",
                    stats: getCohortStats(employees.filter(e => e.level.includes("13") || e.level.includes("12") || e.level.includes("11"))),
                    color: "#2F6FE4",
                    bgAccent: "bg-blue-50/20 border-blue-100"
                  },
                  mid: {
                    title: "กลุ่มบริหารระดับกลาง (Middle Management)",
                    levels: "L9, L10",
                    desc: "ควบคุมดูแลการบริหารงานส่วนกลาง ฝ่าย หรือสำนักงานสาขาเขต ทำหน้าที่แปลงทิศทางนโยบายของผู้บริหารระดับสูงลงไปเป็นเป้าหมายทีมงาน จัดการประสานงานต่างแผนก และควบคุมทรัพยากร",
                    stats: getCohortStats(employees.filter(e => e.level.includes("10") || e.level.includes("9"))),
                    color: "#25B7D3",
                    bgAccent: "bg-cyan-50/20 border-cyan-100"
                  },
                  lead: {
                    title: "กลุ่มหัวหน้างาน (Supervisors & Leads)",
                    levels: "L7, L8",
                    desc: "กำกับและผลักดันยอดปฏิบัติงานรายวัน ตรวจสอบความถูกต้อง ติดตามความคืบหน้าระดับโครงการย่อย ช่วยสอนงานพัฒนาพนักงาน และมีบทบาทสำคัญในการแก้ไขปัญหาหน้างานเฉพาะหน้า",
                    stats: getCohortStats(employees.filter(e => e.level.includes("8") || e.level.includes("7"))),
                    color: "#8B5CF6",
                    bgAccent: "bg-purple-50/20 border-purple-100"
                  },
                  staff: {
                    title: "กลุ่มผู้ปฏิบัติงาน (Operational Staff)",
                    levels: "L1 ถึง L6",
                    desc: "พนักงานหน้าด่านที่รับหน้าที่ให้บริการลูกค้าโดยตรง งานธุรการระบบฐานข้อมูลหลัก งานสนับสนุนความพึงพอใจลูกค้า และกิจกรรมหลักของธนาคารตามมาตรฐานการทำงานขั้นพื้นฐาน",
                    stats: getCohortStats(employees.filter(e => !e.level.includes("13") && !e.level.includes("12") && !e.level.includes("11") && !e.level.includes("10") && !e.level.includes("9") && !e.level.includes("8") && !e.level.includes("7"))),
                    color: "#94A3B8",
                    bgAccent: "bg-slate-50 border-slate-200"
                  }
                };

                const activeInfo = tierInfoMap[activeTierDetail];
                return (
                  <div className={`p-5 rounded-2xl border ${activeInfo.bgAccent} transition-all duration-300 space-y-4 bg-white/60`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/50">
                      <div>
                        <h4 className="text-xs font-bold text-[#1F2D3D] flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: activeInfo.color }} />
                          {activeInfo.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">ประกอบด้วยระดับพนักงานหลัก: {activeInfo.levels}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200/60 px-2.5 py-1 rounded-xl">
                        หน้าที่และบทบาทสำคัญ
                      </span>
                    </div>

                    <p className="text-xs text-[#5B6B7F] leading-relaxed font-light">{activeInfo.desc}</p>

                    {/* Stats Metrics Grid */}
                    <div className="grid grid-cols-3 gap-3 pt-1">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex flex-col justify-between hover:shadow-2xs transition-all duration-300">
                        <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                          อายุเฉลี่ย
                        </span>
                        <span className="text-sm font-black text-slate-800 mt-1">{activeInfo.stats.avgAge} <span className="text-[10px] font-normal text-slate-400">ปี</span></span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex flex-col justify-between hover:shadow-2xs transition-all duration-300">
                        <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                          อายุงานเฉลี่ย
                        </span>
                        <span className="text-sm font-black text-slate-800 mt-1">{activeInfo.stats.avgTenure} <span className="text-[10px] font-normal text-slate-400">ปี</span></span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex flex-col justify-between hover:shadow-2xs transition-all duration-300">
                        <span className="text-[9px] text-[#2DBE7F] font-bold uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2DBE7F] shrink-0" />
                          สัดส่วนดาวเด่น
                        </span>
                        <span className="text-sm font-black text-emerald-600 mt-1">{activeInfo.stats.highPerfPct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Row 2B: Redesigned Retirement Outlook Panel */}
        <div id="retirement-outlook-section" className="bg-white border border-[#DCE6F2] rounded-2xl p-6.5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#DCE6F2]/40" id="row2-retirement-header">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 bg-[#EF4444] rounded-full" />
              <div>
                <h3 className="text-sm font-semibold text-[#1F2D3D]">3. พยากรณ์คลื่นลูกใหม่และการเกษียณอายุ (Succession & Retirement Planning)</h3>
                <p className="text-[11px] text-[#5B6B7F] mt-0.5">การคาดการณ์บุคลากรที่จะเกษียณอายุเพื่อวางแผนจัดสรรผู้สืบทอดตำแหน่งและรักษาความต่อเนื่องในการบริหารงาน</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Retirement Timeline risks */}
            <div className="lg:col-span-4 space-y-4" id="retirement-left-col">
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3" id="retirement-warning-grid-new">
                {[
                  { id: "retirement-warning-critical-new", name: "วิกฤต (ใน 1 ปี / อายุ 59)", count: retirementForecast.r1, color: "#EF4444", bg: "bg-red-50/50 border-red-100", label: "ต้องการผู้สืบทอดทันที" },
                  { id: "retirement-warning-alert-new", name: "เฝ้าระวัง (ใน 3 ปี / อายุ 57+)", count: retirementForecast.r3, color: "#F59E0B", bg: "bg-amber-50/50 border-amber-100", label: "จัดเตรียมกลุ่ม Talent" },
                  { id: "retirement-warning-plan-new", name: "เตรียมการ (ใน 5 ปี / อายุ 55+)", count: retirementForecast.r5, color: "#3B82F6", bg: "bg-blue-50/50 border-blue-100", label: "เริ่มประเมินศักยภาพ" }
                ].map((risk) => (
                  <div key={risk.id} id={risk.id} className={`p-4 rounded-2xl border ${risk.bg} flex items-center justify-between gap-3 hover:shadow-xs transition-all duration-300`}>
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-bold text-slate-500 block leading-tight">{risk.name}</span>
                      <span className="text-[9px] font-bold text-slate-400 block">{risk.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-slate-800 block">
                        {risk.count.toLocaleString()} <span className="text-xs font-normal text-slate-400">คน</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Column Chart and Suggestion Box */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4" id="retirement-right-col">
              <div className="h-[180px] w-full" id="retirement-chart-container-new">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={retirementBarData}
                    margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="vertRedGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F87171" />
                        <stop offset="100%" stopColor="#EF4444" />
                      </linearGradient>
                      <linearGradient id="vertAmberGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FBBF24" />
                        <stop offset="100%" stopColor="#F59E0B" />
                      </linearGradient>
                      <linearGradient id="vertBlueGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#8898AA" fontSize={8} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8898AA" fontSize={8} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", fontSize: "11px", color: "#FFFFFF", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)" }}
                      itemStyle={{ color: "#E2E8F0" }}
                      labelStyle={{ color: "#94A3B8" }}
                      formatter={(value) => [`${value} คน`, "จำนวนพนักงาน"]}
                    />
                    <Bar dataKey="จำนวนพนักงาน" radius={[4, 4, 0, 0]} barSize={32}>
                      {retirementBarData.map((entry, index) => {
                        let fill = "url(#vertBlueGrad2)";
                        if (index === 0) fill = "url(#vertRedGrad2)";
                        else if (index === 1) fill = "url(#vertAmberGrad2)";
                        return <Cell key={`cell-${index}`} fill={fill} />;
                      })}
                      <LabelList dataKey="จำนวนพนักงาน" position="top" style={{ fill: "#1F2D3D", fontSize: 9, fontWeight: 700 }} offset={6} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Strategic Suggestion in a gorgeous premium panel */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3 hover:shadow-xs transition-all duration-300" id="retirement-strategic-recom-note-new">
                <span className="text-lg shrink-0">💡</span>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-800 block">ข้อเสนอแนะเชิงกลยุทธ์สืบทอดตำแหน่ง:</span>
                  <p className="text-[11px] text-[#5B6B7F] leading-relaxed font-light">
                    ควรเร่งดำเนินการจับคู่แผนพัฒนากลุ่มบุคลากรเตรียมพร้อมสืบทอดตำแหน่ง (Succession Pipeline) ควบคู่กับระบบส่งมอบงานล่วงหน้าอย่างน้อย 6-12 เดือน เพื่อลดความเสี่ยงจากการสูญเสียความรู้และรักษาเสถียรภาพการบริหารแผนกอย่างต่อเนื่อง
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION C: Executive Insights */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-[#DCE6F2]/50">
          <div className="w-1 h-5 bg-[#2F6FE4] rounded-full" />
          <div>
            <h3 className="text-sm font-medium text-[#1F2D3D]">ข้อมูลเชิงลึกและข้อเสนอแนะผู้บริหาร (Section C: Executive Insights & Recommendations)</h3>
            <p className="text-[11px] text-[#5B6B7F] mt-0.5">วิเคราะห์หาจุดสังเกต ประเมินความเสี่ยงและโอกาสเชิงยุทธศาสตร์เพื่อประกอบการตัดสินใจของฝ่ายบริหาร</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Risks */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DCE6F2]/30">
              <span className="p-1 bg-[#F36B6B]/10 text-[#F36B6B] rounded-lg">
                <ShieldAlert size={14} />
              </span>
              <span className="text-xs font-medium text-[#1F2D3D]">ความเสี่ยงที่ต้องเฝ้าระวัง (Risks & Flags)</span>
            </div>
            {executiveHighlights.risks.length === 0 ? (
              <p className="text-xs text-[#5B6B7F] font-light italic">ไม่พบประเด็นความเสี่ยงรุนแรงภายใต้เงื่อนไขปัจจุบัน</p>
            ) : (
              <div className="space-y-3">
                {executiveHighlights.risks.map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${item.bg} space-y-2`}>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">{item.icon}</span>
                      <span className={`text-xs font-medium ${item.labelColor}`}>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-[#5B6B7F] leading-relaxed font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Opportunities */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DCE6F2]/30">
              <span className="p-1 bg-[#2DBE7F]/10 text-[#2DBE7F] rounded-lg">
                <Award size={14} />
              </span>
              <span className="text-xs font-medium text-[#1F2D3D]">โอกาสการพัฒนาองค์กร (Opportunities)</span>
            </div>
            {executiveHighlights.opportunities.length === 0 ? (
              <p className="text-xs text-[#5B6B7F] font-light italic">ไม่พบโอกาสเพิ่มเติมในกลุ่มข้อมูลปัจจุบัน</p>
            ) : (
              <div className="space-y-3">
                {executiveHighlights.opportunities.map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${item.bg} space-y-2`}>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">{item.icon}</span>
                      <span className={`text-xs font-medium ${item.labelColor}`}>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-[#5B6B7F] leading-relaxed font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 3: Recommendations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DCE6F2]/30">
              <span className="p-1 bg-[#2F6FE4]/10 text-[#2F6FE4] rounded-lg">
                <Calendar size={14} />
              </span>
              <span className="text-xs font-medium text-[#1F2D3D]">ข้อเสนอเชิงยุทธศาสตร์ (Strategic Actions)</span>
            </div>
            {executiveHighlights.recommendations.length === 0 ? (
              <p className="text-xs text-[#5B6B7F] font-light italic">ไม่พบข้อเสนอแนะเพิ่มเติมในกลุ่มข้อมูลปัจจุบัน</p>
            ) : (
              <div className="space-y-3">
                {executiveHighlights.recommendations.map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${item.bg} space-y-2`}>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">{item.icon}</span>
                      <span className={`text-xs font-medium ${item.labelColor}`}>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-[#5B6B7F] leading-relaxed font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION D: Detailed Explorer / Table */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-[#DCE6F2]/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#2F6FE4]/8 text-[#2F6FE4] rounded-xl shrink-0">
              <Search size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#1F2D3D]">ทำเนียบรายชื่อและตัวค้นหาข้อมูลบุคลากร (Section D: Detailed Employee Explorer)</h3>
              <p className="text-[11px] text-[#5B6B7F] mt-0.5">ค้นหาข้อมูลรายบุคคล ตรวจสอบรายชื่อตามประเภทสัญญา และระดับผลประเมินผลงานสำหรับผู้บริหาร</p>
            </div>
          </div>
        </div>

        {/* Search & Inline Filters bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="relative w-full md:max-w-xs">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6B7F]" />
            <input
              type="text"
              placeholder="ค้นหารหัส, ชื่อ, หรือตำแหน่ง..."
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

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-[#5B6B7F]">ประเภทสัญญา:</span>
              <div className="flex bg-[#F4F7FC] p-0.5 rounded-lg border border-slate-200/50">
                {(["All", "พนักงานประจำ", "พนักงานสัญญาจ้าง"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
                      typeFilter === t
                        ? "bg-white text-[#2F6FE4] shadow-xs border border-slate-200/20"
                        : "text-[#5B6B7F] hover:text-[#2F6FE4]"
                    }`}
                  >
                    {t === "All" ? "ทั้งหมด" : t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-[#5B6B7F]">ผลงาน:</span>
              <div className="flex bg-[#F4F7FC] p-0.5 rounded-lg border border-slate-200/50">
                {(["All", "High", "Meets", "Needs"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPerfFilter(p)}
                    className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
                      perfFilter === p
                        ? "bg-white text-[#2F6FE4] shadow-xs border border-slate-200/20"
                        : "text-[#5B6B7F] hover:text-[#2F6FE4]"
                    }`}
                  >
                    {p === "All" ? "ทั้งหมด" : p === "High" ? "High" : p === "Meets" ? "Meets" : "Needs"}
                  </button>
                ))}
              </div>
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
                  <th className="py-3 px-4">ประเภทสัญญา</th>
                  <th className="py-3 px-4">ผลประเมิน</th>
                  <th className="py-3 px-4 text-center">อายุงาน / อายุตัว</th>
                  <th className="py-3 px-4 text-center">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6F2]/50 bg-white">
                {paginatedTableData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-xs text-[#5B6B7F] italic">
                      ไม่พบข้อมูลตรงตามเงื่อนไขที่กำหนด
                    </td>
                  </tr>
                ) : (
                  paginatedTableData.map((emp) => (
                    <tr key={emp.empId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#5B6B7F]">{emp.empId}</td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-[#1F2D3D]">{emp.name}</div>
                        <div className="text-[10px] text-[#5B6B7F] font-light mt-0.5">{emp.nameEn}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-[#1F2D3D] truncate max-w-[200px]">{emp.position}</div>
                        <div className="text-[10px] text-[#5B6B7F] font-medium mt-0.5">{emp.level}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#5B6B7F]">{emp.contractType}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium leading-none ${
                            emp.performanceRating === "High Performer"
                              ? "bg-[#2DBE7F]/10 text-[#2DBE7F]"
                              : emp.performanceRating === "Meets Standard"
                              ? "bg-[#FFB547]/10 text-[#FFB547]"
                              : "bg-[#F36B6B]/10 text-[#F36B6B]"
                          }`}
                        >
                          {emp.performanceRating === "High Performer"
                            ? "High Performer"
                            : emp.performanceRating === "Meets Standard"
                            ? "Meets Standard"
                            : "Needs Support"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-[#5B6B7F]">
                        {emp.tenure} ปี <span className="text-[10px] text-slate-300 mx-1">/</span> {emp.age} ปี
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
