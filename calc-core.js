export const CORE_VERSION = "3.0.0";

export const CALCULATION_SOURCES = Object.freeze({
  tapDrill: {
    title: "Tap drill guidance",
    source: "ANSI B94.11M / ISO 2306 tables when explicitly selected; otherwise the percent-thread rule of thumb.",
    confidence: "Shop starting point",
  },
  threadGeometry: {
    title: "60 degree thread geometry",
    source: "Basic 60 degree Unified and ISO metric geometry. Class limits remain estimates unless verified against the published standard.",
    confidence: "Reference geometry",
  },
  feeds: {
    title: "Speeds and feeds",
    source: "Conservative built-in starting values or user/tool-library overrides, constrained by the active machine profile.",
    confidence: "Starting point; verify with tool-maker data",
  },
  geometry: {
    title: "Shop geometry",
    source: "Deterministic trigonometric and coordinate geometry.",
    confidence: "Calculated",
  },
  advanced: {
    title: "Advanced shop formulas",
    source: "Deterministic geometry and kinematic relationships. Process assumptions such as reamer stock, thread-mill direction, and statistical RSS suitability still require shop validation.",
    confidence: "Calculated setup aid",
  },
  gcode: {
    title: "G-code template",
    source: "Controller-aware template only. Work offset, tool length, clearances, units, spindle, and cycle behavior require operator verification.",
    confidence: "Review before machine use",
  },
});

export const MACHINE_SCREW_DIAMETERS = Object.freeze({
  0: 0.0600, 1: 0.0730, 2: 0.0860, 3: 0.0990, 4: 0.1120,
  5: 0.1250, 6: 0.1380, 8: 0.1640, 10: 0.1900, 12: 0.2160,
});

export const METRIC_DEFAULT_PITCH = Object.freeze({
  1: 0.25, 1.2: 0.25, 1.4: 0.3, 1.6: 0.35, 1.8: 0.35, 2: 0.4, 2.5: 0.45,
  3: 0.5, 3.5: 0.6, 4: 0.7, 5: 0.8, 6: 1.0, 7: 1.0, 8: 1.25, 10: 1.5,
  12: 1.75, 14: 2.0, 16: 2.0, 18: 2.5, 20: 2.5, 22: 2.5, 24: 3.0, 27: 3.0,
  30: 3.5, 33: 3.5, 36: 4.0, 39: 4.0, 42: 4.5, 45: 4.5, 48: 5.0, 52: 5.0,
  56: 5.5, 60: 5.5, 64: 6.0,
});

export function fmt(value, places = 3) {
  if (!Number.isFinite(value)) return "—";
  const digits = Math.max(0, Math.min(12, Number(places) || 0));
  const fixed = Number(value).toFixed(digits);
  return digits === 0 ? fixed : fixed.replace(/\.?0+$/, "");
}

