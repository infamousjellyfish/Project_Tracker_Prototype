/* =========================================================
   DATA — sample projects (replace/extend via Add Project or Excel import)
   ========================================================= 
const PROJECTS = [
  {
    name:"Project A",
    strategicPillar: "Revenue Growth",
    trend: "flat",
    contractValue: 2500000,
    budget: { allocated: 1500000, spent: 1200000 },
    output:{target:1200, installed:910, achv:76, reqRate:12, curRate:9, metric:"Deliverables", status:"At Risk"},
    milestone:{stage:"Execution", status:"At Risk"},
    sla:{penalty:0, status:"Compliant"},
    risk:{critical:0, high:1, medium:2, low:3},
    predictive:{milestone:"Phase 3 Rollout", deadline:"30 Sep", forecast:"", risk:""},
    overall:"amber"
  },
  {
    name:"Project B",
    strategicPillar: "Digital Transformation",
    trend: "up",
    contractValue: 800000,
    budget: { allocated: 600000, spent: 580000 },
    output:{target:800, installed:720, achv:90, reqRate:9, curRate:9.5, metric:"Story Points", status:"On Track"},
    milestone:{stage:"Testing & QA", status:"On Track"},
    sla:{penalty:2, status:"At Risk"},
    risk:{critical:1, high:2, medium:1, low:2},
    predictive:{milestone:"UAT Sign-off", deadline:"15 Oct", forecast:"", risk:""},
    overall:"amber"
  },
  {
    name:"Project C",
    strategicPillar: "Cost Optimization",
    trend: "down",
    contractValue: 4200000,
    budget: { allocated: 3000000, spent: 2200000 },
    output:{target:500, installed:275, achv:55, reqRate:6, curRate:4, metric:"Tasks", status:"Delayed"},
    milestone:{stage:"Execution", status:"Delayed"},
    sla:{penalty:7, status:"Critical Breach"},
    risk:{critical:2, high:3, medium:1, low:0},
    predictive:{milestone:"Production Go-Live", deadline:"30 Sep", forecast:"", risk:""},
    overall:"red"
  },
  {
    name:"Project D",
    strategicPillar: "Infrastructure",
    trend: "flat",
    contractValue: 1200000,
    budget: { allocated: 900000, spent: 150000 },
    output:null,
    milestone:null,
    sla:null,
    risk:{critical:3, high:2, medium:1, low:1},
    predictive:null,
    overall:"red"
  }
];
*/
const PROJECTS = [];
const MILESTONE_STAGES = ["Initiation","Planning","Procurement","Execution","Testing & QA","Deployment","Closure"];

const SLA_PARAMS = [
  ["Milestone on-time delivery","≥95% of milestones on schedule","1%"],
  ["Deliverable quality (defect-free)","≥98% pass first review","1%"],
  ["Status report submission","100% within 24 hrs of due date","2%"],
  ["Documentation completeness","≥99.5% of required docs submitted","3%"],
  ["Issue / defect resolution","100% within 16 days of logging","1.5% each"],
  ["Change request turnaround","≥90% acknowledged within 24 hrs","2%"],
  ["Stakeholder query response","≥99.9% within 30 min (business hrs)","3%"],
  ["Overall system/service availability","≥99.5% monthly uptime","4%"]
];

const INSIGHT_STAGES = ["Data Aggregation","Pattern Detection","Contextualization","Prioritization","Actionability"];

/* =========================================================
   HELPERS
   ========================================================= */
function statusClass(status){
  if(!status) return "muted";
  const s = status.toLowerCase();
  if(s.includes("on track") || s.includes("compliant") || s==="low" || s.includes("on time") || s.includes("complete")) return "green";
  if(s.includes("at risk") || s.includes("medium")) return "amber";
  if(s.includes("delayed") || s.includes("breach") || s.includes("high") || s.includes("critical") || s.includes("late") || s.includes("stalled")) return "red";
  return "muted";
}

function fmt(n){ return n===null||n===undefined ? "—" : n.toLocaleString("en-US"); }
function fmtMoney(n){ return n===null||n===undefined ? "—" : "$" + n.toLocaleString("en-US"); }

function computeOverall(p){
  if (p.milestone && p.milestone.stage === "Closure") return "green";
  
  let red = 0, amber = 0;
  if(p.milestone){
    if(p.milestone.status === "Delayed") red++;
    else if(p.milestone.status === "At Risk") amber++;
  }
  if(p.sla){
    const c = statusClass(p.sla.status);
    if(c === "red") red++;
    else if(c === "amber") amber++;
  }
  
  if(p.predictive) {
    if(p.predictive.risk === "High") red++;
    else if(p.predictive.risk === "Medium") amber++;
  }

  if(p.risk.critical >= 2) red++;
  else if(p.risk.critical >= 1 || p.risk.high >= 2) amber++;

  if(red > 0) return "red";
  if(amber > 0) return "amber";
  return "green";
}

function recomputeOverall(){
  PROJECTS.forEach(p => {
    if (p.milestone && p.milestone.stage === "Closure") {
      if (p.output && p.output.target) {
        p.output.installed = p.output.target;
        p.output.achv = 100;
      }
      p.milestone.status = "Complete";
      if (p.sla) p.sla.status = "Complete";
      if (p.predictive) p.predictive.risk = "Complete";
      if (p.risk) { p.risk.critical = 0; p.risk.high = 0; p.risk.medium = 0; p.risk.low = 0; }
    }
    p.overall = computeOverall(p);
  });
}

function updatePredictiveForecasts() {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  PROJECTS.forEach(p => {
    if (p.predictive && p.output && p.output.target > 0) {
      const remaining = Math.max(0, p.output.target - (p.output.installed || 0));
      
      if (remaining === 0 || (p.milestone && p.milestone.stage === "Closure")) {
        p.predictive.forecast = "Completed";
        p.predictive.risk = "Low";
      } else if (p.output.curRate > 0) {
        const daysRemaining = Math.ceil(remaining / p.output.curRate);
        const forecastDate = new Date(today.getTime() + (daysRemaining * 24 * 60 * 60 * 1000));
        
        p.predictive.forecast = forecastDate.toLocaleDateString("en-US", {day:"2-digit", month:"short"});
        
        if (p.predictive.deadline) {
           let dlDate = new Date(`${p.predictive.deadline} ${currentYear}`);
           if (!isNaN(dlDate.getTime()) && dlDate.getMonth() < today.getMonth() - 6) {
             dlDate = new Date(`${p.predictive.deadline} ${currentYear + 1}`);
           }
           
           if (!isNaN(dlDate.getTime())) {
              const daysLate = Math.ceil((forecastDate - dlDate) / (1000 * 60 * 60 * 24));
              if (daysLate > 14) p.predictive.risk = "High";
              else if (daysLate > 0) p.predictive.risk = "Medium";
              else p.predictive.risk = "Low";
           }
        }
      } else {
        p.predictive.forecast = "Stalled (Pace: 0)";
        p.predictive.risk = "High";
      }
    }
  });
}

