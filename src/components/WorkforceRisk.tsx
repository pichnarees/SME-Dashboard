/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { Employee } from "../data/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid } from "recharts";
import { 
  AlertTriangle, 
  TrendingDown, 
  ShieldAlert, 
  Award, 
  RefreshCw, 
  Calendar, 
  Sparkles,
  Users2,
  CheckCircle,
  TrendingUp,
  UserX,
  FileWarning,
  Flame,
  ArrowRight
} from "lucide-react";

interface WorkforceRiskProps {
  employees: Employee[];
}

export default function WorkforceRisk({ employees }: WorkforceRiskProps) {
  const totalCount = employees.length;

  // Section 1: KPI Cards
  const riskStats = useMemo(() => {
    const age55Plus = employees.filter(e => e.age >= 55).length;
    const age59 = employees.filter(e => e.age === 59).length;
    const age57_59 = employees.filter(e => e.age >= 57 && e.age <= 59).length;
    
    // Managers close to retirement (Level 9+ and age >= 55)
    const seniorManagers = employees.filter(e => {
      const num = parseInt(e.level.replace(/[^0-9]/g, "")) || 0;
      const isM = num >= 9 || e.level.includes("13");
      return isM && e.age >= 55;
    }).length;

    // Critical Role Succession Risk (Level 9+ with successionStatus === "None")
    const criticalNoSuccessor = employees.filter(e => {
      const num = parseInt(e.level.replace(/[^0-9]/g, "")) || 0;
      const isM = num >= 9 || e.level.includes("13");
      return isM && e.successionStatus === "None";
    }).length;

    return {
      age55Plus,
      age59,
      age57_59,
      seniorManagers,
      criticalNoSuccessor
    };
  }, [employees]);

  // Section 2: Age Distribution Data
  const ageDistributionData = useMemo(() => {
    const ranges = {
      "ต่ำกว่า 30 ปี": 0,
      "30–39 ปี": 0,
      "40–49 ปี": 0,
      "50–54 ปี": 0,
      "55 ปีขึ้นไป": 0
    };

    employees.forEach(e => {
      if (e.age < 30) ranges["ต่ำกว่า 30 ปี"]++;
      else if (e.age <= 39) ranges["30–39 ปี"]++;
      else if (e.age <= 49) ranges["40–49 ปี"]++;
      else if (e.age <= 54) ranges["50–54 ปี"]++;
      else ranges["55 ปีขึ้นไป"]++;
    });

    return Object.entries(ranges).map(([name, count]) => ({
      name,
      จำนวนคน: count,
      เปอร์เซ็นต์: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
    }));
  }, [employees, totalCount]);

  // Section 3: Tenure Distribution Data
  const tenureDistributionData = useMemo(() => {
    const ranges = {
      "0–2 ปี": 0,
      "3–5 ปี": 0,
      "6–10 ปี": 0,
      "11–20 ปี": 0,
      "20 ปีขึ้นไป": 0
    };

    employees.forEach(e => {
      if (e.tenure <= 2) ranges["0–2 ปี"]++;
      else if (e.tenure <= 5) ranges["3–5 ปี"]++;
      else if (e.tenure <= 10) ranges["6–10 ปี"]++;
      else if (e.tenure <= 20) ranges["11–20 ปี"]++;
      else ranges["20 ปีขึ้นไป"]++;
    });

    return Object.entries(ranges).map(([name, count]) => ({
      name,
      จำนวนคน: count
    }));
  }, [employees]);

  // Section 4: Retirement Risk by Business Line
  const retirementByLine = useMemo(() => {
    const counts: Record<string, { total: number; senior: number }> = {};
    employees.forEach(e => {
      if (!counts[e.businessLine]) {
        counts[e.businessLine] = { total: 0, senior: 0 };
      }
      counts[e.businessLine].total++;
      if (e.age >= 55) {
        counts[e.businessLine].senior++;
      }
    });

    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        พนักงานอาวุโส: data.senior,
        สัดส่วนร้อยละ: data.total > 0 ? Math.round((data.senior / data.total) * 100) : 0
      }))
      .sort((a, b) => b.พนักงานอาวุโส - a.พนักงานอาวุโส)
      .slice(0, 6);
  }, [employees]);

  // Section 5: Succession Risk Chart for leadership positions
  const successionData = useMemo(() => {
    const statusCounts = {
      "Ready Now": 0,
      "Ready 1-2 Years": 0,
      "Ready 3-5 Years": 0,
      "None (ไม่มีทายาท)": 0
    };

    employees.forEach(e => {
      const num = parseInt(e.level.replace(/[^0-9]/g, "")) || 0;
      const isM = num >= 9 || e.level.includes("13");
      if (isM) {
        if (e.successionStatus === "Ready Now") statusCounts["Ready Now"]++;
        else if (e.successionStatus === "Ready 1-2 Years") statusCounts["Ready 1-2 Years"]++;
        else if (e.successionStatus === "Ready 3-5 Years") statusCounts["Ready 3-5 Years"]++;
        else statusCounts["None (ไม่มีทายาท)"]++;
      }
    });

    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      จำนวนตำแหน่ง: value
    }));
  }, [employees]);

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: Risk Summary Card list */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-5 bg-[#F36B6B] rounded-full" />
          <div>
            <h3 className="text-sm font-medium text-[#1F2D3D]">ตัวชี้วัดความเสี่ยงด้านบุคลากร (Section A: Workforce Risk KPIs)</h3>
            <p className="text-[11px] text-[#5B6B7F] mt-0.5">รายงานสถิติอัตรากำลังใกล้พ้นวาระ ตำแหน่งผู้บริหารว่างสะสม และความพร้อมในการโอนย้ายความรู้</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" id="workforce-risk-cards">
          {/* Card 1 */}
          <div className="bg-white border border-[#DCE6F2] rounded-xl p-4.5 hover:shadow-xs hover:border-[#F36B6B]/30 transition-all duration-300 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center justify-between text-[#5B6B7F]">
              <span className="text-[11px] font-medium text-[#5B6B7F]">พนักงานอายุ 55+ ปี</span>
              <span className="p-1.5 bg-[#F36B6B]/8 text-[#F36B6B] rounded-lg">
                <ShieldAlert size={14} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-lg font-light text-[#1F2D3D] block">{(riskStats.age55Plus).toLocaleString()} คน</span>
              <span className="text-[9px] text-[#F36B6B] mt-1 block font-medium">ความเสี่ยงเกษียณสะสมสูง</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#DCE6F2] rounded-xl p-4.5 hover:shadow-xs hover:border-[#F36B6B]/30 transition-all duration-300 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center justify-between text-[#5B6B7F]">
              <span className="text-[11px] font-medium text-[#5B6B7F]">เกษียณใน 1 ปี</span>
              <span className="p-1.5 bg-[#F36B6B]/8 text-[#F36B6B] rounded-lg">
                <Calendar size={14} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-lg font-light text-[#1F2D3D] block">{(riskStats.age59).toLocaleString()} คน</span>
              <span className="text-[9px] text-[#F36B6B] mt-1 block font-medium">ต้องการแผนทดแทนทันที</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#DCE6F2] rounded-xl p-4.5 hover:shadow-xs hover:border-[#FFB547]/30 transition-all duration-300 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center justify-between text-[#5B6B7F]">
              <span className="text-[11px] font-medium text-[#5B6B7F]">เกษียณใน 3 ปี</span>
              <span className="p-1.5 bg-[#FFB547]/8 text-[#FFB547] rounded-lg">
                <AlertTriangle size={14} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-lg font-light text-[#1F2D3D] block">{(riskStats.age57_59).toLocaleString()} คน</span>
              <span className="text-[9px] text-[#FFB547] mt-1 block font-medium">ควรโอนย้ายทักษะงาน</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-[#DCE6F2] rounded-xl p-4.5 hover:shadow-xs hover:border-[#4C8DFF]/30 transition-all duration-300 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center justify-between text-[#5B6B7F]">
              <span className="text-[11px] font-medium text-[#5B6B7F]">เกษียณใน 5 ปี</span>
              <span className="p-1.5 bg-[#4C8DFF]/8 text-[#4C8DFF] rounded-lg">
                <TrendingDown size={14} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-lg font-light text-[#1F2D3D] block">{(riskStats.age55Plus).toLocaleString()} คน</span>
              <span className="text-[9px] text-[#4C8DFF] mt-1 block font-medium">แผนพัฒนาทรัพยากรระยะกลาง</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white border border-[#DCE6F2] rounded-xl p-4.5 hover:shadow-xs hover:border-[#F36B6B]/30 transition-all duration-300 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center justify-between text-[#5B6B7F]">
              <span className="text-[11px] font-medium text-[#5B6B7F]">ผู้บริหารสูงวัยใกล้เกษียณ</span>
              <span className="p-1.5 bg-[#F36B6B]/8 text-[#F36B6B] rounded-lg">
                <Flame size={14} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-lg font-light text-[#1F2D3D] block">{(riskStats.seniorManagers).toLocaleString()} คน</span>
              <span className="text-[9px] text-[#F36B6B] mt-1 block font-medium">ความเสี่ยงผู้นำขาดช่วง</span>
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-white border border-[#DCE6F2] rounded-xl p-4.5 hover:shadow-xs hover:border-[#F36B6B]/30 transition-all duration-300 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center justify-between text-[#5B6B7F]">
              <span className="text-[11px] font-medium text-[#5B6B7F]">ไร้ทายาทสืบทอด</span>
              <span className="p-1.5 bg-[#F36B6B]/8 text-[#F36B6B] rounded-lg">
                <UserX size={14} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-lg font-light text-[#1F2D3D] block">{(riskStats.criticalNoSuccessor).toLocaleString()} ตำแหน่ง</span>
              <span className="text-[9px] text-[#F36B6B] mt-1 block font-medium">Critical Role Succession Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: Age & Tenure Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Age distribution */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-4 bg-[#2F6FE4] rounded-full" />
              <h4 className="text-sm font-medium text-[#1F2D3D]">โครงสร้างช่วงอายุพนักงานหลัก (Age Distribution Map)</h4>
            </div>
            <p className="text-[11px] text-[#5B6B7F] mb-5">คัดกรองพนักงานแยกรายปริมาณและร้อยละ เพื่อเฝ้าสังเกตการณ์แนวโน้มประชากรสูงวัยในองค์กร</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2ECF5" />
                <XAxis dataKey="name" stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", borderColor: "#DCE6F2", fontSize: "11px" }}
                  formatter={(value) => [`${value} คน`, "จำนวนพนักงาน"]}
                />
                <Bar dataKey="จำนวนคน" fill="#4C8DFF" radius={[4, 4, 0, 0]} barSize={32}>
                  {ageDistributionData.map((entry, index) => {
                    const isHighRisk = entry.name.includes("55");
                    return <Cell key={`cell-${index}`} fill={isHighRisk ? "#F36B6B" : "#4C8DFF"} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tenure distribution */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-4 bg-[#2DBE7F] rounded-full" />
              <h4 className="text-sm font-medium text-[#1F2D3D]">ความเหนียวแน่นและอายุการปฏิบัติงาน (Tenure Horizon)</h4>
            </div>
            <p className="text-[11px] text-[#5B6B7F] mb-5">ปริมาณอายุงานสะสมแสดงความมั่นคง เสถียรภาพ และความภักดีของทรัพยากรบุคคลที่มีต่อสถาบัน</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tenureDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2ECF5" />
                <XAxis dataKey="name" stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", borderColor: "#DCE6F2", fontSize: "11px" }}
                  formatter={(value) => [`${value} คน`, "จำนวนพนักงาน"]}
                />
                <Area type="monotone" dataKey="จำนวนคน" stroke="#2DBE7F" fill="#2DBE7F" fillOpacity={0.06} strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 4 & 5: Retirement Risk & Succession Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Retirement by Line */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-4 bg-[#F36B6B] rounded-full" />
              <h4 className="text-sm font-medium text-[#1F2D3D]">สายงานหลักที่มีปริมาณพนักงานเสี่ยงเกษียณสูงสุด (Top 6)</h4>
            </div>
            <p className="text-[11px] text-[#5B6B7F] mb-5">จัดอันดับสายงานที่ต้องการการถ่ายโอนทักษะด่วนที่สุดเนื่องจากปริมาณผู้พ้นวาระสะสมสูง</p>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retirementByLine} layout="vertical" margin={{ top: 5, right: 35, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#E2ECF5" />
                <XAxis type="number" stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#1F2D3D" fontSize={9} tickLine={false} axisLine={false} width={135} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", borderColor: "#DCE6F2", fontSize: "11px" }}
                  formatter={(value, name, props) => [`${value} คน (สัดส่วนสะสม ${props.payload.สัดส่วนร้อยละ}%)`, "อายุ 55 ปีขึ้นไป"]}
                />
                <Bar dataKey="พนักงานอาวุโส" fill="#F36B6B" radius={[0, 4, 4, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Succession Risk */}
        <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-4 bg-[#2DBE7F] rounded-full" />
              <h4 className="text-sm font-medium text-[#1F2D3D]">ความพร้อมของทายาทสืบทอดระดับจัดการ (Succession Readiness)</h4>
            </div>
            <p className="text-[11px] text-[#5B6B7F] mb-5">ตรวจสอบสถานะความคุมครองและการเตรียมพร้อมทดแทนในระดับ Level 9 ขึ้นไป</p>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={successionData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2ECF5" />
                <XAxis dataKey="name" stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#5B6B7F" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "10px", borderColor: "#DCE6F2", fontSize: "11px" }}
                  formatter={(value) => [`${value} ตำแหน่ง`, "จำนวนตำแหน่ง"]}
                />
                <Bar dataKey="จำนวนตำแหน่ง" fill="#2DBE7F" radius={[4, 4, 0, 0]} barSize={32}>
                  {successionData.map((entry, index) => {
                    const isNone = entry.name.includes("None");
                    return <Cell key={`cell-${index}`} fill={isNone ? "#F36B6B" : "#2DBE7F"} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 6: Risk Insight panel - Beautifully Redesigned as an Action Board */}
      <div className="bg-white border border-[#DCE6F2] rounded-2xl p-6 shadow-sm" id="risk-insights-alert-panel">
        
        {/* Banner header inside card */}
        <div className="flex items-start gap-3.5 pb-5 border-b border-[#DCE6F2]/60 mb-6">
          <div className="p-2.5 bg-[#F36B6B]/8 text-[#F36B6B] rounded-xl shrink-0 animate-pulse">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#1F2D3D]">แผงวินิจฉัยความเสี่ยงและข้อเสนอแนะฝ่ายจัดการ (Workforce Risk Mitigation & Intervention Board)</h4>
            <p className="text-xs text-[#5B6B7F] mt-0.5">รวมประเด็นความเสี่ยงสูงสุดและแผนผังแนวทางบรรเทาผลกระทบที่เสนอแนะต่อคณะกรรมการจัดการ</p>
          </div>
        </div>

        {/* Content columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Risk 1 */}
          <div className="bg-[#F6F9FC] border border-[#DCE6F2] rounded-xl p-5 hover:border-[#F36B6B]/30 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F36B6B]" />
                <h5 className="text-xs font-medium text-[#1F2D3D]">วิกฤตความต่อเนื่องในตำแหน่งผู้บริหารย่อยภูมิภาค (Regional Leadership Continuity)</h5>
              </div>
              <p className="text-xs text-[#5B6B7F] leading-relaxed font-light">
                ตำแหน่งผู้จัดการสาขาและหัวหน้าฝ่ายปฏิบัติการในสังกัด <span className="text-[#F36B6B] font-medium">สายงานภูมิภาค 1 และภูมิภาค 2</span> กำลังจะพ้นกำหนดเกษียณอายุพร้อมกันมากกว่า <span className="text-[#F36B6B] font-medium">20% ของจำนวนทั้งหมด</span> ในระยะเวลาอีก 1-3 ปีข้างหน้า มีสถิติสะสมความเสี่ยงการตัดสินใจด้านอนุมัติสินเชื่อขาดตอน
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#DCE6F2]/70 flex items-center justify-between text-[11px] text-[#F36B6B]">
              <span className="font-medium">ระดับความเร่งด่วน: วิกฤตสูงสุด (Critical Action Required)</span>
              <div className="flex items-center gap-1 cursor-pointer hover:underline">
                <span>รายละเอียดแผนสืบทอด</span>
                <ArrowRight size={11} />
              </div>
            </div>
          </div>

          {/* Risk 2 */}
          <div className="bg-[#F6F9FC] border border-[#DCE6F2] rounded-xl p-5 hover:border-[#F36B6B]/30 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FFB547]" />
                <h5 className="text-xs font-medium text-[#1F2D3D]">การพึ่งพิงกำลังพลภายนอกและสุญญากาศผู้สืบทอด (Succession Vacuum in Critical Roles)</h5>
              </div>
              <p className="text-xs text-[#5B6B7F] leading-relaxed font-light">
                อัตรา <span className="text-[#1F2D3D] font-medium">Critical Role Succession</span> ในตำแหน่งงานเฉพาะทาง (รวมถึงสายเทคโนโลยีดิจิทัลและกลุ่มตรวจสอบวินัย) ไม่มีทายาทสืบทอดที่พร้อมปฏิบัติงานทันที (Status: None) สูงเกิน <span className="text-[#F36B6B] font-medium">30 ตำแหน่ง</span> ส่งผลต่อความราบรื่นในการย้ายระบบธนาคารสู่ Cloud System
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#DCE6F2]/70 flex items-center justify-between text-[11px] text-[#FFB547]">
              <span className="font-medium">ระดับความเร่งด่วน: ปานกลางค่อนข้างสูง (High Priority Intervention)</span>
              <div className="flex items-center gap-1 cursor-pointer hover:underline">
                <span>เปิดแผน Talent Mapping</span>
                <ArrowRight size={11} />
              </div>
            </div>
          </div>

        </div>

        {/* Strategic Intervention recommendations */}
        <div className="mt-6 pt-5 border-t border-[#DCE6F2]/60 bg-[#F6F9FC]/40 p-4 rounded-xl border border-dashed border-[#DCE6F2]">
          <span className="text-[11px] font-medium text-[#1F2D3D] block uppercase tracking-wider mb-2.5">กรอบแนวทางการดำเนินนโยบายแก้ไขปัญหาเฉพาะหน้า (Strategic Intervention Framework)</span>
          <ul className="space-y-2 text-xs text-[#5B6B7F]">
            <li className="flex items-start gap-2 font-light">
              <span className="text-[#2DBE7F] mt-0.5">✔</span>
              <span>ริเริ่มจัดตั้งโครงการ <span className="text-[#1F2D3D] font-medium">"Fast-Track Executive Ready"</span> ดึงพนักงานระดับ Level 8 เจ้าหน้าที่อาวุโส เข้าโปรแกรมถ่ายโอนความรู้และการตัดสินใจจากผู้จัดการสาขาปัจจุบันก่อนล่วงหน้าเกษียณ 12 เดือน</span>
            </li>
            <li className="flex items-start gap-2 font-light">
              <span className="text-[#2DBE7F] mt-0.5">✔</span>
              <span>บูรณาการระบบ <span className="text-[#1F2D3D] font-medium">HR Knowledge Management System</span> ปิดช่องว่างความรู้ที่สูญหายจากการเกษียณ โดยเฉพาะนโยบายกู้เงินและแนวทางบรรเทาหนี้เสีย SME ท้องถิ่น</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}