export function parseFraction(value) {
  const text = String(value ?? "").trim();
  if (!text) return NaN;
  const match = text.match(/^([+-])?(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/);
  if (match) {
    const sign = match[1] === "-" ? -1 : 1;
    const whole = Number(match[2] || 0);
    const numerator = Number(match[3]);
    const denominator = Number(match[4]);
    if (!denominator) return NaN;
    return sign * (whole + numerator / denominator);
  }
  const numeric = Number(text);
  return Number.isFinite(numeric) ? numeric : NaN;
}

export function parseDimension(value, expectedUnit = "in") {
  let text = String(value ?? "").trim().toLowerCase();
  if (!text) return NaN;
  const suppliedMm = /\bmm\b/.test(text);
  const suppliedIn = /(?:\bin(?:ch(?:es)?)?\b|[\"″])/.test(text);
  text = text
    .replace(/(?:millimeters?|millimetres?|\bmm\b)/g, "")
    .replace(/(?:inches?|\bin\b|[\"″])/g, "")
    .trim();
  const parsed = parseFraction(text);
  if (!Number.isFinite(parsed)) return NaN;
  if (expectedUnit === "in" && suppliedMm) return parsed / 25.4;
  if (expectedUnit === "mm" && suppliedIn) return parsed * 25.4;
  return parsed;
}

export function parseThreadSpec(input) {
  let normalized = String(input ?? "").trim().toLowerCase().replace(/×/g, "x");
  const suffixMatch = normalized.match(/\s+(unc|unf|unef|un)\s*$/i);
  const suppliedSeries = suffixMatch ? suffixMatch[1].toUpperCase() : null;
  normalized = normalized.replace(/\s+(unc|unf|unef|un)\s*$/i, "").replace(/\s+/g, "");
  if (!normalized) return null;

  const machine = normalized.match(/^#?(\d{1,2})-(\d+(?:\.\d+)?)$/);
  if (machine) {
    const number = Number(machine[1]);
    const tpi = Number(machine[2]);
    const major = MACHINE_SCREW_DIAMETERS[number];
    if (major && tpi > 0) return { system: "un", major, tpi, label: `#${number}-${tpi}`, suppliedSeries };
  }

  const metric = normalized.match(/^m(\d+(?:\.\d+)?)[x-](\d+(?:\.\d+)?)$/i);
  if (metric) {
    return { system: "metric", major: Number(metric[1]), pitch: Number(metric[2]), label: `M${metric[1]}x${metric[2]}`, suppliedSeries: null };
  }

  const coarseMetric = normalized.match(/^m(\d+(?:\.\d+)?)$/i);
  if (coarseMetric) {
    const major = Number(coarseMetric[1]);
    const pitch = METRIC_DEFAULT_PITCH[major];
    if (pitch) return { system: "metric", major, pitch, label: `M${major}x${pitch}`, suppliedSeries: null };
  }

  const unified = normalized.match(/^([0-9.]+\/[0-9.]+|[0-9]+(?:\.[0-9]+)?)[-x](\d+(?:\.\d+)?)$/);
  if (unified) {
    const major = parseFraction(unified[1]);
    const tpi = Number(unified[2]);
    if (major > 0 && tpi > 0) return { system: "un", major, tpi, label: `${unified[1]}-${unified[2]}`, suppliedSeries };
  }
  return null;
}

export function tapDrillByPercent(major, pitch, percent) {
  return major - ((percent / 76.98) * pitch);
}

export function mowSolveMExternal(pitchDiameter, wire, pitch) {
  return pitchDiameter + 3 * wire - (Math.sqrt(3) / 2) * pitch;
}

export function mowSolveEExternal(measurement, wire, pitch) {
  return measurement - 3 * wire + (Math.sqrt(3) / 2) * pitch;
}

export function mowSolveMInternal(pitchDiameter, wire, pitch) {
  return pitchDiameter - 3 * wire + (Math.sqrt(3) / 2) * pitch;
}

export function mowSolveEInternal(measurement, wire, pitch) {
  return measurement + 3 * wire - (Math.sqrt(3) / 2) * pitch;
}

export function radialChipThinningFactor(diameter, radialEngagement, maxFactor = 2.5) {
  if (!(diameter > 0) || !(radialEngagement > 0) || radialEngagement >= diameter / 2) return 1;
  const denominator = 2 * Math.sqrt(radialEngagement * (diameter - radialEngagement));
  if (!(denominator > 0)) return 1;
  return Math.max(1, Math.min(diameter / denominator, maxFactor));
}

export function calculateSpeedsFeeds({
  units = "in",
  diameter,
  flutes,
  sfm,
  chipLoadIn,
  widthOfCut = NaN,
  depthOfCut = NaN,
  maxRpm = Infinity,
  maxFeed = Infinity,
}) {
  const diameterIn = units === "in" ? diameter : diameter / 25.4;
  const chipScale = Math.max(0.25, Math.min(1.5, diameterIn / 0.375));
  const thinningFactor = radialChipThinningFactor(diameter, widthOfCut);
  const programmedChipIn = chipLoadIn * chipScale * thinningFactor;
  const requestedRpm = (sfm * 12) / (Math.PI * diameterIn);
  const rpm = Math.min(requestedRpm, Number.isFinite(maxRpm) && maxRpm > 0 ? maxRpm : Infinity);
  const requestedFeedIPM = rpm * flutes * programmedChipIn;
  const requestedFeed = units === "in" ? requestedFeedIPM : requestedFeedIPM * 25.4;
  const feed = Math.min(requestedFeed, Number.isFinite(maxFeed) && maxFeed > 0 ? maxFeed : Infinity);
  const mrr = widthOfCut > 0 && depthOfCut > 0 ? widthOfCut * depthOfCut * feed : null;
  return {
    requestedRpm,
    rpm,
    requestedFeed,
    feed,
    chipScale,
    thinningFactor,
    programmedChipIn,
    mrr,
    limitedByRpm: rpm < requestedRpm,
    limitedByFeed: feed < requestedFeed,
  };
}

export function boltCircleCoordinates(diameter, holes, startDegrees = 0, direction = "ccw", centerX = 0, centerY = 0) {
  const radius = diameter / 2;
  const step = 360 / holes;
  const sign = direction === "cw" ? -1 : 1;
  return Array.from({ length: holes }, (_, index) => {
    const angleDeg = startDegrees + sign * index * step;
    const radians = angleDeg * Math.PI / 180;
    return { index: index + 1, angleDeg, x: centerX + radius * Math.cos(radians), y: centerY + radius * Math.sin(radians) };
  });
}

export function solveRightTriangle(mode, first, second) {
  let run;
  let rise;
  let hypotenuse;
  let angle;
  if (mode === "runRise") {
    run = first; rise = second; hypotenuse = Math.hypot(run, rise); angle = Math.atan2(rise, run) * 180 / Math.PI;
  } else if (mode === "hypAngle") {
    hypotenuse = first; angle = second; run = hypotenuse * Math.cos(angle * Math.PI / 180); rise = hypotenuse * Math.sin(angle * Math.PI / 180);
  } else if (mode === "runAngle") {
    run = first; angle = second; rise = run * Math.tan(angle * Math.PI / 180); hypotenuse = run / Math.cos(angle * Math.PI / 180);
  } else if (mode === "riseAngle") {
    rise = first; angle = second; run = rise / Math.tan(angle * Math.PI / 180); hypotenuse = rise / Math.sin(angle * Math.PI / 180);
  } else {
    throw new Error("Unsupported triangle mode");
  }
  return { run, rise, hypotenuse, angle, complementaryAngle: 90 - angle, slope: rise / run };
}

export function chamferDepth(smallDiameter, largeDiameter, includedAngleDegrees) {
  return (largeDiameter - smallDiameter) / (2 * Math.tan((includedAngleDegrees / 2) * Math.PI / 180));
}

export function circleThrough3Points(p1, p2, p3) {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const [x3, y3] = p3;
  const determinant = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
  if (Math.abs(determinant) < 1e-12) return null;
  const a = x1 * x1 + y1 * y1;
  const b = x2 * x2 + y2 * y2;
  const c = x3 * x3 + y3 * y3;
  const x = (a * (y2 - y3) + b * (y3 - y1) + c * (y1 - y2)) / determinant;
  const y = (a * (x3 - x2) + b * (x1 - x3) + c * (x2 - x1)) / determinant;
  const radius = Math.hypot(x1 - x, y1 - y);
  return { x, y, radius, diameter: radius * 2 };
}

export function tappingFeed({ units = "in", rpm, tpi, pitch }) {
  const lead = units === "in" ? 1 / tpi : pitch;
  return { lead, feed: rpm * lead };
}

export function threadMilling({ units = "in", majorDiameter, cutterDiameter, rpm, flutes, chipLoad }) {
  const pathDiameter = majorDiameter - cutterDiameter;
  if (!(pathDiameter > 0)) throw new Error("Cutter diameter must be smaller than the thread major diameter.");
  const surfaceFeed = rpm * flutes * chipLoad;
  const centerlineFeed = surfaceFeed * (pathDiameter / majorDiameter);
  return { pathDiameter, surfaceFeed, centerlineFeed, units };
}

export function reamerAllowance({ targetDiameter, allowancePerSide }) {
  const totalAllowance = allowancePerSide * 2;
  return { preReamDiameter: targetDiameter - totalAllowance, totalAllowance };
}

export function sineBarHeight({ barLength, angleDegrees }) {
  return barLength * Math.sin(angleDegrees * Math.PI / 180);
}

export function sineBarAngle({ barLength, stackHeight }) {
  if (!(barLength > 0) || Math.abs(stackHeight) > barLength) return NaN;
  return Math.asin(stackHeight / barLength) * 180 / Math.PI;
}

export function taperGeometry({ largeDiameter, smallDiameter, length, units = "in" }) {
  const diameterChange = largeDiameter - smallDiameter;
  const taperPerLength = diameterChange / length;
  const taperPerFoot = units === "in" ? taperPerLength * 12 : taperPerLength * 304.8;
  const halfAngle = Math.atan((diameterChange / 2) / length) * 180 / Math.PI;
  return { diameterChange, taperPerLength, taperPerFoot, includedAngle: halfAngle * 2, halfAngle };
}

export function ballNoseScallopHeight({ radius, stepover }) {
  if (!(radius > 0) || !(stepover >= 0) || stepover > radius * 2) return NaN;
  return radius - Math.sqrt(radius * radius - (stepover * stepover) / 4);
}

export function ballNoseStepover({ radius, scallopHeight }) {
  if (!(radius > 0) || !(scallopHeight >= 0) || scallopHeight > radius) return NaN;
  return 2 * Math.sqrt(Math.max(0, 2 * radius * scallopHeight - scallopHeight * scallopHeight));
}

export function toleranceStack(items) {
  const normalized = items.map((item) => ({ nominal: Number(item.nominal) || 0, tolerance: Math.abs(Number(item.tolerance) || 0) }));
  const nominal = normalized.reduce((sum, item) => sum + item.nominal, 0);
  const worstCaseTolerance = normalized.reduce((sum, item) => sum + item.tolerance, 0);
  const rssTolerance = Math.sqrt(normalized.reduce((sum, item) => sum + item.tolerance ** 2, 0));
  return {
    nominal,
    worstCaseTolerance,
    rssTolerance,
    worstCaseMin: nominal - worstCaseTolerance,
    worstCaseMax: nominal + worstCaseTolerance,
    rssMin: nominal - rssTolerance,
    rssMax: nominal + rssTolerance,
  };
}