function renderAll(){
  updatePredictiveForecasts();
  recomputeOverall();
  renderKPIs();
  renderPortfolioList();
  renderTopRisk();
  renderOutputTable();
  renderPipeline();
  renderSlaStatusList();
  renderSlaParams();
  renderHeatmap();
  renderPredictive();
  renderInsightPipeline();
  buildCharts();
}

/* =========================================================
   DYNAMIC KPI COMPUTATION
   ========================================================= */
function computeKPIs(){
  let avgProgress = 0;
  let totalAllocated = 0, totalSpent = 0;
  
  const tracked = PROJECTS.filter(p => p.output && p.output.achv !== undefined);
  if(tracked.length > 0){
    let sumProg = 0;
    tracked.forEach(p => { sumProg += p.output.achv; });
    avgProgress = Math.round(sumProg / tracked.length);
  }
  
  PROJECTS.forEach(p => {
    if(p.budget) {
      totalAllocated += p.budget.allocated || 0;
      totalSpent += p.budget.spent || 0;
    }
  });
  let burnRate = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  const withMilestone = PROJECTS.filter(p => p.milestone && p.milestone.status);
  const onTime = withMilestone.filter(p => p.milestone.status === "On Track" || p.milestone.status === "Complete");
  const milestoneRate = withMilestone.length > 0 ? Math.round((onTime.length / withMilestone.length) * 100) : 0;

  let totalVar = 0;
  let slaCount = 0;
  PROJECTS.forEach(p => {
    if(p.sla && p.contractValue && (!p.milestone || p.milestone.stage !== "Closure")) {
      totalVar += (p.sla.penalty / 100) * p.contractValue;
      slaCount++;
    }
  });

  let totalCritical = 0, totalHigh = 0;
  PROJECTS.forEach(p => {
    if(p.risk && (!p.milestone || p.milestone.stage !== "Closure")){
      totalCritical += p.risk.critical || 0;
      totalHigh += p.risk.high || 0;
    }
  });

  return {
    progress: avgProgress, burn: burnRate,
    milestone: { rate: milestoneRate, total: withMilestone.length, onTime: onTime.length },
    valAtRisk: totalVar, slaCount: slaCount,
    risk: { critical: totalCritical, high: totalHigh }
  };
}

function computeMilestoneTrend(){
  const withMilestone = PROJECTS.filter(p => p.milestone && p.milestone.status);
  if(withMilestone.length === 0) return { labels: ["Q1","Q2","Q3"], data: [0,0,0] };
  const early = withMilestone.filter(p => !p.output || p.output.achv < 33);
  const mid = withMilestone.filter(p => p.output && p.output.achv >= 33 && p.output.achv < 66);
  const late = withMilestone.filter(p => p.output && p.output.achv >= 66);
  
  const rate = arr => arr.length === 0 ? 0 : Math.round((arr.filter(p => p.milestone.status === "On Track" || p.milestone.status === "Complete").length / arr.length) * 100);
  
  return { labels: ["Early Stage","Mid Stage","Late Stage"], data: [rate(early), rate(mid), rate(late)] };
}

function renderKPIs(){
  const kpi = computeKPIs();
  
  const progEl = document.getElementById("kpi-progress");
  const progFoot = document.getElementById("kpi-progress-foot");
  progEl.innerHTML = `<span style="font-size:22px">${kpi.progress}%</span> <span style="font-size:16px;color:var(--text-dim)">/</span> <span style="font-size:22px">${kpi.burn}%</span>`;
  progEl.className = "kpi-value " + (kpi.burn > kpi.progress + 10 ? "red" : kpi.burn > kpi.progress ? "amber" : "green");
  progFoot.textContent = `Avg Progress / Avg Budget Burn`;

  const mileEl = document.getElementById("kpi-milestone");
  const mileFoot = document.getElementById("kpi-milestone-foot");
  if(kpi.milestone.total === 0){
    mileEl.textContent = "—"; mileEl.className = "kpi-value"; mileFoot.textContent = "No milestone data";
  } else {
    mileEl.textContent = kpi.milestone.rate + "%";
    mileEl.className = "kpi-value " + (kpi.milestone.rate >= 80 ? "green" : kpi.milestone.rate >= 60 ? "amber" : "red");
    mileFoot.textContent = `${kpi.milestone.onTime} of ${kpi.milestone.total} projects on track`;
  }

  const slaEl = document.getElementById("kpi-sla");
  const slaFoot = document.getElementById("kpi-sla-foot");
  if(kpi.slaCount === 0){
    slaEl.textContent = "—"; slaEl.className = "kpi-value"; slaFoot.textContent = "No SLA financial tracking";
  } else {
    let varStr = "";
    if(kpi.valAtRisk >= 1000000) varStr = "$" + (kpi.valAtRisk/1000000).toFixed(2) + "M";
    else if (kpi.valAtRisk >= 1000) varStr = "$" + (kpi.valAtRisk/1000).toFixed(0) + "k";
    else varStr = "$" + kpi.valAtRisk;

    slaEl.textContent = varStr;
    slaEl.className = "kpi-value " + (kpi.valAtRisk > 500000 ? "red" : kpi.valAtRisk > 100000 ? "amber" : "green");
    slaFoot.textContent = `Monetary exposure across ${kpi.slaCount} projects`;
  }

  const riskEl = document.getElementById("kpi-risk");
  const riskFoot = document.getElementById("kpi-risk-foot");
  if(kpi.risk.critical === 0){
    riskEl.textContent = "0"; riskEl.className = "kpi-value green"; riskFoot.textContent = "No critical risk flags open";
  } else {
    riskEl.textContent = `${kpi.risk.critical}`;
    riskEl.className = "kpi-value red";
    riskFoot.textContent = `Requires immediate Executive intervention`;
  }
}

/* =========================================================
   PROJECT EDIT / DELETE / ADVANCE
   ========================================================= */
let editingProjectName = null;

function openEditModal(projectName){
  const p = PROJECTS.find(pr => pr.name === projectName);
  if(!p) return;
  editingProjectName = projectName;

  document.getElementById("f-name").value = p.name;
  document.getElementById("f-name").disabled = true;
  document.getElementById("f-strategic").value = p.strategicPillar || "Revenue Growth";
  document.getElementById("f-trend").value = p.trend || "flat";
  document.getElementById("f-contractvalue").value = p.contractValue ?? "";
  document.getElementById("f-budget-alloc").value = p.budget?.allocated ?? "";
  document.getElementById("f-budget-spent").value = p.budget?.spent ?? "";
  document.getElementById("f-metric").value = p.output?.metric || "Units";
  document.getElementById("f-target").value = p.output?.target ?? "";
  document.getElementById("f-installed").value = p.output?.installed ?? "";
  document.getElementById("f-reqrate").value = p.output?.reqRate ?? "";
  document.getElementById("f-currate").value = p.output?.curRate ?? "";
  document.getElementById("f-stage").value = p.milestone?.stage || "";
  document.getElementById("f-mstatus").value = p.milestone?.status || "";
  document.getElementById("f-pred-milestone").value = p.predictive?.milestone || "";
  document.getElementById("f-pred-deadline").value = p.predictive?.deadline || "";
  document.getElementById("f-penalty").value = p.sla?.penalty ?? "";
  document.getElementById("f-slastatus").value = p.sla?.status || "";
  document.getElementById("f-critical").value = p.risk?.critical ?? 0;
  document.getElementById("f-high").value = p.risk?.high ?? 0;
  document.getElementById("f-medium").value = p.risk?.medium ?? 0;
  document.getElementById("f-low").value = p.risk?.low ?? 0;

  formError.textContent = "";
  ["f-name","f-target","f-installed","f-penalty","f-reqrate","f-currate","f-contractvalue","f-budget-alloc","f-budget-spent","f-pred-milestone","f-pred-deadline"].forEach(clearFieldError);
  switchModalTab("manual");

  document.querySelector(".modal-head h2").textContent = "Edit Project";
  document.getElementById("modal-submit").textContent = "Save changes";
  modalOverlay.classList.add("open");
}

