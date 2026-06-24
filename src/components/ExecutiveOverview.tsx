/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Employee } from "../data/mockData";
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
  Sparkle
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
  CartesianGrid
} from "recharts";

interface ExecutiveOverviewProps {
  employees: Employee[];
  totalResignationsCount: number;
  onSelectEmployee: (emp: Employee) => void;
}

export default function ExecutiveOverview({
  employees,
  totalResignationsCount,
  onSelectEmployee,
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

  // Calculations based on filtered list (the parent filters applied to 'employees')
  const totalCount = employees.length;
  const permanentCount = employees.filter(e => e.contractType === "พนักงานประจำ").length;
  const contractCount = employees.filter(e => e.contractType === "พนักงานสัญญาจ้าง").length;

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

  // Performance distribution Donut Data
  const performanceDonutData = useMemo(() => {
    const high = employees.filter(e => e.performanceRating === "High Performer").length;
    const meets = employees.filter(e => e.performanceRating === "Meets Standard").length;
    const needs = employees.filter(e => e.performanceRating === "Needs Support").length;
    return [
      { name: "High Performer", value: high, color: "#2DBE7F" },
      { name: "Meets Standard", value: meets, color: "#FFB547" },
      { name: "Needs Support", value: needs, color: "#F36B6B" }
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
                contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", borderColor: "#DCE6F2", fontSize: "11px" }}
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

  const kpis = [
    {
      title: "จำนวนพนักงานทั้งหมด",
      value: totalCount.toLocaleString() + " คน",
      trend: "อัตราครองชีพสูงสุด",
      trendColor: "text-[#2F6FE4]",
      icon: <Users size={16} />,
      bg: "bg-[#2F6FE4]/8",
      text: "text-[#2F6FE4]",
      leftBar: "bg-[#2F6FE4]",
      subtext: "กำลังคนรวมที่ปฏิบัติการจริง"
    },
    {
      title: "พนักงานประจำ",
      value: permanentCount.toLocaleString() + " คน",
      trend: `สัดส่วน ${totalCount > 0 ? Math.round((permanentCount/totalCount)*100) : 0}% ของทั้งหมด`,
      trendColor: "text-[#4C8DFF]",
      icon: <UserCheck size={16} />,
      bg: "bg-[#4C8DFF]/8",
      text: "text-[#4C8DFF]",
      leftBar: "bg-[#4C8DFF]",
      subtext: "สัญญาหลักระยะยาวธนาคาร"
    },
    {
      title: "พนักงานสัญญาจ้าง",
      value: contractCount.toLocaleString() + " คน",
      trend: `สัดส่วน ${totalCount > 0 ? Math.round((contractCount/totalCount)*100) : 0}% ของทั้งหมด`,
      trendColor: "text-[#25B7D3]",
      icon: <Briefcase size={16} />,
      bg: "bg-[#25B7D3]/8",
      text: "text-[#25B7D3]",
      leftBar: "bg-[#25B7D3]",
      subtext: "กลุ่มโครงการเฉพาะกิจ"
    },
    {
      title: "อายุเฉลี่ยพนักงาน",
      value: averageAge + " ปี",
      trend: "สถิติมัธยฐานวัยทำงานต้น",
      trendColor: "text-[#FFB547]",
      icon: <Hourglass size={16} />,
      bg: "bg-[#FFB547]/8",
      text: "text-[#FFB547]",
      leftBar: "bg-[#FFB547]",
      subtext: "อายุเฉลี่ยกำลังคน"
    },
    {
      title: "อายุงานเฉลี่ย",
      value: averageTenure + " ปี",
      trend: "อัตราคงมั่นเกณฑ์ดี",
      trendColor: "text-[#2DBE7F]",
      icon: <Calendar size={16} />,
      bg: "bg-[#2DBE7F]/8",
      text: "text-[#2DBE7F]",
      leftBar: "bg-[#2DBE7F]",
      subtext: "เสถียรภาพความผูกพันองค์กร"
    },
    {
      title: "อัตราการลาออก (Turnover Rate)",
      value: `${turnoverRate}%`,
      trend: "เป้าหมายควบคุม < 10%",
      trendColor: "text-[#F36B6B]",
      icon: <TrendingDown size={16} />,
      bg: "bg-[#F36B6B]/8",
      text: "text-[#F36B6B]",
      leftBar: "bg-[#F36B6B]",
      subtext: "อัตราการลาออกสะสมในปีนี้"
    },
    {
      title: "กำลังกลุ่มเตรียมเกษียณ",
      value: seniorCount + " คน",
      trend: `สัดส่วน ${totalCount > 0 ? Math.round((seniorCount/totalCount)*100) : 0}% กลุ่มเสี่ยง`,
      trendColor: "text-[#F36B6B]",
      icon: <ShieldAlert size={16} />,
      bg: "bg-[#F36B6B]/8",
      text: "text-[#F36B6B]",
      leftBar: "bg-[#F36B6B]",
      subtext: "กลุ่มอายุ 55 ปีขึ้นไป"
    },
    {
      title: "ผู้ปฏิบัติงานผลงานโดดเด่น",
      value: employees.filter(e => e.performanceRating === "High Performer").length + " คน",
      trend: "กลุ่มดาวเด่นของธนาคาร",
      trendColor: "text-[#2DBE7F]",
      icon: <Award size={16} />,
      bg: "bg-[#2DBE7F]/8",
      text: "text-[#2DBE7F]",
      leftBar: "bg-[#2DBE7F]",
      subtext: "High Performer สะสม"
    }
  ];

  return (
    <div className="space-y-8">
      {/* SECTION A: KPI Summary */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-5 bg-[#2F6FE4] rounded-full" />
          <div>
            <h3 className="text-sm font-medium text-[#1F2D3D]">สรุปดัชนีชี้วัดหลักกำลังพล (Section A: Executive KPI Snapshot)</h3>
            <p className="text-[11px] text-[#5B6B7F] mt-0.5">ภาพรวมสถิติกำลังพล คัดกรองและประเมิลผลจำแนกรายหัวข้อเพื่อฝ่ายการจัดการ</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards-grid">
          {kpis.map((kpi, idx) => (
            <div 
              key={idx} 
              className="relative bg-white border border-[#DCE6F2] rounded-xl p-4 hover:shadow-xs hover:border-[#2F6FE4]/30 transition-all duration-300 flex flex-col justify-between overflow-hidden group pl-5 min-h-[105px]"
            >
              {/* Left vertical accent indicator bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${kpi.leftBar}`} />
              
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-medium text-[#5B6B7F] tracking-tight">{kpi.title}</span>
                <div className={`p-1.5 rounded-lg shrink-0 ${kpi.bg} ${kpi.text} transition-transform group-hover:scale-105 duration-300`}>
                  {kpi.icon}
                </div>
              </div>

              <div className="mt-2.5">
                <div className="text-xl font-light text-[#1F2D3D] leading-none tracking-normal">
                  {kpi.value}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`text-[10px] font-medium ${kpi.trendColor}`}>
                    {kpi.trend}
                  </span>
                  <span className="text-[9px] text-[#5B6B7F] font-light">
                    • {kpi.subtext}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION B: Workforce Composition Charts */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-5 bg-[#2F6FE4] rounded-full" />
          <div>
            <h3 className="text-sm font-medium text-[#1F2D3D]">สัดส่วนและลักษณะโครงสร้างกำลังคน (Section B: Workforce Composition Profiles)</h3>
            <p className="text-[11px] text-[#5B6B7F] mt-0.5">แสดงข้อมูลอัตรากำลังตามประเภทงาน จุดสังกัดหลัก และอัตราส่วนความหลากหลายเพื่อประสิทธิผลในการมอบนโยบาย</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderDonutChart("ประเภทการจ้างงาน (Regular vs Contract)", contractDonutData, <Briefcase size={14} />)}
          {renderDonutChart("พื้นที่การปฏิบัติงาน (HQ vs Branch)", hbDonutData, <MapPin size={14} />)}
          {renderDonutChart("กลุ่มสายงานหลัก (Front vs Back)", fbDonutData, <Cpu size={14} />)}
          {renderDonutChart("สัดส่วนเพศพนักงาน (Gender Diversity)", genderDonutData, <User size={14} />)}
        </div>

        {/* Executive Highlights Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 mt-5 border-t border-[#DCE6F2]/50 text-center">
          <div className="bg-[#F4F7FC]/60 rounded-xl p-3.5 border border-[#E2ECF5]/40 flex flex-col justify-center">
            <span className="text-[10px] text-[#5B6B7F] block uppercase tracking-wider font-medium">อัตราสัญญากลุ่มพนักงานประจำ</span>
            <span className="text-base font-medium text-[#2F6FE4] mt-1 block">
              {totalCount > 0 ? Math.round((permanentCount / totalCount) * 100) : 0}%
            </span>
            <span className="text-[9px] text-[#5B6B7F] mt-0.5 font-light">พนักงานประจำ {permanentCount.toLocaleString()} ท่าน</span>
          </div>
          <div className="bg-[#F4F7FC]/60 rounded-xl p-3.5 border border-[#E2ECF5]/40 flex flex-col justify-center">
            <span className="text-[10px] text-[#5B6B7F] block uppercase tracking-wider font-medium">ฝ่ายปฏิบัติการส่วนหน้า (Front)</span>
            <span className="text-base font-medium text-[#2DBE7F] mt-1 block">
              {totalCount > 0 ? Math.round((employees.filter(e => e.frontBack === "Front").length / totalCount) * 100) : 0}%
            </span>
            <span className="text-[9px] text-[#5B6B7F] mt-0.5 font-light">พนักงานบริการและตลาด {employees.filter(e => e.frontBack === "Front").length.toLocaleString()} ท่าน</span>
          </div>
          <div className="bg-[#F4F7FC]/60 rounded-xl p-3.5 border border-[#E2ECF5]/40 flex flex-col justify-center">
            <span className="text-[10px] text-[#5B6B7F] block uppercase tracking-wider font-medium">กำลังพลสาขาภูมิภาค (Branch)</span>
            <span className="text-base font-medium text-[#25B7D3] mt-1 block">
              {totalCount > 0 ? Math.round((employees.filter(e => e.hb === "Branch").length / totalCount) * 100) : 0}%
            </span>
            <span className="text-[9px] text-[#5B6B7F] mt-0.5 font-light">ปฏิบัติการเขตและภูมิภาค {employees.filter(e => e.hb === "Branch").length.toLocaleString()} ท่าน</span>
          </div>
          <div className="bg-[#F4F7FC]/60 rounded-xl p-3.5 border border-[#E2ECF5]/40 flex flex-col justify-center">
            <span className="text-[10px] text-[#5B6B7F] block uppercase tracking-wider font-medium">อัตราความหลากหลาย (ชาย:หญิง)</span>
            <span className="text-base font-medium text-[#8B5CF6] mt-1 block">
              {totalCount > 0 ? `${Math.round((employees.filter(e => e.gender === "ชาย").length / totalCount) * 100)}:${Math.round((employees.filter(e => e.gender === "หญิง").length / totalCount) * 100)}` : "0:0"}
            </span>
            <span className="text-[9px] text-[#5B6B7F] mt-0.5 font-light">พนักงาน ชาย : หญิง</span>
          </div>
        </div>
      </div>

      {/* SECTION C & D: Grouped Charts for High-End Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section C: Organization / Level / Management */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1 h-5 bg-[#2F6FE4] rounded-full" />
              <div>
                <h3 className="text-sm font-medium text-[#1F2D3D]">โครงสร้างระดับและการกำกับดูแล (Section C: Hierarchy & Span of Control)</h3>
                <p className="text-[11px] text-[#5B6B7F] mt-0.5">การจัดโครงสร้างผู้บริหาร สัดส่วนพนักงานปฏิบัติงาน และระดับลำดับชั้นตำแหน่ง</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Chart 1: Level Distribution */}
              <div className="border border-[#DCE6F2] rounded-xl p-4">
                <span className="text-xs font-medium text-[#1F2D3D] block mb-0.5">จำนวนบุคลากรจำแนกตามระดับตำแหน่งงาน (Level Distribution)</span>
                <p className="text-[10px] text-[#5B6B7F] mb-3">การกระจายตัวตั้งแต่พนักงานบริการชั้นต้นสู่ระดับฝ่ายอำนวยการจัดการสูงสุด</p>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={levelDistribution}
                      layout="vertical"
                      margin={{ top: 5, right: 15, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid horizontal={false} stroke="#E2ECF5" strokeDasharray="3 3" />
                      <XAxis type="number" stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#1F2D3D" fontSize={9} tickLine={false} axisLine={false} width={110} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", borderColor: "#DCE6F2", fontSize: "11px" }}
                        formatter={(value) => [`${value} คน`, "จำนวนพนักงาน"]}
                      />
                      <Bar dataKey="จำนวนคน" radius={[0, 4, 4, 0]} barSize={8}>
                        {levelDistribution.map((entry, index) => {
                          const isManager = entry.name.includes("13") || entry.name.includes("12") || entry.name.includes("11") || entry.name.includes("10");
                          return <Cell key={`cell-${index}`} fill={isManager ? "#2F6FE4" : "#4C8DFF"} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Management Ratio & Span of Control Gauge */}
              <div className="border border-[#DCE6F2] rounded-xl p-4 bg-[#F6F9FC]/40 space-y-4">
                <div>
                  <span className="text-xs font-medium text-[#1F2D3D] block mb-0.5">สัดส่วนผู้บริหารและอัตราการกำกับดูแล (Management & Span of Control)</span>
                  <p className="text-[10px] text-[#5B6B7F]">ความเหมาะสมในการดูแลกำกับตนเองเทียบกับหัวหน้าทีมสูงสุด</p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-normal">
                    <span className="text-[#5B6B7F] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2F6FE4] inline-block" />
                      ระดับจัดการ (Manager+) : {managementData.managers.toLocaleString()} คน
                    </span>
                    <span className="text-[#5B6B7F] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4C8DFF] inline-block" />
                      กลุ่มพนักงาน (Staff) : {managementData.staff.toLocaleString()} คน
                    </span>
                  </div>

                  {/* Horizontal Segmented Bar */}
                  {(() => {
                    const managerPct = totalCount > 0 ? (managementData.managers / totalCount) * 100 : 0;
                    const staffPct = totalCount > 0 ? (managementData.staff / totalCount) * 100 : 0;
                    return (
                      <div>
                        <div className="w-full bg-slate-200/60 h-2.5 rounded-full overflow-hidden flex">
                          <div style={{ width: `${managerPct}%` }} className="bg-[#2F6FE4] h-full transition-all duration-500" />
                          <div style={{ width: `${staffPct}%` }} className="bg-[#4C8DFF] h-full transition-all duration-500" />
                        </div>
                        <div className="flex justify-between text-[10px] text-[#5B6B7F] mt-1.5 font-light">
                          <span>สัดส่วนจัดการ: {Math.round(managerPct)}%</span>
                          <span>สัดส่วนทีมปฏิบัติ: {Math.round(staffPct)}%</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Gauge visualization of Span of control ratio */}
                <div className="bg-white border border-[#DCE6F2]/70 rounded-lg p-3 flex justify-between items-center gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-[#1F2D3D] block">Span of Control ปัจจุบัน</span>
                    <p className="text-[10px] text-[#5B6B7F] font-light">ผู้บริหาร 1 ท่าน ต่อผู้ปฏิบัติงาน</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-medium text-[#2F6FE4]">1 : {managementData.spanOfControl}</span>
                    <span className="text-[9px] text-[#5B6B7F] block">ท่านในการดูแล</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section D: Talent / Performance & Retirement Risk */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1 h-5 bg-[#2F6FE4] rounded-full" />
              <div>
                <h3 className="text-sm font-medium text-[#1F2D3D]">ศักยภาพและความเสี่ยงเกษียณ (Section D: Talent & Succession Forecast)</h3>
                <p className="text-[11px] text-[#5B6B7F] mt-0.5">การวิเคราะห์กลุ่มประเมินผลงานควบคู่ไปกับการพยากรณ์ความเสี่ยงเกษียณอายุการทำงาน</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Performance Distribution Donut Card */}
              <div className="border border-[#DCE6F2] rounded-xl p-4">
                <span className="text-xs font-medium text-[#1F2D3D] block mb-0.5">การประเมินสัดส่วนผลงานพนักงาน (Performance Distribution)</span>
                <p className="text-[10px] text-[#5B6B7F] mb-3">เปรียบเทียบสัดส่วนระหว่างกลุ่มดาวเด่น กลุ่มงานปกติ และส่วนต้องการดูแลเสริมแรง</p>
                
                <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
                  <div className="h-32 w-32 shrink-0 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={performanceDonutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={36}
                          outerRadius={50}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {performanceDonutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", borderColor: "#DCE6F2", fontSize: "11px" }}
                          formatter={(value) => [`${value} คน`, "จำนวน"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 w-full">
                    {performanceDonutData.map((p, idx) => {
                      const pct = totalCount > 0 ? Math.round((p.value / totalCount) * 100) : 0;
                      return (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="flex items-center gap-2 text-[#5B6B7F]">
                            <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: p.color }} />
                            {p.name}
                          </span>
                          <span className="font-medium text-[#1F2D3D]">
                            {p.value.toLocaleString()} คน ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Retirement Horizon Forecast Chart */}
              <div className="border border-[#DCE6F2] rounded-xl p-4">
                <span className="text-xs font-medium text-[#1F2D3D] block mb-0.5">พยากรณ์ความเสี่ยงจากการเกษียณอายุสะสม (Retirement Forecast Horizon)</span>
                <p className="text-[10px] text-[#5B6B7F] mb-3">จำนวนพนักงานที่มีอายุ 55-59 ปี ซึ่งเตรียมก้าวสู่การพ้นกำหนดวาระในอนาคตอันใกล้</p>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={retirementBarData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2ECF5" />
                      <XAxis dataKey="name" stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", borderColor: "#DCE6F2", fontSize: "11px" }}
                        formatter={(value) => [`${value} คน`, "จำนวนพนักงาน"]}
                      />
                      <Bar dataKey="จำนวนพนักงาน" radius={[4, 4, 0, 0]} barSize={26}>
                        {retirementBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* SECTION E: Executive Insights */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm" id="executive-insights-panel">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-1 h-5 bg-[#2F6FE4] rounded-full animate-pulse" />
          <div>
            <h3 className="text-sm font-medium text-[#1F2D3D]">สรุปรายงานประเด็นพิจารณาผู้บริหาร (Executive Insights & Highlights)</h3>
            <p className="text-[11px] text-[#5B6B7F] mt-0.5">สรุปผลพยากรณ์โครงสร้างบุคลากร ดัชนีความเสี่ยง โอกาสขับเคลื่อนยุทธศาสตร์ และคำแนะนำทางปฏิบัติการ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5 pt-3">
          {/* Column 1: Risks */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#F36B6B]/15">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F36B6B]" />
              <h4 className="text-xs font-medium text-[#F36B6B]">ความเสี่ยงกำลังพล (Workforce Risks)</h4>
            </div>
            <div className="space-y-3.5">
              {executiveHighlights.risks.length > 0 ? (
                executiveHighlights.risks.map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${item.bg} flex gap-3.5 items-start hover:shadow-xs transition-all duration-300`}>
                    <div className="p-1.5 rounded-lg bg-white shadow-3xs text-slate-700 mt-0.5 shrink-0">
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-[#1F2D3D] block">{item.title}</span>
                      <p className="text-[10px] text-[#5B6B7F] leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-[10px] text-[#5B6B7F]">
                  ไม่พบตัวชี้วัดดัชนีความเสี่ยงสูงในข้อมูลปัจจุบัน
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Opportunities */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#2DBE7F]/15">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2DBE7F]" />
              <h4 className="text-xs font-medium text-[#2DBE7F]">โอกาสในการพัฒนา (Opportunities)</h4>
            </div>
            <div className="space-y-3.5">
              {executiveHighlights.opportunities.length > 0 ? (
                executiveHighlights.opportunities.map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${item.bg} flex gap-3.5 items-start hover:shadow-xs transition-all duration-300`}>
                    <div className="p-1.5 rounded-lg bg-white shadow-3xs text-slate-700 mt-0.5 shrink-0">
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-[#1F2D3D] block">{item.title}</span>
                      <p className="text-[10px] text-[#5B6B7F] leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-[10px] text-[#5B6B7F]">
                  ไม่พบโอกาสพัฒนาโครงสร้างสำคัญเด่นชัดในเกณฑ์นี้
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Recommendations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#2F6FE4]/15">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F6FE4]" />
              <h4 className="text-xs font-medium text-[#2F6FE4]">ข้อเสนอแนะเชิงยุทธศาสตร์ (Recommendations)</h4>
            </div>
            <div className="space-y-3.5">
              {executiveHighlights.recommendations.length > 0 ? (
                executiveHighlights.recommendations.map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${item.bg} flex gap-3.5 items-start hover:shadow-xs transition-all duration-300`}>
                    <div className="p-1.5 rounded-lg bg-white shadow-3xs text-slate-700 mt-0.5 shrink-0">
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-[#1F2D3D] block">{item.title}</span>
                      <p className="text-[10px] text-[#5B6B7F] leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-[10px] text-[#5B6B7F]">
                  คงการดำเนินนโยบายตามกรอบมาตรฐานงานปกติ
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION F: Employee Explorer Table */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl shadow-sm p-6" id="employee-explorer-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#DCE6F2]/40">
          <div>
            <span className="text-xs font-medium text-[#1F2D3D] block">ฐานรายชื่อผู้ปฏิบัติการเชิงลึก (Employee Explorer Table)</span>
            <p className="text-[10px] text-[#5B6B7F] mt-0.5">ใช้ค้นหาและเจาะลึกข้อมูลรายบุคคล ตรวจเช็คเกณฑ์ประเมิน สายสังกัดภูมิภาค และรายละเอียดสัญญา</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-[#5B6B7F]" size={13} />
              <input
                type="text"
                placeholder="ค้นหารายชื่อ, รหัสพนักงาน, ตำแหน่ง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8.5 pr-4 py-1.5 text-xs rounded-lg border border-[#DCE6F2] bg-white focus:outline-hidden text-[#1F2D3D] w-full sm:w-56 placeholder:text-[#5B6B7F]/60"
              />
            </div>

            {/* Quick Filter Chips (Pill capsule format) */}
            <div className="flex bg-[#F6F9FC] border border-[#DCE6F2] rounded-lg p-0.5 text-[11px]">
              <button
                onClick={() => setTypeFilter("All")}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${typeFilter === "All" ? "bg-white text-[#2F6FE4] font-medium shadow-3xs" : "text-[#5B6B7F] hover:text-[#1F2D3D]"}`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setTypeFilter("พนักงานประจำ")}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${typeFilter === "พนักงานประจำ" ? "bg-white text-[#2F6FE4] font-medium shadow-3xs" : "text-[#5B6B7F] hover:text-[#1F2D3D]"}`}
              >
                ประจำ
              </button>
              <button
                onClick={() => setTypeFilter("พนักงานสัญญาจ้าง")}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${typeFilter === "พนักงานสัญญาจ้าง" ? "bg-white text-[#2F6FE4] font-medium shadow-3xs" : "text-[#5B6B7F] hover:text-[#1F2D3D]"}`}
              >
                สัญญาจ้าง
              </button>
            </div>

            {/* Performance Select Filter */}
            <select
              value={perfFilter}
              onChange={(e) => setPerfFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-[11px] rounded-lg border border-[#DCE6F2] bg-white focus:outline-hidden text-[#1F2D3D] cursor-pointer hover:border-[#2F6FE4]/40 transition-colors"
            >
              <option value="All">ทุกผลประเมิน</option>
              <option value="High">High Performer</option>
              <option value="Meets">Meets Standard</option>
              <option value="Needs">Needs Support</option>
            </select>
          </div>
        </div>

        {/* Beautiful Zebra/Subtle Table */}
        <div className="overflow-x-auto border border-[#DCE6F2] rounded-xl">
          <table className="w-full text-left border-collapse" id="active-employees-detail-table">
            <thead>
              <tr className="border-b border-[#DCE6F2] bg-[#F6F9FC] text-[10px] text-[#1F2D3D] font-medium uppercase tracking-wider">
                <th className="py-3 px-4">รหัสพนักงาน</th>
                <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                <th className="py-3 px-3 text-center">ประเภทสัญญา</th>
                <th className="py-3 px-4">สายงานหลัก</th>
                <th className="py-3 px-4">ฝ่ายงานสังกัด</th>
                <th className="py-3 px-4">ตำแหน่งงาน</th>
                <th className="py-3 px-3 text-center">ระดับ</th>
                <th className="py-3 px-2 text-center">อายุตัว</th>
                <th className="py-3 px-2 text-center">อายุงาน</th>
                <th className="py-3 px-3 text-center">ผลงาน</th>
                <th className="py-3 px-3 text-center">ทำเลสังกัด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE6F2]/60 text-[11px]">
              {paginatedTableData.length > 0 ? (
                paginatedTableData.map((emp, idx) => (
                  <tr
                    key={emp.empId}
                    onClick={() => onSelectEmployee(emp)}
                    className={`${idx % 2 === 1 ? "bg-[#F6F9FC]/30" : "bg-white"} hover:bg-[#2F6FE4]/5 cursor-pointer transition-colors`}
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-medium text-[#2F6FE4] font-mono whitespace-nowrap">{emp.empId}</td>
                    
                    {/* Name */}
                    <td className="py-3.5 px-4 text-[#1F2D3D] whitespace-nowrap">
                      <div>
                        <div className="font-medium text-[#1F2D3D]">{emp.name}</div>
                        <div className="text-[10px] text-[#5B6B7F] font-light">{emp.nameEn}</div>
                      </div>
                    </td>

                    {/* Contract Badge - strictly no-wrap */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium leading-none border ${
                        emp.contractType === "พนักงานประจำ" 
                          ? "bg-[#2F6FE4]/5 text-[#2F6FE4] border-[#2F6FE4]/15" 
                          : "bg-purple-50 text-purple-700 border-purple-100"
                      }`}>
                        {emp.contractType}
                      </span>
                    </td>

                    {/* Business Line */}
                    <td className="py-3.5 px-4 text-[#5B6B7F] whitespace-nowrap font-light">{emp.businessLine}</td>
                    
                    {/* Group */}
                    <td className="py-3.5 px-4 text-[#5B6B7F] whitespace-nowrap">{emp.group}</td>
                    
                    {/* Position */}
                    <td className="py-3.5 px-4 text-[#1F2D3D] whitespace-nowrap font-normal">{emp.position}</td>
                    
                    {/* Level */}
                    <td className="py-3.5 px-3 text-center font-medium text-[#1F2D3D] whitespace-nowrap">{emp.level}</td>
                    
                    {/* Age */}
                    <td className="py-3.5 px-2 text-center text-[#1F2D3D] whitespace-nowrap font-light">{emp.age} ปี</td>
                    
                    {/* Tenure */}
                    <td className="py-3.5 px-2 text-center text-[#1F2D3D] whitespace-nowrap font-medium">{emp.tenure} ปี</td>
                    
                    {/* Performance Badge - strictly no-wrap */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-flex items-center justify-center whitespace-nowrap px-2 py-1 rounded-full text-[10px] font-medium leading-none border ${
                        emp.performanceRating === "High Performer"
                          ? "bg-[#2DBE7F]/5 text-[#2DBE7F] border-[#2DBE7F]/15"
                          : emp.performanceRating === "Meets Standard"
                          ? "bg-[#FFB547]/5 text-[#FFB547] border-[#FFB547]/15"
                          : "bg-[#F36B6B]/5 text-[#F36B6B] border-[#F36B6B]/15"
                      }`}>
                        {emp.performanceRating === "High Performer" ? "High" : emp.performanceRating === "Meets Standard" ? "Meets" : "Needs Support"}
                      </span>
                    </td>

                    {/* Location Badge - strictly no-wrap */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-flex items-center justify-center whitespace-nowrap px-2 py-1 rounded text-[10px] font-medium leading-none border ${
                        emp.hb === "Head Office" ? "bg-slate-50 text-slate-700 border-slate-200" : "bg-[#25B7D3]/5 text-[#25B7D3] border-[#25B7D3]/15"
                      }`}>
                        {emp.hb}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-[#5B6B7F] font-medium bg-white">
                    <span className="flex items-center justify-center gap-1.5"><Search size={14} className="text-[#5B6B7F]" /> ไม่พบข้อมูลพนักงานที่สอดคล้องตามเกณฑ์วิเคราะห์</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#DCE6F2]/40 text-[11px]">
          <span className="text-[#5B6B7F] font-light">
            แสดงผล {(filteredTableData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0)} ถึง {Math.min(currentPage * itemsPerPage, filteredTableData.length)} จาก {filteredTableData.length.toLocaleString()} รายชื่อ
          </span>

          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#DCE6F2] bg-white hover:bg-[#F6F9FC] disabled:opacity-40 transition-colors cursor-pointer flex items-center justify-center text-[#5B6B7F]"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex gap-1 max-w-[150px] sm:max-w-xs overflow-x-auto items-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2.5 py-1 text-[11px] rounded-md border transition-all cursor-pointer ${currentPage === page ? "bg-[#2F6FE4] text-white border-[#2F6FE4] font-medium" : "bg-white border-[#DCE6F2] text-[#5B6B7F] hover:bg-[#F6F9FC]"}`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#DCE6F2] bg-white hover:bg-[#F6F9FC] disabled:opacity-40 transition-colors cursor-pointer flex items-center justify-center text-[#5B6B7F]"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
