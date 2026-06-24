/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Employee {
  empId: string;
  name: string;
  nameEn: string;
  position: string;
  level: string;
  department: string; // ส่วน/เขต
  assignmentOrder: string; // สังกัดตามคำสั่ง
  assignmentStructure: string; // สังกัดตามโครงสร้าง
  zone: string; // เขต
  region: string; // ภาค
  businessLine: string; // สายงาน
  group: string; // กลุ่ม
  responsibility: string; // ความรับผิดชอบ
  actingPosition: string; // รักษาการในตำแหน่ง
  branchOps: string; // ปฏิบัติการสาขา
  frontBack: "Front" | "Back";
  hb: "Head Office" | "Branch";
  birthDate: string;
  email: string;
  phone: string;
  mobile: string;
  remarks: string;
  orderNumber: string;
  joinDate: string;
  startLevel: string;
  startPosition: string;
  startActing: string;
  startUnit: string;
  age: number; // อายุตัว
  tenure: number; // อายุงาน (ปี)
  levelAge: number; // อายุระดับ (ปี)
  positionAge: number; // อายุตำแหน่ง (ปี)
  actingAge: number; // อายุรักษาการ (ปี)
  unitAge: number; // อายุสังกัด (ปี)
  contractType: "พนักงานประจำ" | "พนักงานสัญญาจ้าง";
  gender: "ชาย" | "หญิง";
  performanceRating: "High Performer" | "Meets Standard" | "Needs Support";
  successionStatus: "Ready Now" | "Ready 1-2 Years" | "Ready 3-5 Years" | "None";
}

export interface Resignation {
  id: number;
  contractType: string;
  joinDate: string;
  empId: string;
  name: string;
  position: string;
  level: string;
  department: string; // ส่วน/สาขา/ศูนย์
  division: string; // สังกัด/ฝ่าย
  resignDate: string;
  resignReason: string;
  resignType: "Focus resignation" | "Non-Focus resignation";
  month: string;
  isPermanent: boolean;
  isContract: boolean;
}

// Lists of Thai names and surnames to generate realistic mock data
const firstNamesM = [
  "กิตติภพ", "จิรวัฒน์", "ธนพล", "นพดล", "ปรีชา", "วรวุฒิ", "สมชาย", "อภิชาติ", "เกียรติศักดิ์", "ชัชวาลย์",
  "ณรงค์", "ทรงพล", "ทวีศักดิ์", "บดินทร์", "พงษ์ศักดิ์", "พีรพล", "ยุทธนา", "รุ่งโรจน์", "วิชาญ", "ศิริชัย"
];
const firstNamesF = [
  "กนกวรรณ", "จารุวรรณ", "ธัญญารัตน์", "นพวรรณ", "ปรียานุช", "วรัญญา", "สมศรี", "อัญชลี", "สุภาพร", "ชลลดา",
  "ณิชาภา", "ทิพวรรณ", "เบญจวรรณ", "พรทิพย์", "พัชราภรณ์", "รุ่งทิพย์", "วรรณภา", "วิภาดา", "ศิริพร", "สุวรรณา"
];
const lastNames = [
  "ดีเลิศ", "รักชาติ", "มั่นคง", "เจริญสุข", "รุ่งเรือง", "วัฒนา", "ศรีสุข", "วงษ์สุวรรณ", "เลิศวิจิตร", "พงษ์พานิช",
  "ปัญญาดี", "งามประเสริฐ", "ทองคำ", "สมบูรณ์", "สิงหราช", "แก้วมณี", "สุขสวัสดิ์", "ประสิทธิผล", "อมรศิลป์", "รัตนวิจิตร"
];