function deleteProject(projectName){
  if(!confirm(`Delete "${projectName}" from the portfolio? This cannot be undone.`)) return;
  const idx = PROJECTS.findIndex(p => p.name === projectName);
  if(idx > -1){
    PROJECTS.splice(idx, 1);
    renderAll();
    closeDrawer();
    showToast(`${projectName} deleted from portfolio`);
  }
}

function advanceProjectPhase(projectName){
  const p = PROJECTS.find(pr => pr.name === projectName);
  if(!p) return;

  const currentStage = p.milestone?.stage || "";
  const stageIdx = MILESTONE_STAGES.indexOf(currentStage);

  if(stageIdx === -1){
    p.milestone = { stage: MILESTONE_STAGES[0], status: "On Track" };
    recomputeOverall(); renderAll();
    showToast(`${projectName} started at ${MILESTONE_STAGES[0]}`);
    if (document.getElementById("drawer").classList.contains("open")) { openDrawer(projectName, "milestone"); }
    return;
  }
  if(stageIdx >= MILESTONE_STAGES.length - 1){
    showToast(`${projectName} is already at the final stage (${currentStage})`);
    return;
  }
  const nextStage = MILESTONE_STAGES[stageIdx + 1];
  p.milestone.stage = nextStage;
  p.milestone.status = "On Track";
  recomputeOverall();
  renderAll();
  showToast(`${projectName} advanced to ${nextStage}`);

  if (document.getElementById("drawer").classList.contains("open")) {
    openDrawer(projectName, "milestone");
  }
}

/* =========================================================
   RENDER
   ========================================================= */
function getTrendIcon(trend){
  if(trend === "up") return `<span class="trend-arrow up" title="Improving">↑</span>`;
  if(trend === "down") return `<span class="trend-arrow down" title="Deteriorating">↓</span>`;
  return `<span class="trend-arrow flat" title="Stable">→</span>`;
}

function renderPortfolioList(){
  const wrap = document.getElementById("portfolio-project-list");
  wrap.innerHTML = PROJECTS.map(p => {
    const currentStage = p.milestone?.stage || "";
    const stageIdx = MILESTONE_STAGES.indexOf(currentStage);
    const canAdvance = currentStage && stageIdx >= 0 && stageIdx < MILESTONE_STAGES.length - 1;
    return `
    <div class="project-row" data-project="${p.name}">
      <span class="rag-dot ${p.overall}"></span>
      <span class="proj-name">
        ${p.name} ${getTrendIcon(p.trend)}
        <small>${p.milestone ? p.milestone.stage : "Not yet tracked"}</small>
      </span>
      <span class="metric">${p.output ? p.output.achv + "%" : "—"}</span>
      <span><span class="status-pill ${statusClass(p.milestone?.status)}">${p.milestone ? p.milestone.status : "Pending"}</span></span>
      <span class="metric">${p.sla ? p.sla.penalty + "%" : "—"}</span>
      <span style="display:flex;gap:6px;align-items:center;">
        ${canAdvance ? `<button class="btn advance-btn" data-project="${p.name}" title="Move to ${MILESTONE_STAGES[stageIdx+1]}">Next ▸</button>` : ""}
        <span class="status-pill ${p.overall}">${p.overall==="red"?"Critical":p.overall==="amber"?"At Risk":"On Track"}</span>
      </span>
    </div>
  `}).join("");

  document.querySelectorAll(".project-row[data-project]").forEach(row=>{
    row.addEventListener("click", (e)=>{
      if(e.target.closest('.advance-btn')) return;
      openDrawer(row.dataset.project);
    });
  });

  document.querySelectorAll(".advance-btn").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      e.stopPropagation();
      advanceProjectPhase(btn.dataset.project);
    });
  });
}

function renderTopRisk(){
  const ranked = [...PROJECTS].filter(p => p.overall !== "green" && p.milestone?.stage !== "Closure").sort((a,b)=>{
    const score = proj => {
      const financialImpact = proj.contractValue ? (proj.contractValue/1000000) : 0;
      return ((proj.risk?.critical||0)*3 + (proj.risk?.high||0)*2 + (proj.sla?proj.sla.penalty:10)*0.3 + financialImpact + (proj.overall==="red"?5:proj.overall==="amber"?2:0));
    };
    return score(b)-score(a);
  }).slice(0,3);

  const wrap = document.getElementById("top-risk-list");
  if(ranked.length === 0){
    wrap.innerHTML = `<div class="pending-note" style="margin-top:8px;">No at-risk projects currently — portfolio is green.</div>`;
    return;
  }
  wrap.innerHTML = ranked.map((p,i)=>`
    <div class="project-row" data-project="${p.name}" style="grid-template-columns:26px 1fr 90px;">
      <span class="rag-dot ${p.overall}"></span>
      <span class="proj-name">${i+1}. ${p.name} ${getTrendIcon(p.trend)}<small>${p.risk?.critical||0} critical · ${p.risk?.high||0} high flags open</small></span>
      <span><span class="status-pill ${p.overall}">${p.overall==="red"?"Critical":"At Risk"}</span></span>
    </div>
  `).join("");
  wrap.querySelectorAll(".project-row").forEach(row=>{
    row.addEventListener("click", ()=> openDrawer(row.dataset.project));
  });
}

function renderOutputTable(){
  const body = document.getElementById("output-table-body");
  body.innerHTML = PROJECTS.map(p=>{
    if(!p.output || p.output.target === null || p.output.target === undefined){
      return `<tr><td>${p.name}</td><td>${p.strategicPillar||"—"}</td><td class="mono" colspan="6" style="color:var(--text-dim)">Data pending</td><td><span class="status-pill muted">Pending</span></td></tr>`;
    }
    const o = p.output;
    let displayStatus = o.status;
    if (p.milestone && p.milestone.stage === "Closure") { displayStatus = "Complete"; }

    return `<tr>
      <td>${p.name}</td>
      <td><span class="status-pill tag">${p.strategicPillar||"—"}</span></td>
      <td>${o.metric || "Units"}</td>
      <td class="mono">${fmt(o.target)}</td>
      <td class="mono">${fmt(o.installed)}</td>
      <td class="mono">${o.achv}%</td>
      <td class="mono">${fmt(o.reqRate)}/d</td>
      <td class="mono">${fmt(o.curRate)}/d</td>
      <td><span class="status-pill ${statusClass(displayStatus)}">${displayStatus}</span></td>
    </tr>`;
  }).join("");
}

