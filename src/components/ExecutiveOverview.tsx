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
  CartesianGrid,
  LabelList
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
                <div className="text-xl font-medium text-[#1F2D3D] leading-none tracking-normal">
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
        
        {/* Card 1: Level Distribution */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1 h-5 bg-[#2F6FE4] rounded-full" />
              <div>
                <h3 className="text-sm font-semibold text-[#1F2D3D]">จำนวนบุคลากรจำแนกตามระดับตำแหน่งงาน (Level Distribution)</h3>
                <p className="text-[11px] text-[#5B6B7F] mt-0.5">การจัดโครงสร้างผู้บริหาร สัดส่วนพนักงานปฏิบัติงาน และระดับลำดับชั้นตำแหน่ง</p>
              </div>
            </div>

            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={levelDistribution}
                  layout="vertical"
                  margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
                >
                  <CartesianGrid horizontal={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                  <XAxis type="number" stroke="#8898AA" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#1F2D3D" fontSize={9} tickLine={false} axisLine={false} width={115} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", borderColor: "#DCE6F2", fontSize: "11px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(value) => [`${value} คน`, "จำนวนพนักงาน"]}
                  />
                  <Bar dataKey="จำนวนคน" radius={[0, 4, 4, 0]} barSize={14}>
                    {levelDistribution.map((entry, index) => {
                      const isManager = entry.name.includes("13") || entry.name.includes("12") || entry.name.includes("11") || entry.name.includes("10");
                      return <Cell key={`cell-${index}`} fill={isManager ? "#2F6FE4" : "#4C8DFF"} />;
                    })}
                    <LabelList dataKey="จำนวนคน" position="right" style={{ fill: "#1F2D3D", fontSize: 9, fontWeight: 600 }} offset={8} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Card 2: Performance Distribution */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1 h-5 bg-[#2DBE7F] rounded-full" />
              <div>
                <h3 className="text-sm font-semibold text-[#1F2D3D]">การประเมินสัดส่วนผลงานพนักงาน (Performance Distribution)</h3>
                <p className="text-[11px] text-[#5B6B7F] mt-0.5">สัดส่วนระหว่างกลุ่มดาวเด่นพนักงานศักยภาพสูง กลุ่มผลงานมาตรฐาน และผู้ที่ต้องการการเรียนรู้เสริมแรง</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-[340px] px-2">
              <div className="h-48 w-48 shrink-0 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performanceDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={78}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {performanceDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", borderColor: "#DCE6F2", fontSize: "11px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      formatter={(value) => [`${value} คน`, "จำนวน"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Text centered inside the Donut Chart */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-[#1F2D3D] tracking-tight leading-none">
                    {totalCount.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-[#5B6B7F] font-semibold tracking-wider uppercase mt-1.5">พนักงานรวม</span>
                </div>
              </div>

              <div className="space-y-3 w-full max-w-[240px]">
                {performanceDonutData.map((p, idx) => {
                  const pct = totalCount > 0 ? Math.round((p.value / totalCount) * 100) : 0;
                  return (
                    <div key={idx} className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-[11px] font-semibold text-[#344054]">
                          <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: p.color }} />
                          {p.name}
                        </span>
                        <span className="text-[11px] font-bold text-[#1F2D3D]">
                          {pct}% <span className="text-[10px] font-medium text-[#5B6B7F] ml-1">({p.value.toLocaleString()} คน)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div style={{ width: `${pct}%`, backgroundColor: p.color }} className="h-full rounded-full transition-all duration-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Management & Span of Control */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1 h-5 bg-[#8B5CF6] rounded-full" />
              <div>
                <h3 className="text-sm font-semibold text-[#1F2D3D]">สัดส่วนผู้บริหารและอัตราการกำกับดูแล (Management & Span of Control)</h3>
                <p className="text-[11px] text-[#5B6B7F] mt-0.5">วิเคราะห์สัดส่วนระหว่างกลุ่มผู้บริหารและผู้ปฏิบัติงานเพื่อประเมินความลื่นไหลในองค์กร</p>
              </div>
            </div>

            <div className="space-y-5 py-2">
              <div className="flex justify-between items-center text-xs font-normal">
                <span className="text-[#1F2D3D] font-medium flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2F6FE4] inline-block" />
                  ระดับจัดการ (Manager+) : <strong className="text-[#2F6FE4]">{managementData.managers.toLocaleString()}</strong> คน
                </span>
                <span className="text-[#1F2D3D] font-medium flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4C8DFF] inline-block" />
                  กลุ่มพนักงาน (Staff) : <strong className="text-[#4C8DFF]">{managementData.staff.toLocaleString()}</strong> คน
                </span>
              </div>

              {/* Horizontal Segmented Bar */}
              {(() => {
                const managerPct = totalCount > 0 ? (managementData.managers / totalCount) * 100 : 0;
                const staffPct = totalCount > 0 ? (managementData.staff / totalCount) * 100 : 0;
                return (
                  <div className="space-y-1.5">
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex border border-slate-200/50">
                      <div style={{ width: `${managerPct}%` }} className="bg-[#2F6FE4] h-full transition-all duration-500" />
                      <div style={{ width: `${staffPct}%` }} className="bg-[#4C8DFF] h-full transition-all duration-500" />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#5B6B7F] font-semibold">
                      <span>สัดส่วนจัดการ: {Math.round(managerPct)}%</span>
                      <span>สัดส่วนทีมปฏิบัติ: {Math.round(staffPct)}%</span>
                    </div>
                  </div>
                );
              })()}

              {/* Gauge visualization of Span of control ratio */}
              <div className="bg-[#F8FAFC] border border-[#DCE6F2]/70 rounded-xl p-4 flex justify-between items-center gap-4 hover:border-[#2F6FE4]/30 transition-all">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#1F2D3D] block">Span of Control (อัตราดูแลเฉลี่ย)</span>
                  <p className="text-[10px] text-[#5B6B7F] font-light leading-relaxed">จำนวนผู้ปฏิบัติงานในความรับผิดชอบและดูแลโดยเฉลี่ยต่อผู้บริหาร 1 ท่าน</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-bold text-[#2F6FE4] tracking-tight block">1 : {managementData.spanOfControl}</span>
                  <span className="text-[9px] text-[#5B6B7F] font-medium block mt-0.5">ท่านต่อผู้บริหาร</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Retirement Horizon Forecast */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1 h-5 bg-[#F36B6B] rounded-full" />
              <div>
                <h3 className="text-sm font-semibold text-[#1F2D3D]">พยากรณ์ความเสี่ยงจากการเกษียณอายุสะสม (Retirement Forecast Horizon)</h3>
                <p className="text-[11px] text-[#5B6B7F] mt-0.5">จำนวนพนักงานช่วงอายุ 55-59 ปี ที่พร้อมเข้าเกณฑ์พ้นวาระการทำงานสะสมในอนาคตอันใกล้</p>
              </div>
            </div>

            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={retirementBarData}
                  margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", borderColor: "#DCE6F2", fontSize: "11px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(value) => [`${value} คน`, "จำนวนพนักงาน"]}
                  />
                  <Bar dataKey="จำนวนพนักงาน" radius={[4, 4, 0, 0]} barSize={32}>
                    {retirementBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="จำนวนพนักงาน" position="top" style={{ fill: "#1F2D3D", fontSize: 9, fontWeight: 600 }} offset={6} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
