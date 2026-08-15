import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  fmt,
  parseDimension,
  parseThreadSpec,
  tapDrillByPercent,
  mowSolveMExternal,
  mowSolveEExternal,
  radialChipThinningFactor,
  calculateSpeedsFeeds,
  boltCircleCoordinates,
  solveRightTriangle,
  chamferDepth,
  circleThrough3Points,
  tappingFeed,
  threadMilling,
  reamerAllowance,
  sineBarHeight,
  sineBarAngle,
  taperGeometry,
  ballNoseScallopHeight,
  ballNoseStepover,
  toleranceStack,
} from "./calc-core.js";

const near = (actual, expected, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected} ± ${tolerance}, got ${actual}`);
};

test("application module parses and HTML ids are unique", () => {
  const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
  const moduleMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);
  assert.ok(moduleMatch, "index.html must contain its module script");
  const body = moduleMatch[1].replace(/^\s*import\s*\{[\s\S]*?\}\s*from\s*["'][^"']+["'];\s*/, "");
  assert.doesNotThrow(() => new Function(body));
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, "duplicate HTML id found");
});

test("web app manifest is valid JSON and describes the real icon size", () => {
  const manifest = JSON.parse(readFileSync(new URL("./manifest.json", import.meta.url), "utf8"));
  assert.equal(manifest.id, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.icons[0].sizes, "1024x1024");
});

test("formatter preserves integer trailing zeros", () => {
  assert.equal(fmt(70, 0), "70");
  assert.equal(fmt(350, 0), "350");
  assert.equal(fmt(1200, 0), "1200");
  assert.equal(fmt(1.2300, 4), "1.23");
});

test("dimensions support decimals, fractions, mixed fractions, and suffix conversion", () => {
  near(parseDimension("3/8", "in"), 0.375);
  near(parseDimension("1 1/4", "in"), 1.25);
  near(parseDimension("25.4 mm", "in"), 1);
  near(parseDimension('0.5 in', "mm"), 12.7);
});

test("thread parser recognizes Unified, machine screw, and metric forms", () => {
  const unified = parseThreadSpec("1/4-20 UNC");
  assert.equal(unified.system, "un");
  assert.equal(unified.major, 0.25);
  assert.equal(unified.tpi, 20);
  assert.equal(unified.suppliedSeries, "UNC");
  assert.equal(parseThreadSpec("#10-32").major, 0.19);
  assert.equal(parseThreadSpec("M10").pitch, 1.5);
  assert.equal(parseThreadSpec("not a thread"), null);
});

test("tap-drill percent formula responds monotonically", () => {
  near(tapDrillByPercent(0.25, 0.05, 75), 0.20128604832424008, 1e-12);
  assert.ok(tapDrillByPercent(0.25, 0.05, 60) > tapDrillByPercent(0.25, 0.05, 80));
});

test("measurement-over-wires external solve round-trips", () => {
  const pitch = 1 / 20;
  const wire = pitch / Math.sqrt(3);
  const pitchDiameter = 0.2175;
  near(mowSolveEExternal(mowSolveMExternal(pitchDiameter, wire, pitch), wire, pitch), pitchDiameter, 1e-12);
});

test("radial chip-thinning factor is dimensionless and correct", () => {
  near(radialChipThinningFactor(0.5, 0.25), 1);
  near(radialChipThinningFactor(0.5, 0.05), 5 / 3, 1e-12);
  near(radialChipThinningFactor(12.7, 1.27), 5 / 3, 1e-12);
});

test("speeds-and-feeds is invariant between equivalent inch and metric inputs", () => {
  const inch = calculateSpeedsFeeds({ units: "in", diameter: 0.5, flutes: 4, sfm: 400, chipLoadIn: 0.003, widthOfCut: 0.05, depthOfCut: 0.1 });
  const metric = calculateSpeedsFeeds({ units: "mm", diameter: 12.7, flutes: 4, sfm: 400, chipLoadIn: 0.003, widthOfCut: 1.27, depthOfCut: 2.54 });
  near(metric.rpm, inch.rpm);
  near(metric.feed, inch.feed * 25.4, 1e-8);
  near(metric.mrr, inch.mrr * 25.4 ** 3, 1e-5);
});

test("machine RPM and feed caps are reported and applied", () => {
  const result = calculateSpeedsFeeds({ units: "in", diameter: 0.5, flutes: 4, sfm: 800, chipLoadIn: 0.003, maxRpm: 2000, maxFeed: 10 });
  assert.equal(result.rpm, 2000);
  assert.equal(result.feed, 10);
  assert.equal(result.limitedByRpm, true);
  assert.equal(result.limitedByFeed, true);
});

test("bolt-circle coordinates support center offsets and direction", () => {
  const ccw = boltCircleCoordinates(2, 4, 0, "ccw", 3, -2);
  near(ccw[0].x, 4); near(ccw[0].y, -2);
  near(ccw[1].x, 3); near(ccw[1].y, -1);
  const cw = boltCircleCoordinates(2, 4, 0, "cw", 3, -2);
  near(cw[1].y, -3);
});

test("right triangle, chamfer, and three-point circle solve known geometry", () => {
  const triangle = solveRightTriangle("runRise", 3, 4);
  near(triangle.hypotenuse, 5);
  near(chamferDepth(0, 0.1, 90), 0.05);
  const circle = circleThrough3Points([1, 0], [0, 1], [-1, 0]);
  near(circle.x, 0); near(circle.y, 0); near(circle.diameter, 2);
  assert.equal(circleThrough3Points([0, 0], [1, 1], [2, 2]), null);
});

test("tapping and internal thread-milling feed calculations", () => {
  near(tappingFeed({ units: "in", rpm: 500, tpi: 20 }).feed, 25);
  near(tappingFeed({ units: "mm", rpm: 500, pitch: 1.25 }).feed, 625);
  const threadMill = threadMilling({ units: "in", majorDiameter: 0.5, cutterDiameter: 0.25, rpm: 3000, flutes: 3, chipLoad: 0.001 });
  near(threadMill.surfaceFeed, 9);
  near(threadMill.centerlineFeed, 4.5);
});

test("reamer, sine-bar, and taper helpers", () => {
  near(reamerAllowance({ targetDiameter: 0.5, allowancePerSide: 0.005 }).preReamDiameter, 0.49);
  const stackHeight = sineBarHeight({ barLength: 5, angleDegrees: 30 });
  near(stackHeight, 2.5);
  near(sineBarAngle({ barLength: 5, stackHeight }), 30);
  near(taperGeometry({ largeDiameter: 1, smallDiameter: 0.75, length: 2 }).halfAngle, Math.atan(0.0625) * 180 / Math.PI);
});

test("ball-nose scallop and stepover helpers invert", () => {
  const height = ballNoseScallopHeight({ radius: 0.25, stepover: 0.1 });
  near(ballNoseStepover({ radius: 0.25, scallopHeight: height }), 0.1);
  assert.ok(Number.isNaN(ballNoseStepover({ radius: 0.25, scallopHeight: 0.3 })));
});

test("tolerance stack reports worst-case and RSS", () => {
  const result = toleranceStack([{ nominal: 1, tolerance: 0.005 }, { nominal: 2, tolerance: 0.01 }]);
  near(result.nominal, 3);
  near(result.worstCaseTolerance, 0.015);
  near(result.rssTolerance, Math.sqrt(0.000125));
  near(result.worstCaseMin, 2.985);
  near(result.worstCaseMax, 3.015);
});