function renderPipeline(){
  const wrap = document.getElementById("pipeline");
  const withMilestone = PROJECTS.filter(p => p.milestone && p.milestone.stage);
  if(withMilestone.length === 0){
    wrap.innerHTML = `<div class="pending-note">No projects with milestone data yet. Add a project to see the pipeline.</div>`;
    return;
  }
  const target = PROJECTS.find(p => p.milestone && p.milestone.stage !== "Closure" && p.overall === "red")
    || PROJECTS.find(p => p.milestone && p.milestone.stage !== "Closure" && p.overall === "amber")
    || PROJECTS.find(p => p.milestone && p.milestone.stage !== "Closure")
    || PROJECTS.find(p => p.milestone);
  const currentIdx = target && target.milestone ? MILESTONE_STAGES.indexOf(target.milestone.stage) : 3;
  wrap.innerHTML = MILESTONE_STAGES.map((s,i)=>{
    let cls = i < currentIdx ? "done" : i===currentIdx ? "current" : "";
    return `<div class="pipeline-stage ${cls}"><div class="stage-line"></div><div class="stage-dot"></div><div class="stage-label">${s}</div></div>`;
  }).join("");

  const titleEl = document.getElementById("pipeline-title");
  const descEl = document.getElementById("pipeline-desc");
  if(titleEl && descEl && target){
    titleEl.textContent = `Milestone Framework — ${target.name}`;
    descEl.textContent = `Current stage: ${target.milestone.stage} · Status: ${target.milestone.status} · ${target.overall === "red" ? "Critical" : target.overall === "amber" ? "At Risk" : "On Track"}`;
  }
}

function renderInsightPipeline(){
  const wrap = document.getElementById("insight-pipeline");
  const hasPredictive = PROJECTS.some(p => p.predictive);
  const hasRisk = PROJECTS.some(p => p.risk && (p.risk.critical > 0 || p.risk.high > 0));
  const hasOutput = PROJECTS.some(p => p.output);
  wrap.innerHTML = INSIGHT_STAGES.map((s,i)=>{
    let cls = "";
    if(i === 0) cls = "done"; 
    else if(i === 1) cls = hasOutput || hasRisk ? "done" : "";
    else if(i === 2) cls = hasRisk ? "done" : hasOutput ? "current" : "";
    else if(i === 3) cls = hasPredictive ? "done" : hasRisk ? "current" : "";
    else if(i === 4) cls = hasPredictive ? "current" : "";
    return `<div class="pipeline-stage ${cls}"><div class="stage-line"></div><div class="stage-dot"></div><div class="stage-label">${s}</div></div>`;
  }).join("");
}

function renderSlaStatusList(){
  const wrap = document.getElementById("sla-status-list");
  wrap.innerHTML = PROJECTS.map(p=>{
    if(!p.sla){ return `<div class="mini-stat"><span>${p.name}</span><span><span class="status-pill muted">Pending</span></span></div>`; }
    return `<div class="mini-stat"><span>${p.name}</span><span><span class="status-pill ${statusClass(p.sla.status)}">${p.sla.status}</span>&nbsp; ${p.sla.penalty}%</span></div>`;
  }).join("") + `<div class="pending-note" style="margin-top:12px;">Total penalties across all categories capped at 20% of contract value.</div>`;
}

function renderSlaParams(){
  const body = document.getElementById("sla-param-body");
  body.innerHTML = SLA_PARAMS.map(r=>`<tr><td>${r[0]}</td><td class="mono">${r[1]}</td><td class="mono">${r[2]}</td></tr>`).join("");
}

function heatColor(v, max){
  if(v===0) return "rgba(139,150,168,0.06)";
  const t = Math.min(v/max, 1);
  const r1=[242,169,59], r2=[229,72,77];
  const r = Math.round(r1[0]+(r2[0]-r1[0])*t);
  const g = Math.round(r1[1]+(r2[1]-r1[1])*t);
  const b = Math.round(r1[2]+(r2[2]-r1[2])*t);
  return `rgba(${r},${g},${b},${0.15+0.55*t})`;
}

function renderHeatmap(){
  const wrap = document.getElementById("heatmap");
  const sevs = ["critical","high","medium","low"];
  let html = `<div class="heat-cell hdr"></div>` + sevs.map(s=>`<div class="heat-cell hdr">${s}</div>`).join("");
  PROJECTS.forEach(p=>{
    html += `<div class="heat-cell rowlabel" data-project="${p.name}">${p.name}</div>`;
    sevs.forEach(s=>{
      const v = p.risk ? p.risk[s] : 0;
      html += `<div class="heat-cell" data-project="${p.name}" style="background:${heatColor(v,3)};color:${v>0?'#fff':'var(--text-dim)'}">${v}</div>`;
    });
  });
  wrap.innerHTML = html;
  wrap.querySelectorAll("[data-project]").forEach(cell=>{ cell.addEventListener("click", ()=> openDrawer(cell.dataset.project, "risk")); });
}

function renderPredictive(){
  const body = document.getElementById("predictive-body");
  body.innerHTML = PROJECTS.map(p=>{
    if(!p.predictive) return `<tr><td>${p.name}</td><td colspan="4" style="color:var(--text-dim)">Not yet in predictive scope</td></tr>`;
    const pr = p.predictive;
    return `<tr>
      <td>${p.name}</td><td>${pr.milestone}</td><td class="mono">${pr.deadline}</td>
      <td class="mono">${pr.forecast || '<span style="color:var(--text-dim)">Awaiting progress data</span>'}</td>
      <td><span class="status-pill ${statusClass(pr.risk)}">${pr.risk || "Pending"}</span></td>
    </tr>`;
  }).join("");
}

/* =========================================================
   CHARTS
   ========================================================= */
Chart.defaults.font.family = "'IBM Plex Mono', monospace";
Chart.defaults.color = "#8B96A8";
Chart.defaults.font.size = 11;

let chartAchv, chartTrend, chartPenalty;

