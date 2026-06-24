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
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[440px]">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1 h-5 bg-[#2F6FE4] rounded-full" />
              <div>
                <h3 className="text-sm font-semibold text-[#1F2D3D]">จำนวนบุคลากรจำแนกตามระดับตำแหน่งงาน (Level Distribution)</h3>
                <p className="text-[11px] text-[#5B6B7F] mt-0.5">การจัดโครงสร้างผู้บริหาร สัดส่วนพนักงานปฏิบัติงาน และระดับลำดับชั้นตำแหน่ง</p>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={levelChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 35, left: -10, bottom: 5 }}
                >
                  <CartesianGrid horizontal={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                  <XAxis type="number" stroke="#8898AA" fontSize={8} tickLine={false} axisLine={false} />
                  <YAxis dataKey="shortName" type="category" stroke="#344054" fontSize={9} fontWeight={600} tickLine={false} axisLine={false} width={85} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", borderColor: "#DCE6F2", fontSize: "11px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(value, name, props) => [`${value} คน`, props.payload.fullName]}
                  />
                  <Bar dataKey="จำนวนคน" radius={[0, 4, 4, 0]} barSize={12}>
                    {levelChartData.map((entry, index) => {
                      const name = entry.name;
                      let color = "#94A3B8";
                      if (name.includes("13") || name.includes("12") || name.includes("11")) color = "#2F6FE4";
                      else if (name.includes("10") || name.includes("9")) color = "#3B82F6";
                      else if (name.includes("8") || name.includes("7")) color = "#60A5FA";
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                    <LabelList dataKey="จำนวนคน" position="right" style={{ fill: "#1F2D3D", fontSize: 9, fontWeight: 700 }} offset={8} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-4 pt-2 border-t border-slate-100 text-[9px] text-slate-500 font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2F6FE4]" />
                <span>ระดับบริหารสูง (L11+)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                <span>ระดับบริหารกลาง (L9-10)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]" />
                <span>หัวหน้าทีม/วิชาชีพ (L7-8)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" />
                <span>ระดับปฏิบัติการ (L6-)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Performance Distribution */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[440px]">
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
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[440px]">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1 h-5 bg-[#8B5CF6] rounded-full" />
              <div>
                <h3 className="text-sm font-semibold text-[#1F2D3D]">สัดส่วนผู้บริหารและอัตราการกำกับดูแล (Management & Span of Control)</h3>
                <p className="text-[11px] text-[#5B6B7F] mt-0.5">วิเคราะห์สัดส่วนกลุ่มผู้บริหาร หัวหน้างาน และผู้ปฏิบัติงาน เพื่อการกำกับดูแลที่สมดุล</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Row 1: Span of Control & Ratio summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#F8FAFC] border border-violet-100 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-violet-200 transition-all">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Span of Control</span>
                    <span className="text-lg font-black text-[#8B5CF6] block mt-1">1 : {managementData.spanOfControl}</span>
                    <span className="text-[9px] text-[#5B6B7F] font-medium block mt-0.5">สัดส่วนดูแล (หัวหน้าต่อพนักงาน)</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-[#8B5CF6] text-xs font-bold shrink-0">
                    1:{Math.round(parseFloat(managementData.spanOfControl))}
                  </div>
                </div>

                <div className="bg-[#F8FAFC] border border-blue-100 rounded-xl p-3 flex flex-col justify-between hover:border-blue-200 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">สัดส่วนหัวหน้า : ทีม</span>
                    <span className="text-[9px] font-bold text-slate-500">รวม {totalCount.toLocaleString()} คน</span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-[11px] font-bold text-[#2F6FE4]">{managementData.managers.toLocaleString()} <span className="font-normal text-slate-400">ผู้ดูแล</span></span>
                    <span className="text-[11px] font-bold text-[#4C8DFF]">{managementData.staff.toLocaleString()} <span className="font-normal text-slate-400">ผู้ปฏิบัติ</span></span>
                  </div>
                </div>
              </div>

              {/* Segmented bar */}
              <div className="space-y-1">
                {(() => {
                  const managerPct = totalCount > 0 ? (managementData.managers / totalCount) * 100 : 0;
                  const staffPct = totalCount > 0 ? (managementData.staff / totalCount) * 100 : 0;
                  return (
                    <>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex border border-slate-200/50">
                        <div style={{ width: `${managerPct}%` }} className="bg-[#2F6FE4] h-full transition-all duration-500" />
                        <div style={{ width: `${staffPct}%` }} className="bg-[#4C8DFF] h-full transition-all duration-500" />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                        <span>สัดส่วนจัดการ: {Math.round(managerPct)}%</span>
                        <span>ทีมปฏิบัติการ: {Math.round(staffPct)}%</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Row 3: 4 Tiers in 2x2 grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {[
                  { name: "บริหารระดับสูง (L11-13)", count: managementTiers.high, pct: totalCount > 0 ? Math.round((managementTiers.high / totalCount) * 100) : 0, color: "#2F6FE4", bg: "bg-blue-50/40 border-blue-100/60" },
                  { name: "บริหารระดับกลาง (L9-10)", count: managementTiers.mid, pct: totalCount > 0 ? Math.round((managementTiers.mid / totalCount) * 100) : 0, color: "#3B82F6", bg: "bg-indigo-50/40 border-indigo-100/60" },
                  { name: "หัวหน้างาน/วิชาชีพ (L7-8)", count: managementTiers.lead, pct: totalCount > 0 ? Math.round((managementTiers.lead / totalCount) * 100) : 0, color: "#8B5CF6", bg: "bg-purple-50/40 border-purple-100/60" },
                  { name: "ผู้ปฏิบัติการ (L6 ลงไป)", count: managementTiers.staff, pct: totalCount > 0 ? Math.round((managementTiers.staff / totalCount) * 100) : 0, color: "#94A3B8", bg: "bg-slate-50 border-slate-100" }
                ].map((tier, idx) => (
                  <div key={idx} className={`p-2.5 rounded-xl border ${tier.bg} flex flex-col justify-between hover:shadow-2xs transition-all duration-300`}>
                    <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1 leading-none">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tier.color }} />
                      {tier.name}
                    </span>
                    <div className="flex justify-between items-baseline mt-1.5">
                      <span className="text-xs font-black text-slate-800">{tier.count.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">คน</span></span>
                      <span className="text-[10px] font-bold text-slate-500">{tier.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Retirement Horizon Forecast */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[440px]">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1 h-5 bg-[#F36B6B] rounded-full" />
              <div>
                <h3 className="text-sm font-semibold text-[#1F2D3D]">พยากรณ์ความเสี่ยงการเกษียณอายุ (Retirement Horizon Forecast)</h3>
                <p className="text-[11px] text-[#5B6B7F] mt-0.5">พยากรณ์พนักงานอายุ 55-59 ปี ที่พร้อมพ้นวาระการทำงานสะสมใน 1, 3 และ 5 ปีข้างหน้า</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Row 1: 3-column risk metrics */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "วิกฤต (ใน 1 ปี / อายุ 59)", count: retirementForecast.r1, color: "#F36B6B", bg: "bg-red-50/40 border-red-100" },
                  { name: "เฝ้าระวัง (ใน 3 ปี / อายุ 57+)", count: retirementForecast.r3, color: "#FFB547", bg: "bg-amber-50/40 border-amber-100" },
                  { name: "เตรียมการ (ใน 5 ปี / อายุ 55+)", count: retirementForecast.r5, color: "#4C8DFF", bg: "bg-blue-50/40 border-blue-100" }
                ].map((risk, idx) => (
                  <div key={idx} className={`p-2 rounded-xl border ${risk.bg} text-center flex flex-col justify-between hover:shadow-2xs transition-all`}>
                    <span className="text-[9px] font-bold text-slate-500 block leading-tight">{risk.name}</span>
                    <span className="text-sm font-black text-slate-800 mt-1 block">
                      {risk.count.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">คน</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Row 2: Wide Bar Chart */}
              <div className="h-[145px] w-full mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={retirementBarData}
                    margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#8898AA" fontSize={8} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8898AA" fontSize={8} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", borderColor: "#DCE6F2", fontSize: "11px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      formatter={(value) => [`${value} คน`, "จำนวนพนักงาน"]}
                    />
                    <Bar dataKey="จำนวนพนักงาน" radius={[4, 4, 0, 0]} barSize={32}>
                      {retirementBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <LabelList dataKey="จำนวนพนักงาน" position="top" style={{ fill: "#1F2D3D", fontSize: 9, fontWeight: 700 }} offset={6} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Row 3: Strategic Advice Box */}
              <div className="bg-amber-50/40 border border-amber-100/60 rounded-xl p-2.5 flex items-start gap-2.5">
                <span className="text-xs mt-0.5 shrink-0">💡</span>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-medium text-amber-800 block">ข้อเสนอเชิงยุทธศาสตร์:</span>
                  <p className="text-[9.5px] text-[#5B6B7F] leading-relaxed">ควรทำโปรแกรมส่งต่อวิชาชีพและ Succession Plan เร่งด่วนสำหรับบุคลากรที่จะเกษียณใน 1-3 ปีแรกเพื่อลดความเสี่ยงการสูญเสียองค์ความรู้สำคัญ</p>
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