const positionsByLevel: Record<string, string[]> = {
  "Level 13 ขึ้นไป": ["ผู้ช่วยกรรมการผู้จัดการ", "รองกรรมการผู้จัดการ", "ผู้อำนวยการอาวุโสฝ่าย"],
  "Level 12": ["ผู้อำนวยการฝ่าย", "ผู้เชี่ยวชาญอาวุโส"],
  "Level 11": ["ผู้ช่วยผู้อำนวยการฝ่าย", "ผู้จัดการเขต", "ผู้เชี่ยวชาญ"],
  "Level 10": ["ผู้จัดการอาวุโสสาขา", "หัวหน้าส่วนงาน", "ผู้ช่วยผู้อำนวยการส่วน"],
  "Level 9": ["ผู้จัดการสาขา", "หัวหน้าทีมวิเคราะห์สินเชื่อ", "ผู้จัดการส่วน"],
  "Level 8 ผู้ช่วยผู้จัดการ": ["ผู้ช่วยผู้จัดการสาขา", "วิเคราะห์สินเชื่ออาวุโส", "หัวหน้างานฝ่าย"],
  "Level 8 เจ้าหน้าที่อาวุโส": ["เจ้าหน้าที่อาวุโสพัฒนาธุรกิจ", "เจ้าหน้าที่คอมพิวเตอร์อาวุโส", "เจ้าหน้าที่วิเคราะห์ระบบอาวุโส"],
  "Level 7": ["เจ้าหน้าที่พัฒนาธุรกิจ", "เจ้าหน้าที่สินเชื่อ", "เจ้าหน้าที่ปฏิบัติการอาวุโส"],
  "Level 6": ["เจ้าหน้าที่บริการลูกค้า", "เจ้าหน้าที่ธุรการอาวุโส", "เจ้าหน้าที่สนับสนุนวิเคราะห์สินเชื่อ"],
  "Level 5": ["พนักงานปฏิบัติการสาขา", "พนักงานขับรถ", "พนักงานธุรการ"],
  "Level 4 หรือต่ำกว่า": ["พนักงานสนับสนุนทั่วไป", "ผู้ช่วยพนักงานปฏิบัติการ"]
};