function buildCharts(){
  const withOutput = PROJECTS.filter(p=>p.output);
  const withSla = PROJECTS.filter(p=>p.sla);

  if(chartAchv) chartAchv.destroy();
  if(chartTrend) chartTrend.destroy();
  if(chartPenalty) chartPenalty.destroy();

  chartAchv = new Chart(document.getElementById("chart-achv"), {
    type:"bar",
    data:{
      labels:withOutput.map(p=>p.name),
      datasets:[{
        label:"Achievement %",
        data:withOutput.map(p=>p.output.achv),
        backgroundColor:withOutput.map(p=>p.overall==="red"?"#E5484D":p.overall==="amber"?"#F2A93B":"#34C77B"),
        borderRadius:4,
        maxBarThickness:56
      }]
    },
    options:{ plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true, max:100, grid:{color:"rgba(255,255,255,0.05)"}, ticks:{callback:v=>v+"%"}}, x:{grid:{display:false}} } }
  });

  const milestoneStats = computeMilestoneTrend();
  chartTrend = new Chart(document.getElementById("chart-trend"), {
    type:"line",
    data:{
      labels:milestoneStats.labels,
      datasets:[{
        label:"On-Time Achievement %",
        data:milestoneStats.data,
        borderColor:"#34D8C6",
        backgroundColor:"rgba(52,216,198,0.12)",
        fill:true,
        tension:0.35,
        pointBackgroundColor:"#34D8C6",
        pointRadius:4
      }]
    },
    options:{ plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true, max:100, grid:{color:"rgba(255,255,255,0.05)"}, ticks:{callback:v=>v+"%"}}, x:{grid:{display:false}} } }
  });

  chartPenalty = new Chart(document.getElementById("chart-penalty"), {
    type:"bar",
    data:{
      labels:withSla.map(p=>p.name),
      datasets:[{
        label:"SLA Penalty %",
        data:withSla.map(p=>p.sla.penalty),
        backgroundColor:withSla.map(p=>statusClass(p.sla.status)==="red"?"#E5484D":statusClass(p.sla.status)==="amber"?"#F2A93B":"#34C77B"),
        borderRadius:4,
        maxBarThickness:56
      }]
    },
    options:{ plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true, max:20, grid:{color:"rgba(255,255,255,0.05)"}, ticks:{callback:v=>v+"%"}}, x:{grid:{display:false}} } }
  });
}

/* =========================================================
   DRAWER (drill-down)
   ========================================================= */
function openDrawer(projectName, defaultTab){
  const p = PROJECTS.find(pr=>pr.name===projectName);
  if(!p) return;
  document.getElementById("drawer-title").textContent = p.name;
  document.getElementById("drawer-sub").textContent = "PROJECT VIEW · PORTFOLIO > " + p.name.toUpperCase();

  const currentStage = p.milestone?.stage || "Not started";
  const currentIdx = MILESTONE_STAGES.indexOf(currentStage);
  const pipeHtml = MILESTONE_STAGES.map((s,i)=>{
    let cls = i < currentIdx ? "done" : i===currentIdx ? "current" : "";
    return `<div class="pipeline-stage ${cls}"><div class="stage-line"></div><div class="stage-dot"></div><div class="stage-label">${s}</div></div>`;
  }).join("");

  let budgetHtml = p.budget && p.budget.allocated ? `
    <div class="mini-stat" style="margin-top:12px;border-top:2px solid var(--border);padding-top:12px;"><span>Contract Value</span><span>${fmtMoney(p.contractValue)}</span></div>
    <div class="mini-stat"><span>Budget Allocated</span><span>${fmtMoney(p.budget.allocated)}</span></div>
    <div class="mini-stat"><span>Budget Spent</span><span>${fmtMoney(p.budget.spent)} (${Math.round((p.budget.spent/p.budget.allocated)*100)}%)</span></div>
  ` : '';

  document.getElementById("panel-output").innerHTML = `
    <div class="mini-stat"><span>Strategic Alignment</span><span><span class="status-pill tag">${p.strategicPillar || "—"}</span></span></div>
    <div class="mini-stat"><span>Trajectory</span><span>${p.trend === "up" ? "Improving ↑" : p.trend === "down" ? "Deteriorating ↓" : "Stable →"}</span></div>
    ${p.output ? `
    <div class="mini-stat" style="margin-top:12px;border-top:2px solid var(--border);padding-top:12px;"><span>Metric</span><span>${p.output.metric || "Units"}</span></div>
    <div class="mini-stat"><span>Planned</span><span>${fmt(p.output.target)}</span></div>
    <div class="mini-stat"><span>Completed</span><span>${fmt(p.output.installed)}</span></div>
    <div class="mini-stat"><span>Progress</span><span>${p.output.achv}%</span></div>
    <div class="mini-stat"><span>Required pace</span><span>${fmt(p.output.reqRate)}/day</span></div>
    <div class="mini-stat"><span>Current pace</span><span>${fmt(p.output.curRate)}/day</span></div>
    <div class="mini-stat"><span>Output Status</span><span><span class="status-pill ${statusClass(p.output.status)}">${p.output.status}</span></span></div>
    ` : `<div class="pending-note" style="margin-top:12px;">Progress data pending — not yet tracked.</div>`}
    ${budgetHtml}
  `;

  const currentStageIdx = p.milestone ? MILESTONE_STAGES.indexOf(p.milestone.stage) : -1;
  const canAdvanceDrawer = currentStageIdx >= 0 && currentStageIdx < MILESTONE_STAGES.length - 1;
  const nextStageName = canAdvanceDrawer ? MILESTONE_STAGES[currentStageIdx + 1] : "";

  document.getElementById("panel-milestone").innerHTML = p.milestone ? `
    <div style="margin-bottom:14px;">${pipeHtml}</div>
    <div class="mini-stat"><span>Current stage</span><span>${p.milestone.stage}</span></div>
    <div class="mini-stat"><span>Status</span><span><span class="status-pill ${statusClass(p.milestone.status)}">${p.milestone.status}</span></span></div>
    ${canAdvanceDrawer ? `<div style="margin:14px 0;"><button class="btn primary" id="drawer-advance-phase" style="width:100%;padding:10px 16px;font-size:13px;">Advance Phase to ${nextStageName}</button></div>` : ""}
    <div class="pending-note">Criticality overlay: a Delayed status on a critical-path milestone carries higher urgency.</div>
  ` : `
    <div class="pending-note">Milestone tracking pending for this project.</div>
    <div style="margin:14px 0;"><button class="btn primary" id="drawer-advance-phase" style="width:100%;padding:10px 16px;font-size:13px;">Start Tracking at ${MILESTONE_STAGES[0]}</button></div>
  `;

  const drawerAdvanceBtn = document.getElementById("drawer-advance-phase");
  if(drawerAdvanceBtn) drawerAdvanceBtn.addEventListener("click", ()=> advanceProjectPhase(p.name));

  let penaltyValue = (p.sla && p.contractValue) ? ` (${fmtMoney((p.sla.penalty/100) * p.contractValue)})` : "";
  document.getElementById("panel-sla").innerHTML = p.sla ? `
    <div class="mini-stat"><span>Cumulative penalty</span><span>${p.sla.penalty}% ${penaltyValue}</span></div>
    <div class="mini-stat"><span>Compliance status</span><span><span class="status-pill ${statusClass(p.sla.status)}">${p.sla.status}</span></span></div>
    <div class="mini-stat"><span>Penalty cap</span><span>20%</span></div>
  ` : `<div class="pending-note">SLA monitoring pending for this project.</div>`;

  document.getElementById("panel-risk").innerHTML = `
    <div class="mini-stat"><span>Critical flags</span><span>${p.risk.critical}</span></div>
    <div class="mini-stat"><span>High flags</span><span>${p.risk.high}</span></div>
    <div class="mini-stat"><span>Medium flags</span><span>${p.risk.medium}</span></div>
    <div class="mini-stat"><span>Low flags</span><span>${p.risk.low}</span></div>
    ${p.predictive ? `<div class="pending-note" style="margin-top:12px;">Forecast: <strong style="color:var(--text)">${p.predictive.milestone}</strong> due ${p.predictive.deadline}, forecasted ${p.predictive.forecast || "pending data"} — <span class="status-pill ${statusClass(p.predictive.risk)}" style="margin-left:2px;">${p.predictive.risk || "Pending"}</span></div>` : ""}
  `;

  document.querySelectorAll(".drawer-tab").forEach(t=>t.classList.remove("active"));
  document.querySelectorAll(".drawer-panel").forEach(t=>t.classList.remove("active"));
  const tabToShow = defaultTab || "output";
  document.querySelector(`.drawer-tab[data-tab="${tabToShow}"]`).classList.add("active");
  document.getElementById(`panel-${tabToShow}`).classList.add("active");

  document.getElementById("drawer").classList.add("open");
  document.getElementById("drawer-overlay").classList.add("open");
}

function closeDrawer(){
  document.getElementById("drawer").classList.remove("open");
  document.getElementById("drawer-overlay").classList.remove("open");
}
document.getElementById("drawer-close").addEventListener("click", closeDrawer);
document.getElementById("drawer-overlay").addEventListener("click", closeDrawer);
document.getElementById("drawer-edit").addEventListener("click", ()=>{ const name = document.getElementById("drawer-title").textContent; if(name && name !== "Project") openEditModal(name); });
document.getElementById("drawer-delete").addEventListener("click", ()=>{ const name = document.getElementById("drawer-title").textContent; if(name && name !== "Project") deleteProject(name); });
document.querySelectorAll(".drawer-tab").forEach(tab=>{
  tab.addEventListener("click", ()=>{
    document.querySelectorAll(".drawer-tab").forEach(t=>t.classList.remove("active"));
    document.querySelectorAll(".drawer-panel").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
  });
});

/* =========================================================
   SIDEBAR TOGGLE & NAVIGATION
   ========================================================= */
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebarEl = document.getElementById("sidebar");
let sidebarCollapsed = false;

sidebarToggle.addEventListener("click", ()=>{
  sidebarCollapsed = !sidebarCollapsed;
  sidebarEl.classList.toggle("collapsed", sidebarCollapsed);
  sidebarToggle.classList.toggle("collapsed", sidebarCollapsed);
  setTimeout(()=>{ if(chartAchv) chartAchv.resize(); if(chartTrend) chartTrend.resize(); if(chartPenalty) chartPenalty.resize(); }, 260);
});

const VIEW_LABELS = { portfolio:"Portfolio Overview", milestones:"Progress & Milestones", sla:"SLA Compliance", risk:"Risk & Early Warning", predictive:"Predictive Insights" };
document.querySelectorAll(".nav-item").forEach(item=>{
  item.addEventListener("click", ()=>{
    document.querySelectorAll(".nav-item").forEach(i=>i.classList.remove("active"));
    item.classList.add("active");
    document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
    document.getElementById("view-"+item.dataset.view).classList.add("active");
    const bc = document.getElementById("breadcrumb");
    bc.innerHTML = `<span class="crumb" onclick="document.querySelector('.nav-item[data-view=\\'portfolio\\']').click()">Portfolio</span> › <span class="crumb current">${VIEW_LABELS[item.dataset.view]}</span>`;
  });
});

/* =========================================================
   CLOCK
   ========================================================= */
function tickClock(){
  const now = new Date();
  document.getElementById("clock").textContent = "LAST SYNCED " + now.toLocaleDateString("en-US",{day:"2-digit",month:"short",year:"numeric"}) + " " + now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
}
setInterval(tickClock, 1000); tickClock();

/* =========================================================
   ADD PROJECT (Manual)
   ========================================================= */
const fabAdd = document.getElementById("fab-add");
const modalOverlay = document.getElementById("modal-overlay");
const addForm = document.getElementById("add-project-form");
const formError = document.getElementById("form-error");

function openModal(){
  addForm.reset();
  formError.textContent = "";
  ["f-name","f-target","f-installed","f-penalty","f-reqrate","f-currate","f-contractvalue","f-budget-alloc","f-budget-spent","f-pred-milestone","f-pred-deadline"].forEach(id => { const el = document.getElementById(id); if(el) el.style.borderColor = "var(--border)"; });
  editingProjectName = null;
  document.getElementById("f-name").disabled = false;
  document.querySelector(".modal-head h2").textContent = "Add Project";
  document.getElementById("modal-submit").textContent = "Add project";
  document.getElementById("f-stage").value = "Execution";
  document.getElementById("f-metric").value = "Units";
  document.getElementById("metric-custom-row").style.display = "none";
  resetImportPanel();
  switchModalTab("manual");
  modalOverlay.classList.add("open");
  setTimeout(()=> document.getElementById("f-name").focus(), 50);
}
function closeModal(){ modalOverlay.classList.remove("open"); }
function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  setTimeout(()=> t.classList.remove("show"), 2600);
}
function clearFieldError(id){ const el = document.getElementById(id); if(el) el.style.borderColor = "var(--border)"; }
function setFieldError(id){ const el = document.getElementById(id); if(el) el.style.borderColor = "var(--red)"; }

fabAdd.addEventListener("click", openModal);
document.getElementById("modal-submit").addEventListener("click", ()=>{ if(addForm.requestSubmit){ addForm.requestSubmit(); } else { addForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); } });
document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal-cancel").addEventListener("click", closeModal);
document.getElementById("modal-cancel-2").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e)=>{ if(e.target === modalOverlay) closeModal(); });

function switchModalTab(tab){
  document.querySelectorAll(".modal-tab").forEach(t=>t.classList.toggle("active", t.dataset.modalTab === tab));
  document.querySelectorAll(".modal-panel").forEach(p=>p.classList.remove("active"));
  document.getElementById(`modal-panel-${tab}`).classList.add("active");
  document.querySelectorAll(".modal-foot-actions").forEach(f=>{ f.style.display = f.dataset.foot === tab ? "flex" : "none"; });
}
document.querySelectorAll(".modal-tab").forEach(tab=>{ tab.addEventListener("click", ()=> switchModalTab(tab.dataset.modalTab)); });
document.getElementById("f-metric").addEventListener("change", (e)=>{ document.getElementById("metric-custom-row").style.display = e.target.value === "__custom" ? "grid" : "none"; });

function deriveStatusFromAchv(achv){ return achv >= 95 ? "On Track" : achv >= 85 ? "At Risk" : "Delayed"; }