// Seeded pseudorandom generator for deterministic data
function createRandom(seed: number) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateHRData(): { employees: Employee[]; resignations: Resignation[] } {
  const rand = createRandom(12345);
  
  const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
  const pickWeighted = <T>(arr: T[], weights: number[]): T => {
    let total = weights.reduce((a, b) => a + b, 0);
    let r = rand() * total;
    for (let i = 0; i < arr.length; i++) {
      r -= weights[i];
      if (r <= 0) return arr[i];
    }
    return arr[arr.length - 1];
  };

  const businessLines = [
    { name: "สายงานสาขา 2", target: 470, hb: "Branch" as const, fb: "Front" as const },
    { name: "สายงานสาขา 1", target: 437, hb: "Branch" as const, fb: "Front" as const },
    { name: "สายงานวิเคราะห์สินเชื่อ", target: 212, hb: "Head Office" as const, fb: "Front" as const },
    { name: "สายงานบริหารคุณภาพสินเชื่อ", target: 162, hb: "Head Office" as const, fb: "Back" as const },
    { name: "สายงานปฏิบัติการ", target: 122, hb: "Head Office" as const, fb: "Back" as const },
    { name: "สายงานกฎหมาย", target: 117, hb: "Head Office" as const, fb: "Back" as const },
    { name: "สายงานธุรกิจดิจิทัลและเทคโนโลยีสารสนเทศ", target: 112, hb: "Head Office" as const, fb: "Back" as const },
    { name: "สายงานจัดการทรัพยากร", target: 103, hb: "Head Office" as const, fb: "Back" as const },
    { name: "สายงานบริหารเงินและบัญชี", target: 91, hb: "Head Office" as const, fb: "Back" as const },
    { name: "หน่วยงานขึ้นตรงกรรมการผู้จัดการ", target: 79, hb: "Head Office" as const, fb: "Back" as const }
  ];

  // Rest of employees (2182 - 1905 = 277) assigned to other operational departments
  const otherBusinessLines = [
    { name: "สายงานยุทธศาสตร์และสื่อสารองค์กร", target: 100, hb: "Head Office" as const, fb: "Back" as const },
    { name: "สายงานตรวจสอบภายใน", target: 75, hb: "Head Office" as const, fb: "Back" as const },
    { name: "สายงานบริหารความเสี่ยง", target: 102, hb: "Head Office" as const, fb: "Back" as const }
  ];

  const allLines = [...businessLines, ...otherBusinessLines];

  // Target distributions for levels
  const levelTargets: { level: string; count: number }[] = [
    { level: "Level 13 ขึ้นไป", count: 29 },
    { level: "Level 12", count: 47 },
    { level: "Level 11", count: 107 },
    { level: "Level 10", count: 166 },
    { level: "Level 9", count: 176 },
    { level: "Level 8 ผู้ช่วยผู้จัดการ", count: 281 },
    { level: "Level 8 เจ้าหน้าที่อาวุโส", count: 316 },
    { level: "Level 7", count: 465 },
    { level: "Level 6", count: 360 },
    { level: "Level 5", count: 121 },
    { level: "Level 4 หรือต่ำกว่า", count: 114 } // Assigned remaining to match exactly 2,182
  ];

  // Target distributions for ages
  // Under 30: 170, 30-39: 804, 40-49: 635, 50-54: 277, 55+: 296
  const ageRanges = [
    { name: "under30", min: 22, max: 29, count: 170 },
    { name: "30_39", min: 30, max: 39, count: 804 },
    { name: "40_49", min: 40, max: 49, count: 635 },
    { name: "50_54", min: 50, max: 54, count: 277 },
    { name: "55_plus", min: 55, max: 60, count: 296 }
  ];

  // Pre-generate arrays for ages, levels, business lines to match EXACT targets
  const levelPool: string[] = [];
  levelTargets.forEach(t => {
    for (let i = 0; i < t.count; i++) levelPool.push(t.level);
  });

  const agePool: number[] = [];
  ageRanges.forEach(r => {
    const totalCount = r.count;
    for (let i = 0; i < totalCount; i++) {
      // Deterministically spread ages
      const step = (r.max - r.min) === 0 ? 0 : (i % (r.max - r.min + 1));
      agePool.push(r.min + step);
    }
  });

  const linePool: typeof allLines[0][] = [];
  allLines.forEach(l => {
    for (let i = 0; i < l.target; i++) linePool.push(l);
  });

  // Shuffle pools slightly with seeded random to make records realistic but structured
  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  };

  const levelShuffled = shuffle(levelPool);
  const ageShuffled = shuffle(agePool);
  const lineShuffled = shuffle(linePool);

  const employees: Employee[] = [];
  const totalEmployees = 2182;
  const permanentCount = 2087; // 2,087 permanent, 95 contract

  // Pre-generate genders (approx 45% male, 55% female for banking)
  const genders = Array.from({ length: totalEmployees }, (_, i) => (i % 100 < 45 ? ("ชาย" as const) : ("หญิง" as const)));
  const shuffledGenders = shuffle(genders);

  // Generate employee list
  for (let i = 0; i < totalEmployees; i++) {
    const empId = `SME${(10000 + i + 1).toString()}`;
    const gender = shuffledGenders[i];
    const isM = gender === "ชาย";
    const firstName = isM ? pick(firstNamesM) : pick(firstNamesF);
    const lastName = pick(lastNames);
    const name = `${firstName} ${lastName}`;
    
    // Convert Thai names roughly to English
    const firstNameEn = isM ? "Kitti" : "Jarunee";
    const lastNameEn = "Suksawat";
    const nameEn = `${firstNameEn} ${lastNameEn}`;

    const level = levelShuffled[i] || "Level 7";
    const age = ageShuffled[i] || 42;
    const line = lineShuffled[i] || allLines[0];

    // Determine Contract Type: Contract (95 total), assigned mostly to lower levels or special support
    // We assign 95 contract employees
    let contractType: "พนักงานประจำ" | "พนักงานสัญญาจ้าง" = "พนักงานประจำ";
    if (i < 95) {
      contractType = "พนักงานสัญญาจ้าง";
    }

    // Determine tenure based on age: age 25 -> tenure 1-3 years, age 50 -> tenure 10-25 years
    let tenure = Math.floor((age - 22) * (0.3 + rand() * 0.5));
    if (tenure < 0) tenure = 0;
    if (contractType === "พนักงานสัญญาจ้าง" && tenure > 4) {
      tenure = Math.floor(rand() * 3) + 1;
    }

    // Performance Rating distribution: High Performer 15%, Meets Standard 75%, Needs Support 10%
    const pRating = pickWeighted<Employee["performanceRating"]>(
      ["High Performer", "Meets Standard", "Needs Support"],
      [15, 75, 10]
    );

    // Succession Status: Only applicable to Level 9 and above (managers)
    let successionStatus: Employee["successionStatus"] = "None";
    const levelNum = parseInt(level.replace(/[^0-9]/g, "")) || 0;
    if (levelNum >= 9 || level.includes("13")) {
      successionStatus = pickWeighted<Employee["successionStatus"]>(
        ["Ready Now", "Ready 1-2 Years", "Ready 3-5 Years", "None"],
        [20, 30, 30, 20]
      );
    }

    const positions = positionsByLevel[level] || ["เจ้าหน้าที่"];
    const position = pick(positions);

    // Grouping
    const groupsByLine: Record<string, string[]> = {
      "สายงานสาขา 1": ["ฝ่ายพัฒนาและบริการลูกค้าสาขา 1", "ฝ่ายตรวจสอบและเร่งรัดสาขา 1", "ฝ่ายเครือข่ายสาขาภาคกลาง"],
      "สายงานสาขา 2": ["ฝ่ายพัฒนาและบริการลูกค้าสาขา 2", "ฝ่ายตรวจสอบและเร่งรัดสาขา 2", "ฝ่ายเครือข่ายสาขาภาคเหนือ"],
      "สายงานวิเคราะห์สินเชื่อ": ["ฝ่ายวิเคราะห์สินเชื่อผู้ประกอบการ", "ฝ่ายวิเคราะห์สินเชื่อรายย่อย", "ฝ่ายประเมินความเสี่ยงและราคา"],
      "สายงานบริหารคุณภาพสินเชื่อ": ["ฝ่ายควบคุมคุณภาพสินเชื่อ", "ฝ่ายเร่งรัดหนี้สิน", "ฝ่ายกฎหมายหนี้สิน"],
      "สายงานปฏิบัติการ": ["ฝ่ายเทคโนโลยีปฏิบัติการ", "ฝ่ายสนับสนุนธุรกรรม", "ฝ่ายบริการกลาง"],
      "สายงานกฎหมาย": ["ฝ่ายที่ปรึกษากฎหมาย", "ฝ่ายคดีความและนิติกรรม", "ฝ่ายตรวจสอบสัญญา"],
      "สายงานธุรกิจดิจิทัลและเทคโนโลยีสารสนเทศ": ["ฝ่ายพัฒนาระบบดิจิทัล", "ฝ่ายโครงสร้างพื้นฐานไอที", "ฝ่ายบริหารระบบสารสนเทศ"],
      "สายงานจัดการทรัพยากร": ["ฝ่ายพัฒนาบุคลากร", "ฝ่ายสรรหาและค่าตอบแทน", "ฝ่ายสวัสดิการและแรงงานสัมพันธ์"],
      "สายงานบริหารเงินและบัญชี": ["ฝ่ายบัญชีและการเงิน", "ฝ่ายบริหารเงินทุน", "ฝ่ายงบประมาณและวางแผน"],
      "หน่วยงานขึ้นตรงกรรมการผู้จัดการ": ["ฝ่ายเลขานุการและธรรมาภิบาล", "ฝ่ายสื่อสารองค์กร", "ฝ่ายพัฒนายุทธศาสตร์"],
      "สายงานยุทธศาสตร์และสื่อสารองค์กร": ["ฝ่ายกลยุทธ์ธนาคาร", "ฝ่ายสื่อสารการตลาด"],
      "สายงานตรวจสอบภายใน": ["ฝ่ายตรวจสอบการเงิน", "ฝ่ายตรวจสอบไอที"],
      "สายงานบริหารความเสี่ยง": ["ฝ่ายวิเคราะห์ความเสี่ยงเครดิต", "ฝ่ายจัดการความเสี่ยงองค์กร"]
    };

    const lineGroups = groupsByLine[line.name] || ["ฝ่ายจัดการและแผนงาน"];
    const group = pick(lineGroups);
    const department = group.replace("ฝ่าย", "ส่วนงาน");

    // Order and structure assignments
    const assignmentOrder = group;
    const assignmentStructure = group;

    const zone = line.hb === "Branch" ? `เขต ${Math.floor(rand() * 5) + 1}` : "สำนักงานใหญ่";
    const region = line.hb === "Branch" ? `ภาค ${Math.floor(rand() * 3) + 1}` : "กรุงเทพและปริมณฑล";

    const email = `${empId.toLowerCase()}@smebank.co.th`;
    const phone = `02-265-${(3000 + i).toString()}`;
    const mobile = `08${Math.floor(rand() * 10)}${Math.floor(rand() * 10000000).toString().padStart(7, "0")}`;

    // Join and Start dates
    const startYear = 2026 - tenure;
    const joinDate = `${startYear}-01-15`;
    const birthYear = 2026 - age;
    const birthDate = `${birthYear}-06-15`;

    employees.push({
      empId,
      name,
      nameEn,
      position,
      level,
      department,
      assignmentOrder,
      assignmentStructure,
      zone,
      region,
      businessLine: line.name,
      group,
      responsibility: "บริหารและจัดการงานตามภารกิจของฝ่ายงานเพื่อสนับสนุนเป้าหมาย SME D Bank",
      actingPosition: rand() > 0.95 ? "รักษาการผู้ช่วยผู้อำนวยการ" : "-",
      branchOps: line.hb === "Branch" ? "ปฏิบัติการสาขา" : "ไม่เข้าข่าย",
      frontBack: line.fb,
      hb: line.hb,
      birthDate,
      email,
      phone,
      mobile,
      remarks: "-",
      orderNumber: `คำสั่งธนาคารที่ ${Math.floor(rand() * 500) + 1}/2568`,
      joinDate,
      startLevel: level,
      startPosition: position,
      startActing: "-",
      startUnit: group,
      age,
      tenure,
      levelAge: Math.floor(tenure * 0.4) || 1,
      positionAge: Math.floor(tenure * 0.3) || 1,
      actingAge: 0,
      unitAge: Math.floor(tenure * 0.5) || 1,
      contractType,
      gender,
      performanceRating: pRating,
      successionStatus
    });
  }

  // Generate Resignations (Turnover) -> exactly 73 records
  // 42 Focus, 31 Non-Focus
  const resignations: Resignation[] = [];
  const resignationReasons = [
    { reason: "ได้งานใหม่", weight: 35 },
    { reason: "ดูแลบิดา-มารดา / ครอบครัว", weight: 15 },
    { reason: "ย้ายถิ่นฐาน / กลับภูมิลำเนา", weight: 12 },
    { reason: "ปัญหาสุขภาพ", weight: 10 },
    { reason: "เหตุผลส่วนตัว", weight: 18 },
    { reason: "สิ้นสุดสัญญาจ้าง", weight: 10 }
  ];

  const pickResignReason = (): string => {
    return pickWeighted(
      resignationReasons.map(r => r.reason),
      resignationReasons.map(r => r.weight)
    );
  };

  const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน"];

  for (let i = 1; i <= 73; i++) {
    const isFocus = i <= 42; // Exactly 42 focus, 31 non-focus
    const contractType = i % 12 === 0 ? "พนักงานสัญญาจ้าง" : "พนักงานประจำ";
    const level = pickWeighted(
      ["Level 5", "Level 6", "Level 7", "Level 8 เจ้าหน้าที่อาวุโส", "Level 8 ผู้ช่วยผู้จัดการ", "Level 9 ผู้จัดการ", "Level 10 ผู้จัดการอาวุโส"],
      [10, 20, 30, 20, 10, 6, 4]
    );
    const pos = positionsByLevel[level] ? pick(positionsByLevel[level]) : "เจ้าหน้าที่";
    const line = pick(allLines).name;
    const div = pick([
      "ฝ่ายพัฒนาและบริการลูกค้าสาขา 1",
      "ฝ่ายวิเคราะห์สินเชื่อผู้ประกอบการ",
      "ฝ่ายพัฒนาธุรกิจและนวัตกรรมดิจิทัล",
      "ฝ่ายเร่งรัดหนี้สิน",
      "ฝ่ายบัญชีและการเงิน"
    ]);

    const month = pickWeighted(
      months,
      [12, 14, 15, 18, 10, 4] // Represent trend with April peak
    );

    const empId = `SME-R${(1000 + i).toString()}`;
    const name = `${pick(i % 2 === 0 ? firstNamesM : firstNamesF)} ${pick(lastNames)}`;
    const joinYear = 2020 - Math.floor(rand() * 5);
    const joinDate = `${joinYear}-04-01`;
    
    // Determine resign date in 2569 (2026)
    const monthNum = months.indexOf(month) + 1;
    const day = Math.floor(rand() * 20) + 1;
    const resignDate = `2026-${monthNum.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

    resignations.push({
      id: i,
      contractType,
      joinDate,
      empId,
      name,
      position: pos,
      level,
      department: div.replace("ฝ่าย", "ส่วนงาน"),
      division: div,
      resignDate,
      resignReason: pickResignReason(),
      resignType: isFocus ? "Focus resignation" : "Non-Focus resignation",
      month,
      isPermanent: contractType === "พนักงานประจำ",
      isContract: contractType === "พนักงานสัญญาจ้าง"
    });
  }

  return { employees, resignations };
}