addForm.addEventListener("submit", (e)=>{
  e.preventDefault(); e.stopPropagation(); formError.textContent = "";
  ["f-name","f-target","f-installed","f-penalty","f-reqrate","f-currate","f-contractvalue","f-budget-alloc","f-budget-spent","f-pred-milestone","f-pred-deadline"].forEach(clearFieldError);

  const val = id => document.getElementById(id).value.trim();
  const num = id => { const v = val(id); return v === "" ? null : Number(v); };

  const name = val("f-name");
  if(!name){ formError.textContent = "Enter a project name."; setFieldError("f-name"); return; }
  
  const strategicPillar = val("f-strategic");
  const trend = val("f-trend");
  const contractValue = num("f-contractvalue");
  const budgetAlloc = num("f-budget-alloc");
  const budgetSpent = num("f-budget-spent");

  const target = num("f-target"); const installed = num("f-installed"); const penalty = num("f-penalty");
  const reqRate = num("f-reqrate"); const curRate = num("f-currate");

  if(target !== null && target <= 0){ formError.textContent = "Planned units must be > 0."; setFieldError("f-target"); return; }
  if(target !== null && installed !== null && installed > target){ formError.textContent = "Completed amount cannot exceed planned amount."; setFieldError("f-installed"); return; }
  if(penalty !== null && penalty > 20){ formError.textContent = "SLA penalty cannot exceed 20% cap."; setFieldError("f-penalty"); return; }

  let output = null;
  if(target !== null && installed !== null){
    const achv = Math.round((installed / target) * 100);
    const m = val("f-metric");
    output = { target, installed, achv, reqRate: reqRate??0, curRate: curRate??0, metric: m==="__custom"?val("f-metric-custom"):m, status: deriveStatusFromAchv(achv) };
  }
  
  const milestone = val("f-stage") && val("f-mstatus") ? { stage: val("f-stage"), status: val("f-mstatus") } : null;
  const sla = penalty !== null && val("f-slastatus") ? { penalty, status: val("f-slastatus") } : null;
  const risk = { critical: num("f-critical")??0, high: num("f-high")??0, medium: num("f-medium")??0, low: num("f-low")??0 };
  
  const predMilestone = val("f-pred-milestone");
  const predDeadline = val("f-pred-deadline");
  const predictive = predMilestone ? { milestone: predMilestone, deadline: predDeadline, forecast: "", risk: "" } : null;

  const project = { 
    name, strategicPillar, trend, contractValue,
    budget: budgetAlloc !== null ? { allocated: budgetAlloc, spent: budgetSpent??0 } : null,
    output, milestone, sla, risk, predictive, overall: "amber" 
  };

  if(editingProjectName){
    const idx = PROJECTS.findIndex(p => p.name === editingProjectName);
    if(idx > -1){
      PROJECTS[idx] = project; renderAll(); closeModal(); showToast(`${name} updated`);
      if(document.getElementById("drawer").classList.contains("open")) openDrawer(name);
    }
  } else {
    if(PROJECTS.some(p => p.name.toLowerCase() === name.toLowerCase())){ formError.textContent = "A project with this name already exists."; setFieldError("f-name"); return; }
    PROJECTS.push(project); renderAll(); closeModal(); showToast(`${name} added to the portfolio`);
  }
});

/* =========================================================
   EXCEL IMPORT LOGIC
   ========================================================= */
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("f-excel");
const importStatus = document.getElementById("import-status");
const importPreview = document.getElementById("import-preview");
const importConfirmBtn = document.getElementById("import-confirm");
let pendingImportRows = null;

dropzone.addEventListener("click", ()=> fileInput.click());
dropzone.addEventListener("dragover", (e)=>{ e.preventDefault(); dropzone.classList.add("dragover"); });
dropzone.addEventListener("dragleave", ()=> dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", (e)=>{
  e.preventDefault();
  dropzone.classList.remove("dragover");
  if(e.dataTransfer.files.length) handleExcelFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener("change", (e)=>{
  if(e.target.files.length) handleExcelFile(e.target.files[0]);
});

function resetImportPanel(){
  pendingImportRows = null;
  importStatus.textContent = "";
  importStatus.className = "import-status";
  importPreview.style.display = "none";
  importPreview.innerHTML = "";
  importConfirmBtn.disabled = true;
  importConfirmBtn.textContent = "Import project";
  fileInput.value = "";
}

function normKey(k){ return String(k).toLowerCase().replace(/[^a-z0-9]/g, ""); }

const FIELD_MAP = {
  name: ["project","projectname","name"],
  strategicPillar: ["strategicpillar", "pillar", "strategy", "alignment"],
  trend: ["currenttrajectory", "trajectory", "trend"],
  contractValue: ["contractvalue", "totalcontractvalue", "businessvalue"],
  budgetAlloc: ["budgetallocated", "budget", "allocatedbudget"],
  budgetSpent: ["budgetspent", "spent"],
  target: ["target","plannedunits","planned"],
  installed: ["installed","completed","actual"],
  reqRate: ["requiredrate","reqrate","requiredpace","reqpace"],
  curRate: ["currentrate","currate","currentpace","curpace"],
  metric: ["metric","progressmetric","unit"],
  stage: ["milestonestage","currentstage"],
  mStatus: ["milestonestatus"],
  penalty: ["slapenalty","penalty","cumulativepenalty"],
  slaStatus: ["slastatus","compliancestatus"],
  critical: ["critical","criticalflags"],
  high: ["high","highflags"],
  medium: ["medium","mediumflags"],
  low: ["low","lowflags"],
  predMilestone: ["predictivemilestone","forecastmilestone","targetmilestonename"],
  predDeadline: ["predictivedeadline","deadline","targetdeadline"]
};

function extractFieldsFromWorkbook(wb){
  const fields = {};
  wb.SheetNames.forEach(sheetName=>{
    const sheet = wb.Sheets[sheetName];
    const aoa = XLSX.utils.sheet_to_json(sheet, {header:1, defval:""});
    for(let i=1; i<aoa.length; i++){ 
      const row = aoa[i];
      const rawField = row[0];
      const rawValue = row[1];
      if(rawField === undefined || rawField === "") continue;
      const key = normKey(rawField);
      if(!(key in fields) && rawValue !== undefined && rawValue !== ""){
        fields[key] = rawValue;
      }
    }
  });
  return fields;
}

function fieldVal(fields, field){ for(const cand of FIELD_MAP[field]){ if(cand in fields) return fields[cand]; } return null; }
function fieldNum(fields, field){ const v = fieldVal(fields, field); if(v === null) return null; const n = Number(v); return isNaN(n) ? null : n; }
function fieldStr(fields, field){ const v = fieldVal(fields, field); return v === null ? "" : String(v).trim(); }

function renderImportPreview(p){
  importPreview.innerHTML = `
    <div class="import-preview-head">
      <span class="ip-name">${p.name}</span>
      <span class="status-pill ${p.overall}">${p.overall==="red"?"Critical":p.overall==="amber"?"At Risk":"On Track"}</span>
    </div>
    
    <div class="import-preview-section">Overview & Financials</div>
    <div class="mini-stat"><span>Strategic Pillar</span><span>${p.strategicPillar}</span></div>
    <div class="mini-stat"><span>Trajectory</span><span>${p.trend}</span></div>
    ${p.contractValue ? `<div class="mini-stat"><span>Contract Value</span><span>${fmtMoney(p.contractValue)}</span></div>` : ''}
    ${p.budget ? `<div class="mini-stat"><span>Budget</span><span>Spent ${fmtMoney(p.budget.spent)} of ${fmtMoney(p.budget.allocated)}</span></div>` : ''}

    <div class="import-preview-section">Progress</div>
    ${p.output ? `
      <div class="mini-stat"><span>${p.output.metric}</span><span>${fmt(p.output.installed)} / ${fmt(p.output.target)} (${p.output.achv}%)</span></div>
      <div class="mini-stat"><span>Pace (req. / cur.)</span><span>${fmt(p.output.reqRate)} / ${fmt(p.output.curRate)} per day</span></div>
      <div class="mini-stat"><span>Status</span><span><span class="status-pill ${statusClass(p.output.status)}">${p.output.status}</span></span></div>
    ` : `<div class="mini-stat"><span>Not provided</span><span>—</span></div>`}

    <div class="import-preview-section">Milestone</div>
    ${p.milestone ? `<div class="mini-stat"><span>${p.milestone.stage}</span><span><span class="status-pill ${statusClass(p.milestone.status)}">${p.milestone.status}</span></span></div>` : `<div class="mini-stat"><span>Not provided</span><span>—</span></div>`}

    <div class="import-preview-section">SLA</div>
    ${p.sla ? `<div class="mini-stat"><span>Penalty</span><span>${p.sla.penalty}% · <span class="status-pill ${statusClass(p.sla.status)}">${p.sla.status}</span></span></div>` : `<div class="mini-stat"><span>Not provided</span><span>—</span></div>`}

    <div class="import-preview-section">Risk Flags</div>
    <div class="mini-stat"><span>Critical / High / Medium / Low</span><span>${p.risk.critical} / ${p.risk.high} / ${p.risk.medium} / ${p.risk.low}</span></div>
    
    <div class="import-preview-section">Predictive Insights</div>
    ${p.predictive ? `<div class="mini-stat"><span>${p.predictive.milestone}</span><span>due ${p.predictive.deadline} · <span class="status-pill muted">Auto-calculated</span></span></div>` : `<div class="mini-stat"><span>Not provided</span><span>—</span></div>`}
  `;
}

function handleExcelFile(file){
  importStatus.className = "import-status";
  importStatus.textContent = "Reading " + file.name + " …";
  importPreview.style.display = "none";
  importConfirmBtn.disabled = true;
  pendingImportRows = null;

  const reader = new FileReader();
  reader.onload = (e)=>{
    try{
      const wb = XLSX.read(e.target.result, {type:"array"});
      const fields = extractFieldsFromWorkbook(wb);

      const name = fieldStr(fields, "name");
      if(!name){
        importStatus.className = "import-status err";
        importStatus.textContent = "Couldn't find a Project Name field in this file.";
        return;
      }
      if(PROJECTS.some(p => p.name.toLowerCase() === name.toLowerCase())){
        importStatus.className = "import-status err";
        importStatus.textContent = `A project named "${name}" already exists in the portfolio.`;
        return;
      }

      const targetImp = fieldNum(fields,"target");
      const installedImp = fieldNum(fields,"installed");
      const penaltyImp = fieldNum(fields,"penalty");
      if(targetImp !== null && installedImp !== null && installedImp > targetImp){
        importStatus.className = "import-status err";
        importStatus.textContent = "Validation error: Completed amount exceeds planned amount.";
        return;
      }
      if(penaltyImp !== null && penaltyImp > 20){
        importStatus.className = "import-status err";
        importStatus.textContent = "Validation error: SLA penalty exceeds the 20% contract cap.";
        return;
      }
      
      let output = null;
      if(targetImp !== null && installedImp !== null){
        const achv = Math.round((installedImp / targetImp) * 100);
        output = { target: targetImp, installed: installedImp, achv, reqRate: fieldNum(fields,"reqRate")??0, curRate: fieldNum(fields,"curRate")??0, metric: fieldStr(fields,"metric")||"Units", status: deriveStatusFromAchv(achv) };
      }

      const project = {
        name,
        strategicPillar: fieldStr(fields, "strategicPillar") || "Revenue Growth",
        trend: fieldStr(fields, "trend") || "flat",
        contractValue: fieldNum(fields, "contractValue"),
        budget: fieldNum(fields, "budgetAlloc") !== null ? { allocated: fieldNum(fields, "budgetAlloc"), spent: fieldNum(fields, "budgetSpent") || 0 } : null,
        output: output,
        milestone: fieldStr(fields,"stage") && fieldStr(fields,"mStatus") ? { stage: fieldStr(fields,"stage"), status: fieldStr(fields,"mStatus") } : null,
        sla: penaltyImp !== null && fieldStr(fields,"slaStatus") ? { penalty: penaltyImp, status: fieldStr(fields,"slaStatus") } : null,
        risk: { critical: fieldNum(fields,"critical")??0, high: fieldNum(fields,"high")??0, medium: fieldNum(fields,"medium")??0, low: fieldNum(fields,"low")??0 },
        predictive: fieldStr(fields,"predMilestone") ? { milestone: fieldStr(fields,"predMilestone"), deadline: fieldStr(fields,"predDeadline"), forecast: "", risk: "" } : null,
        overall: "amber"
      };
      
      project.overall = computeOverall(project);
      pendingImportRows = project;
      importStatus.textContent = `Parsed "${name}" — review below, then confirm.`;
      renderImportPreview(project);
      importPreview.style.display = "block";
      importConfirmBtn.disabled = false;

    }catch(err){
      importStatus.className = "import-status err";
      importStatus.textContent = "Couldn't read that file — make sure it's a valid .xlsx, .xls or .csv.";
    }
  };
  reader.onerror = ()=>{
    importStatus.className = "import-status err";
    importStatus.textContent = "Couldn't read that file.";
  };
  reader.readAsArrayBuffer(file);
}

importConfirmBtn.addEventListener("click", ()=>{
  if(!pendingImportRows) return;
  const p = pendingImportRows;
  PROJECTS.push(p);
  renderAll();
  closeModal();
  showToast(`${p.name} imported from file`);
});

document.getElementById("download-template").addEventListener("click", ()=>{
  const wb = XLSX.utils.book_new();
  const addSheet = (sheetName, rows)=>{
    const ws = XLSX.utils.aoa_to_sheet([["Field","Value"], ...rows]);
    ws["!cols"] = [{wch:25},{wch:25}];
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  };
  addSheet("Overview", [
    ["Project Name",""],
    ["Strategic Pillar",""],
    ["Current Trajectory",""],
    ["Contract Value", ""],
    ["Budget Allocated", ""],
    ["Budget Spent", ""]
  ]);
  addSheet("Progress", [
    ["Metric",""], ["Planned",""], ["Completed",""],
    ["Required Pace",""], ["Current Pace",""]
  ]);
  addSheet("Milestone", [["Milestone Stage",""], ["Milestone Status",""]]);
  addSheet("SLA", [["SLA Penalty",""], ["SLA Status",""]]);
  addSheet("Risk", [["Critical",""], ["High",""], ["Medium",""], ["Low",""]]);
  addSheet("Predictive", [
    ["Predictive Milestone",""], ["Predictive Deadline",""]
  ]);
  XLSX.writeFile(wb, "project_template.xlsx");
});

/* =========================================================
   INIT
   ========================================================= */
renderPipeline();
renderInsightPipeline();
renderSlaParams();
renderAll();