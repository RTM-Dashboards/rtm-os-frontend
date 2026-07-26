"use client";

// ─────────────────────────────────────────────────────────────────────────────
// SEO & Local — Keyword Rankings
//
// Dedicated per-keyword ranking breakdown page. For a selected client, shows
// EVERY individually tracked keyword with:
//   • Current organic SERP position
//   • Position change over the selected date window
//   • Estimated monthly search volume
//   • Ranking URL (page that ranks for the keyword)
//   • A per-row sparkline showing that keyword's rank trend
//   • Click-to-expand detail panel with a fuller historical rank chart
//
// IMPORTANT: All keyword rank positions, search volumes, and ranking URLs
// shown here are REPRESENTATIVE / ILLUSTRATIVE sample data. No Google Search
// Console, third-party rank-tracking API, or live crawl data is connected.
// Numbers are realistic-looking stand-ins designed to demonstrate the page
// structure. Connect a real rank-tracking integration to replace them with
// live data.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { useState, useMemo } from "react";
import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import DateRangeFilter, {
  DEFAULT_DATE_RANGE,
  describeDateRange,
} from "@/components/seo-local/DateRangeFilter";
import type { DateRangeState } from "@/components/seo-local/DateRangeFilter";

const workspace = getWorkspace("seo-local")!;
const ACCENT = workspace.accentColor ?? "#1d709f";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KeywordWeek {
  /** ISO week label, e.g. "W1" .. "W13" */
  week: string;
  /** Organic SERP position (1 = top result; 0 = not ranking / >100) */
  position: number;
}

interface TrackedKeyword {
  id: string;
  keyword: string;
  /** Current organic position (end of selected window) */
  currentPosition: number;
  /** Position change over selected window: negative = improved (moved up) */
  positionChange: number;
  /** Estimated monthly search volume */
  searchVolume: number;
  /** The page on the client's site that ranks for this keyword */
  rankingUrl: string;
  /** 13-week rank history — sliced by date window */
  weeks: KeywordWeek[];
  /** Keyword intent tag */
  intent: "brand" | "local" | "service" | "informational";
}

interface ClientKeywordData {
  id: string;
  name: string;
  domain: string;
  keywords: TrackedKeyword[];
}

// ─── Data generators ─────────────────────────────────────────────────────────

function makeKwWeeks(
  startPos: number,
  endPos: number,
  noise: number = 1.2,
  n = 13,
): KeywordWeek[] {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const base = startPos + (endPos - startPos) * t;
    // Deterministic noise via index seed
    const noiseVal = (((i * 13 + 7) % 7) - 3) * noise;
    const pos = Math.max(1, Math.round(base + noiseVal));
    return { week: `W${i + 1}`, position: pos };
  });
}

// ─── Representative dataset ───────────────────────────────────────────────────
// 15 clients × 5-8 keywords each, showing realistic per-keyword rank history.
// Seeded deterministically — no runtime randomness.

const ALL_CLIENTS: ClientKeywordData[] = [
  {
    id: "mc001",
    name: "Apex Roofing Solutions",
    domain: "apexroofingdenver.com",
    keywords: [
      {
        id: "mc001-k1", keyword: "roofing company denver", currentPosition: 4, positionChange: -9,
        searchVolume: 1900, rankingUrl: "/roofing-company-denver", intent: "local",
        weeks: makeKwWeeks(13, 4, 1.5),
      },
      {
        id: "mc001-k2", keyword: "roof repair denver", currentPosition: 2, positionChange: -14,
        searchVolume: 2400, rankingUrl: "/roof-repair", intent: "local",
        weeks: makeKwWeeks(16, 2, 1.2),
      },
      {
        id: "mc001-k3", keyword: "emergency roofer near me", currentPosition: 7, positionChange: -5,
        searchVolume: 880, rankingUrl: "/emergency-roof-repair", intent: "local",
        weeks: makeKwWeeks(12, 7, 1.8),
      },
      {
        id: "mc001-k4", keyword: "storm damage roofing", currentPosition: 18, positionChange: -8,
        searchVolume: 1200, rankingUrl: "/storm-damage-roofing", intent: "service",
        weeks: makeKwWeeks(26, 18, 2.0),
      },
      {
        id: "mc001-k5", keyword: "how long does a roof last", currentPosition: 11, positionChange: -6,
        searchVolume: 5400, rankingUrl: "/blog/how-long-does-roof-last", intent: "informational",
        weeks: makeKwWeeks(17, 11, 1.3),
      },
      {
        id: "mc001-k6", keyword: "apex roofing solutions reviews", currentPosition: 1, positionChange: 0,
        searchVolume: 210, rankingUrl: "/about", intent: "brand",
        weeks: makeKwWeeks(2, 1, 0.4),
      },
      {
        id: "mc001-k7", keyword: "roof replacement cost denver", currentPosition: 9, positionChange: -7,
        searchVolume: 3200, rankingUrl: "/roof-replacement", intent: "service",
        weeks: makeKwWeeks(16, 9, 1.6),
      },
    ],
  },
  {
    id: "mc002",
    name: "Sunbelt HVAC & Air",
    domain: "sunbelthvac.com",
    keywords: [
      {
        id: "mc002-k1", keyword: "hvac repair phoenix", currentPosition: 5, positionChange: -11,
        searchVolume: 3600, rankingUrl: "/hvac-repair-phoenix", intent: "local",
        weeks: makeKwWeeks(16, 5, 1.5),
      },
      {
        id: "mc002-k2", keyword: "ac installation phoenix", currentPosition: 3, positionChange: -8,
        searchVolume: 2900, rankingUrl: "/ac-installation", intent: "service",
        weeks: makeKwWeeks(11, 3, 1.2),
      },
      {
        id: "mc002-k3", keyword: "emergency hvac service", currentPosition: 12, positionChange: -6,
        searchVolume: 1600, rankingUrl: "/emergency-hvac", intent: "local",
        weeks: makeKwWeeks(18, 12, 2.1),
      },
      {
        id: "mc002-k4", keyword: "how often should ac be serviced", currentPosition: 8, positionChange: -4,
        searchVolume: 6600, rankingUrl: "/blog/ac-maintenance-schedule", intent: "informational",
        weeks: makeKwWeeks(12, 8, 1.4),
      },
      {
        id: "mc002-k5", keyword: "sunbelt hvac reviews", currentPosition: 1, positionChange: 0,
        searchVolume: 140, rankingUrl: "/about", intent: "brand",
        weeks: makeKwWeeks(2, 1, 0.3),
      },
      {
        id: "mc002-k6", keyword: "heat pump installation cost", currentPosition: 21, positionChange: -9,
        searchVolume: 4400, rankingUrl: "/heat-pump-installation", intent: "service",
        weeks: makeKwWeeks(30, 21, 2.5),
      },
    ],
  },
  {
    id: "mc003",
    name: "Pacific Dental Group",
    domain: "pacificdentalsd.com",
    keywords: [
      {
        id: "mc003-k1", keyword: "dentist san diego", currentPosition: 3, positionChange: -5,
        searchVolume: 5400, rankingUrl: "/", intent: "local",
        weeks: makeKwWeeks(8, 3, 1.0),
      },
      {
        id: "mc003-k2", keyword: "emergency dentist san diego", currentPosition: 1, positionChange: -4,
        searchVolume: 1900, rankingUrl: "/emergency-dentist", intent: "local",
        weeks: makeKwWeeks(5, 1, 0.8),
      },
      {
        id: "mc003-k3", keyword: "teeth cleaning san diego", currentPosition: 2, positionChange: -3,
        searchVolume: 2100, rankingUrl: "/preventive-care", intent: "service",
        weeks: makeKwWeeks(5, 2, 0.7),
      },
      {
        id: "mc003-k4", keyword: "invisalign san diego cost", currentPosition: 6, positionChange: -7,
        searchVolume: 3600, rankingUrl: "/invisalign", intent: "service",
        weeks: makeKwWeeks(13, 6, 1.5),
      },
      {
        id: "mc003-k5", keyword: "dental implants san diego", currentPosition: 9, positionChange: -8,
        searchVolume: 4100, rankingUrl: "/dental-implants", intent: "service",
        weeks: makeKwWeeks(17, 9, 1.8),
      },
      {
        id: "mc003-k6", keyword: "how much does invisalign cost", currentPosition: 14, positionChange: -6,
        searchVolume: 22000, rankingUrl: "/blog/invisalign-cost-guide", intent: "informational",
        weeks: makeKwWeeks(20, 14, 2.0),
      },
      {
        id: "mc003-k7", keyword: "pacific dental group", currentPosition: 1, positionChange: 0,
        searchVolume: 480, rankingUrl: "/", intent: "brand",
        weeks: makeKwWeeks(1, 1, 0.2),
      },
      {
        id: "mc003-k8", keyword: "pediatric dentist san diego", currentPosition: 5, positionChange: -4,
        searchVolume: 1800, rankingUrl: "/pediatric-dentistry", intent: "local",
        weeks: makeKwWeeks(9, 5, 1.1),
      },
    ],
  },
  {
    id: "mc004",
    name: "Blue Ridge Plumbing Co.",
    domain: "blueridgeplumbing.com",
    keywords: [
      {
        id: "mc004-k1", keyword: "plumber asheville nc", currentPosition: 2, positionChange: -13,
        searchVolume: 1300, rankingUrl: "/plumber-asheville", intent: "local",
        weeks: makeKwWeeks(15, 2, 1.4),
      },
      {
        id: "mc004-k2", keyword: "emergency plumbing asheville", currentPosition: 4, positionChange: -8,
        searchVolume: 720, rankingUrl: "/emergency-plumbing", intent: "local",
        weeks: makeKwWeeks(12, 4, 1.6),
      },
      {
        id: "mc004-k3", keyword: "drain cleaning near me", currentPosition: 14, positionChange: -10,
        searchVolume: 2900, rankingUrl: "/drain-cleaning", intent: "service",
        weeks: makeKwWeeks(24, 14, 2.2),
      },
      {
        id: "mc004-k4", keyword: "water heater replacement cost", currentPosition: 7, positionChange: -5,
        searchVolume: 8100, rankingUrl: "/blog/water-heater-cost", intent: "informational",
        weeks: makeKwWeeks(12, 7, 1.3),
      },
      {
        id: "mc004-k5", keyword: "sewer line repair asheville", currentPosition: 11, positionChange: -6,
        searchVolume: 480, rankingUrl: "/sewer-line-repair", intent: "service",
        weeks: makeKwWeeks(17, 11, 1.8),
      },
    ],
  },
  {
    id: "mc005",
    name: "Harbor Auto Group",
    domain: "harborautogroup.com",
    keywords: [
      {
        id: "mc005-k1", keyword: "car dealership phoenix", currentPosition: 8, positionChange: -6,
        searchVolume: 3200, rankingUrl: "/", intent: "local",
        weeks: makeKwWeeks(14, 8, 1.8),
      },
      {
        id: "mc005-k2", keyword: "used cars phoenix az", currentPosition: 5, positionChange: -9,
        searchVolume: 5400, rankingUrl: "/used-cars", intent: "service",
        weeks: makeKwWeeks(14, 5, 1.5),
      },
      {
        id: "mc005-k3", keyword: "certified pre-owned phoenix", currentPosition: 11, positionChange: -4,
        searchVolume: 1600, rankingUrl: "/cpo", intent: "service",
        weeks: makeKwWeeks(15, 11, 1.6),
      },
      {
        id: "mc005-k4", keyword: "auto financing phoenix no credit", currentPosition: 19, positionChange: -12,
        searchVolume: 2400, rankingUrl: "/financing", intent: "service",
        weeks: makeKwWeeks(31, 19, 2.4),
      },
      {
        id: "mc005-k5", keyword: "harbor auto group phoenix", currentPosition: 1, positionChange: 0,
        searchVolume: 320, rankingUrl: "/", intent: "brand",
        weeks: makeKwWeeks(1, 1, 0.3),
      },
      {
        id: "mc005-k6", keyword: "how to trade in a car", currentPosition: 13, positionChange: -8,
        searchVolume: 14800, rankingUrl: "/blog/trade-in-tips", intent: "informational",
        weeks: makeKwWeeks(21, 13, 2.0),
      },
    ],
  },
  {
    id: "mc010",
    name: "Clearwater Insurance Agency",
    domain: "clearwaterinsurance.com",
    keywords: [
      {
        id: "mc010-k1", keyword: "insurance agency clearwater fl", currentPosition: 3, positionChange: -10,
        searchVolume: 880, rankingUrl: "/", intent: "local",
        weeks: makeKwWeeks(13, 3, 1.2),
      },
      {
        id: "mc010-k2", keyword: "homeowners insurance florida", currentPosition: 16, positionChange: -8,
        searchVolume: 6600, rankingUrl: "/homeowners-insurance", intent: "service",
        weeks: makeKwWeeks(24, 16, 2.1),
      },
      {
        id: "mc010-k3", keyword: "auto insurance clearwater", currentPosition: 6, positionChange: -7,
        searchVolume: 1900, rankingUrl: "/auto-insurance", intent: "local",
        weeks: makeKwWeeks(13, 6, 1.5),
      },
      {
        id: "mc010-k4", keyword: "how much is car insurance in florida", currentPosition: 9, positionChange: -5,
        searchVolume: 18100, rankingUrl: "/blog/fl-auto-insurance-cost", intent: "informational",
        weeks: makeKwWeeks(14, 9, 1.4),
      },
      {
        id: "mc010-k5", keyword: "business insurance clearwater fl", currentPosition: 22, positionChange: -11,
        searchVolume: 590, rankingUrl: "/business-insurance", intent: "service",
        weeks: makeKwWeeks(33, 22, 2.6),
      },
    ],
  },
  {
    id: "mc011",
    name: "Ridgeline Construction LLC",
    domain: "ridgelineconstruction.com",
    keywords: [
      {
        id: "mc011-k1", keyword: "general contractor seattle", currentPosition: 12, positionChange: -17,
        searchVolume: 2400, rankingUrl: "/general-contractor-seattle", intent: "local",
        weeks: makeKwWeeks(29, 12, 2.2),
      },
      {
        id: "mc011-k2", keyword: "home addition contractor seattle", currentPosition: 7, positionChange: -14,
        searchVolume: 1600, rankingUrl: "/home-additions", intent: "service",
        weeks: makeKwWeeks(21, 7, 1.8),
      },
      {
        id: "mc011-k3", keyword: "kitchen remodel seattle", currentPosition: 9, positionChange: -9,
        searchVolume: 3600, rankingUrl: "/kitchen-remodeling", intent: "service",
        weeks: makeKwWeeks(18, 9, 1.7),
      },
      {
        id: "mc011-k4", keyword: "how much does a home addition cost", currentPosition: 11, positionChange: -7,
        searchVolume: 12100, rankingUrl: "/blog/home-addition-cost", intent: "informational",
        weeks: makeKwWeeks(18, 11, 1.6),
      },
      {
        id: "mc011-k5", keyword: "bathroom remodel contractor near me", currentPosition: 18, positionChange: -12,
        searchVolume: 5400, rankingUrl: "/bathroom-remodeling", intent: "service",
        weeks: makeKwWeeks(30, 18, 2.3),
      },
      {
        id: "mc011-k6", keyword: "ridgeline construction seattle", currentPosition: 1, positionChange: 0,
        searchVolume: 90, rankingUrl: "/", intent: "brand",
        weeks: makeKwWeeks(2, 1, 0.4),
      },
    ],
  },
  {
    id: "mc012",
    name: "Nova MedSpa & Aesthetics",
    domain: "novamedspa.com",
    keywords: [
      {
        id: "mc012-k1", keyword: "medspa near me", currentPosition: 4, positionChange: -7,
        searchVolume: 9900, rankingUrl: "/", intent: "local",
        weeks: makeKwWeeks(11, 4, 1.3),
      },
      {
        id: "mc012-k2", keyword: "botox injections miami", currentPosition: 3, positionChange: -5,
        searchVolume: 4400, rankingUrl: "/botox", intent: "service",
        weeks: makeKwWeeks(8, 3, 1.0),
      },
      {
        id: "mc012-k3", keyword: "laser hair removal miami", currentPosition: 6, positionChange: -9,
        searchVolume: 3600, rankingUrl: "/laser-hair-removal", intent: "service",
        weeks: makeKwWeeks(15, 6, 1.5),
      },
      {
        id: "mc012-k4", keyword: "how much does botox cost", currentPosition: 12, positionChange: -6,
        searchVolume: 27100, rankingUrl: "/blog/botox-cost-guide", intent: "informational",
        weeks: makeKwWeeks(18, 12, 1.9),
      },
      {
        id: "mc012-k5", keyword: "fillers miami price", currentPosition: 8, positionChange: -4,
        searchVolume: 2900, rankingUrl: "/dermal-fillers", intent: "service",
        weeks: makeKwWeeks(12, 8, 1.4),
      },
      {
        id: "mc012-k6", keyword: "nova medspa miami", currentPosition: 1, positionChange: 0,
        searchVolume: 390, rankingUrl: "/", intent: "brand",
        weeks: makeKwWeeks(2, 1, 0.3),
      },
      {
        id: "mc012-k7", keyword: "coolsculpting near me", currentPosition: 14, positionChange: -11,
        searchVolume: 12100, rankingUrl: "/coolsculpting", intent: "service",
        weeks: makeKwWeeks(25, 14, 2.1),
      },
    ],
  },
  {
    id: "mc013",
    name: "Desert Solar Energy",
    domain: "desertsolarenergy.com",
    keywords: [
      {
        id: "mc013-k1", keyword: "solar panels tucson", currentPosition: 5, positionChange: -9,
        searchVolume: 2400, rankingUrl: "/solar-panels-tucson", intent: "local",
        weeks: makeKwWeeks(14, 5, 1.4),
      },
      {
        id: "mc013-k2", keyword: "solar installation arizona", currentPosition: 7, positionChange: -8,
        searchVolume: 3600, rankingUrl: "/solar-installation", intent: "service",
        weeks: makeKwWeeks(15, 7, 1.5),
      },
      {
        id: "mc013-k3", keyword: "how much do solar panels cost in arizona", currentPosition: 6, positionChange: -7,
        searchVolume: 9900, rankingUrl: "/blog/solar-cost-arizona", intent: "informational",
        weeks: makeKwWeeks(13, 6, 1.3),
      },
      {
        id: "mc013-k4", keyword: "solar tax credit 2025", currentPosition: 16, positionChange: -5,
        searchVolume: 22200, rankingUrl: "/blog/solar-tax-credit", intent: "informational",
        weeks: makeKwWeeks(21, 16, 2.0),
      },
      {
        id: "mc013-k5", keyword: "battery backup solar tucson", currentPosition: 9, positionChange: -10,
        searchVolume: 1300, rankingUrl: "/solar-battery-backup", intent: "service",
        weeks: makeKwWeeks(19, 9, 1.7),
      },
    ],
  },
  {
    id: "mc015",
    name: "Pinnacle Chiropractic",
    domain: "pinnaclechiro.com",
    keywords: [
      {
        id: "mc015-k1", keyword: "chiropractor nashville", currentPosition: 2, positionChange: -4,
        searchVolume: 2900, rankingUrl: "/chiropractor-nashville", intent: "local",
        weeks: makeKwWeeks(6, 2, 0.9),
      },
      {
        id: "mc015-k2", keyword: "back pain doctor near me", currentPosition: 4, positionChange: -6,
        searchVolume: 6600, rankingUrl: "/back-pain", intent: "service",
        weeks: makeKwWeeks(10, 4, 1.2),
      },
      {
        id: "mc015-k3", keyword: "sports injury chiropractor nashville", currentPosition: 5, positionChange: -7,
        searchVolume: 880, rankingUrl: "/sports-injuries", intent: "service",
        weeks: makeKwWeeks(12, 5, 1.4),
      },
      {
        id: "mc015-k4", keyword: "how many chiropractic sessions do i need", currentPosition: 7, positionChange: -5,
        searchVolume: 5400, rankingUrl: "/blog/chiropractic-sessions", intent: "informational",
        weeks: makeKwWeeks(12, 7, 1.3),
      },
      {
        id: "mc015-k5", keyword: "pinnacle chiropractic", currentPosition: 1, positionChange: 0,
        searchVolume: 260, rankingUrl: "/", intent: "brand",
        weeks: makeKwWeeks(1, 1, 0.2),
      },
      {
        id: "mc015-k6", keyword: "sciatica treatment nashville", currentPosition: 10, positionChange: -8,
        searchVolume: 1300, rankingUrl: "/sciatica-treatment", intent: "service",
        weeks: makeKwWeeks(18, 10, 1.6),
      },
    ],
  },
  {
    id: "mc016",
    name: "Capital Contractors Group",
    domain: "capitalcontractors.com",
    keywords: [
      {
        id: "mc016-k1", keyword: "commercial contractor dc", currentPosition: 14, positionChange: -15,
        searchVolume: 1600, rankingUrl: "/commercial-contractor-dc", intent: "local",
        weeks: makeKwWeeks(29, 14, 2.3),
      },
      {
        id: "mc016-k2", keyword: "office renovation washington dc", currentPosition: 11, positionChange: -12,
        searchVolume: 1900, rankingUrl: "/office-renovation", intent: "service",
        weeks: makeKwWeeks(23, 11, 2.0),
      },
      {
        id: "mc016-k3", keyword: "tenant improvement contractor", currentPosition: 8, positionChange: -10,
        searchVolume: 2400, rankingUrl: "/tenant-improvements", intent: "service",
        weeks: makeKwWeeks(18, 8, 1.7),
      },
      {
        id: "mc016-k4", keyword: "how long does office renovation take", currentPosition: 6, positionChange: -8,
        searchVolume: 3600, rankingUrl: "/blog/office-renovation-timeline", intent: "informational",
        weeks: makeKwWeeks(14, 6, 1.5),
      },
    ],
  },
  {
    id: "mc017",
    name: "Eastside Veterinary Clinic",
    domain: "eastsidevetclinic.com",
    keywords: [
      {
        id: "mc017-k1", keyword: "vet clinic near me", currentPosition: 3, positionChange: -6,
        searchVolume: 14800, rankingUrl: "/", intent: "local",
        weeks: makeKwWeeks(9, 3, 1.1),
      },
      {
        id: "mc017-k2", keyword: "emergency vet seattle", currentPosition: 5, positionChange: -5,
        searchVolume: 3600, rankingUrl: "/emergency-care", intent: "local",
        weeks: makeKwWeeks(10, 5, 1.3),
      },
      {
        id: "mc017-k3", keyword: "dog vaccinations seattle", currentPosition: 7, positionChange: -7,
        searchVolume: 1900, rankingUrl: "/dog-vaccines", intent: "service",
        weeks: makeKwWeeks(14, 7, 1.5),
      },
      {
        id: "mc017-k4", keyword: "how much does a vet visit cost", currentPosition: 4, positionChange: -8,
        searchVolume: 49500, rankingUrl: "/blog/vet-visit-cost", intent: "informational",
        weeks: makeKwWeeks(12, 4, 1.2),
      },
      {
        id: "mc017-k5", keyword: "cat dental cleaning seattle", currentPosition: 9, positionChange: -4,
        searchVolume: 720, rankingUrl: "/dental-care", intent: "service",
        weeks: makeKwWeeks(13, 9, 1.4),
      },
      {
        id: "mc017-k6", keyword: "eastside veterinary clinic", currentPosition: 1, positionChange: 0,
        searchVolume: 210, rankingUrl: "/", intent: "brand",
        weeks: makeKwWeeks(1, 1, 0.3),
      },
    ],
  },
  {
    id: "mc018",
    name: "Ironclad Security Systems",
    domain: "ironclaidsecurity.com",
    keywords: [
      {
        id: "mc018-k1", keyword: "security system installation houston", currentPosition: 6, positionChange: -10,
        searchVolume: 1900, rankingUrl: "/security-installation-houston", intent: "local",
        weeks: makeKwWeeks(16, 6, 1.5),
      },
      {
        id: "mc018-k2", keyword: "commercial security cameras houston", currentPosition: 4, positionChange: -12,
        searchVolume: 1300, rankingUrl: "/commercial-cameras", intent: "service",
        weeks: makeKwWeeks(16, 4, 1.4),
      },
      {
        id: "mc018-k3", keyword: "home alarm monitoring monthly cost", currentPosition: 9, positionChange: -7,
        searchVolume: 8100, rankingUrl: "/blog/alarm-monitoring-cost", intent: "informational",
        weeks: makeKwWeeks(16, 9, 1.6),
      },
      {
        id: "mc018-k4", keyword: "access control systems houston", currentPosition: 13, positionChange: -9,
        searchVolume: 880, rankingUrl: "/access-control", intent: "service",
        weeks: makeKwWeeks(22, 13, 1.9),
      },
      {
        id: "mc018-k5", keyword: "ironclad security houston", currentPosition: 1, positionChange: 0,
        searchVolume: 170, rankingUrl: "/", intent: "brand",
        weeks: makeKwWeeks(1, 1, 0.2),
      },
    ],
  },
  {
    id: "mc019",
    name: "Coastal Wellness Center",
    domain: "coastalwellness.com",
    keywords: [
      {
        id: "mc019-k1", keyword: "wellness center virginia beach", currentPosition: 3, positionChange: -8,
        searchVolume: 1600, rankingUrl: "/", intent: "local",
        weeks: makeKwWeeks(11, 3, 1.2),
      },
      {
        id: "mc019-k2", keyword: "acupuncture virginia beach", currentPosition: 2, positionChange: -6,
        searchVolume: 1300, rankingUrl: "/acupuncture", intent: "service",
        weeks: makeKwWeeks(8, 2, 1.0),
      },
      {
        id: "mc019-k3", keyword: "massage therapy near me", currentPosition: 7, positionChange: -5,
        searchVolume: 22200, rankingUrl: "/massage-therapy", intent: "local",
        weeks: makeKwWeeks(12, 7, 1.3),
      },
      {
        id: "mc019-k4", keyword: "how often should you get a massage", currentPosition: 5, positionChange: -7,
        searchVolume: 9900, rankingUrl: "/blog/massage-frequency", intent: "informational",
        weeks: makeKwWeeks(12, 5, 1.4),
      },
      {
        id: "mc019-k5", keyword: "iv therapy virginia beach", currentPosition: 4, positionChange: -9,
        searchVolume: 590, rankingUrl: "/iv-therapy", intent: "service",
        weeks: makeKwWeeks(13, 4, 1.3),
      },
      {
        id: "mc019-k6", keyword: "coastal wellness center reviews", currentPosition: 1, positionChange: 0,
        searchVolume: 140, rankingUrl: "/about", intent: "brand",
        weeks: makeKwWeeks(1, 1, 0.2),
      },
    ],
  },
  {
    id: "mc020",
    name: "Frontier Logistics Inc.",
    domain: "frontierlogistics.com",
    keywords: [
      {
        id: "mc020-k1", keyword: "freight broker dallas", currentPosition: 11, positionChange: -13,
        searchVolume: 1300, rankingUrl: "/freight-broker-dallas", intent: "local",
        weeks: makeKwWeeks(24, 11, 2.0),
      },
      {
        id: "mc020-k2", keyword: "ltl shipping quotes", currentPosition: 8, positionChange: -10,
        searchVolume: 3600, rankingUrl: "/ltl-shipping", intent: "service",
        weeks: makeKwWeeks(18, 8, 1.7),
      },
      {
        id: "mc020-k3", keyword: "how much does freight shipping cost", currentPosition: 7, positionChange: -8,
        searchVolume: 8100, rankingUrl: "/blog/freight-shipping-cost", intent: "informational",
        weeks: makeKwWeeks(15, 7, 1.5),
      },
      {
        id: "mc020-k4", keyword: "warehousing dallas tx", currentPosition: 16, positionChange: -11,
        searchVolume: 1900, rankingUrl: "/warehousing", intent: "service",
        weeks: makeKwWeeks(27, 16, 2.2),
      },
      {
        id: "mc020-k5", keyword: "frontier logistics dallas", currentPosition: 1, positionChange: 0,
        searchVolume: 110, rankingUrl: "/", intent: "brand",
        weeks: makeKwWeeks(1, 1, 0.2),
      },
    ],
  },
];

// ─── Week count from DateRangeState ──────────────────────────────────────────

function weeksFromDateRange(dr: DateRangeState): number {
  if (dr.mode === "preset") {
    if (dr.presetDays === 30) return 4;
    if (dr.presetDays === 60) return 9;
    return 13;
  }
  if (dr.customStart && dr.customEnd) {
    const start = new Date(dr.customStart + "T00:00:00");
    const end = new Date(dr.customEnd + "T00:00:00");
    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    return Math.min(13, Math.max(1, Math.ceil(diffDays / 7)));
  }
  return 13;
}

// ─── Derive position change from sliced window ────────────────────────────────

function slicedChange(weeks: KeywordWeek[], n: number): number {
  const sliced = weeks.slice(weeks.length - n);
  if (sliced.length < 2) return 0;
  const delta = sliced[sliced.length - 1].position - sliced[0].position;
  return Math.round(delta * 10) / 10;
}

// ─── Position badge color tiers ───────────────────────────────────────────────

function positionTier(pos: number): { bg: string; color: string } {
  if (pos <= 3)  return { bg: "#ECFDF5", color: "#059669" };
  if (pos <= 10) return { bg: "#FFFBEB", color: "#D97706" };
  if (pos <= 20) return { bg: "var(--rtm-blue-xlight)", color: ACCENT };
  return { bg: "#FEF2F2", color: "#DC2626" };
}

// ─── Intent badge ─────────────────────────────────────────────────────────────

function IntentBadge({ intent }: { intent: TrackedKeyword["intent"] }) {
  const map: Record<TrackedKeyword["intent"], { label: string; bg: string; color: string }> = {
    brand:         { label: "Brand",         bg: "#F5F3FF", color: "#7C3AED" },
    local:         { label: "Local",         bg: "#ECFDF5", color: "#059669" },
    service:       { label: "Service",       bg: "var(--rtm-blue-xlight)", color: ACCENT },
    informational: { label: "Informational", bg: "#FFFBEB", color: "#D97706" },
  };
  const { label, bg, color } = map[intent];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}

// ─── Position change badge ─────────────────────────────────────────────────────

function ChangeBadge({ change }: { change: number }) {
  if (change === 0)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
        style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}>
        —
      </span>
    );
  const improved = change < 0; // negative = moved up = improved
  const bg = improved ? "#ECFDF5" : "#FEF2F2";
  const color = improved ? "#059669" : "#DC2626";
  const icon = improved ? "↑" : "↓";
  const label = improved ? `${icon} ${Math.abs(change)}` : `${icon} +${change}`;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: bg, color }}>
      {label}
    </span>
  );
}

// ─── Volume formatter ─────────────────────────────────────────────────────────

function fmtVol(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
  return v.toString();
}

// ─── Sparkline (per-row mini SVG chart) ──────────────────────────────────────

interface SparklineProps {
  data: number[];
  /** When true, lower values sit visually higher (rank improvement = up) */
  invertY?: boolean;
  color?: string;
  width?: number;
  height?: number;
}

function Sparkline({ data, invertY = true, color = ACCENT, width = 80, height = 28 }: SparklineProps) {
  if (data.length < 2) return null;
  const padX = 2;
  const padY = 2;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const toX = (i: number) => padX + (i / (data.length - 1)) * innerW;
  const toY = (v: number) => {
    const n = (v - min) / range; // 0..1
    return invertY
      ? padY + n * innerH         // lower rank = top of chart
      : padY + (1 - n) * innerH;
  };

  const points = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const improved = data[data.length - 1] < data[0]; // position number went down = improved
  const lineColor = improved ? "#059669" : color;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <polyline
        points={points}
        fill="none"
        stroke={lineColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Start dot */}
      <circle cx={toX(0)} cy={toY(data[0])} r={2} fill={lineColor} opacity={0.5} />
      {/* End dot */}
      <circle cx={toX(data.length - 1)} cy={toY(data[data.length - 1])} r={2.5} fill={lineColor} />
    </svg>
  );
}

// ─── Full detail chart (SVG, wider) ──────────────────────────────────────────

interface DetailChartProps {
  weeks: KeywordWeek[];
  accentColor?: string;
  height?: number;
}

function DetailChart({ weeks, accentColor = ACCENT, height = 160 }: DetailChartProps) {
  if (weeks.length < 2) return null;

  const W = 480;
  const H = height;
  const padL = 32;
  const padR = 10;
  const padT = 12;
  const padB = 26;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const data = weeks.map((w) => w.position);
  const labels = weeks.map((w) => w.week);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const toX = (i: number) => padL + (i / (data.length - 1)) * innerW;
  // lower position number = higher up (better) = lower Y
  const toY = (v: number) => padT + ((v - min) / range) * innerH;

  const points = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");

  const areaPath =
    `M ${toX(0)},${toY(data[0])} ` +
    data.slice(1).map((v, i) => `L ${toX(i + 1)},${toY(v)}`).join(" ") +
    ` L ${toX(data.length - 1)},${H - padB} L ${toX(0)},${H - padB} Z`;

  // Y ticks — 4 evenly spaced
  const yTicks = [0, 0.33, 0.67, 1].map((t) => ({
    val: min + t * range,
    y: padT + t * innerH,
  }));

  const step = data.length <= 5 ? 1 : data.length <= 9 ? 2 : 3;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} aria-hidden="true">
      {/* Grid lines + Y labels */}
      {yTicks.map(({ val, y }, idx) => (
        <g key={idx}>
          <line x1={padL} y1={y} x2={W - padR} y2={y}
            stroke="var(--rtm-border-light)" strokeWidth={0.5} strokeDasharray="3,3" />
          <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={8}
            fill="var(--rtm-text-muted)">
            #{Math.round(val)}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill={accentColor} opacity={0.08} />

      {/* Line */}
      <polyline points={points} fill="none" stroke={accentColor}
        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {data.map((v, i) => (
        <circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill={accentColor} />
      ))}

      {/* X labels */}
      {labels.map((lbl, i) => {
        if (i % step !== 0 && i !== labels.length - 1) return null;
        return (
          <text key={i} x={toX(i)} y={H - 6} textAnchor="middle"
            fontSize={7.5} fill="var(--rtm-text-muted)">
            {lbl}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Sort types ───────────────────────────────────────────────────────────────

type SortField = "keyword" | "position" | "change" | "volume";
type SortDir = "asc" | "desc";

// ─── Honest data banner ───────────────────────────────────────────────────────

function RepresentativeDataBanner() {
  return (
    <div
      className="flex items-start gap-3 p-3.5 rounded-xl border"
      style={{ background: "var(--rtm-blue-xlight)", borderColor: "var(--rtm-blue-light)" }}
    >
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--rtm-blue-dark)" }}>
          Representative data — not live Search Console or rank-tracking data
        </p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--rtm-blue)", opacity: 0.85 }}>
          All keyword positions, position changes, search volumes, and ranking URLs shown here are{" "}
          <strong>illustrative sample data</strong> designed to demonstrate the dashboard structure.
          Connect Google Search Console, Google Analytics, or a rank-tracking API (e.g. Semrush,
          Ahrefs, BrightLocal) to replace these with live metrics.
        </p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function KeywordRankingsPage() {
  const [selectedId, setSelectedId]     = useState<string>(ALL_CLIENTS[0].id);
  const [dateRange, setDateRange]       = useState<DateRangeState>(DEFAULT_DATE_RANGE);
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [sortField, setSortField]       = useState<SortField>("position");
  const [sortDir, setSortDir]           = useState<SortDir>("asc");
  const [intentFilter, setIntentFilter] = useState<TrackedKeyword["intent"] | "all">("all");
  const [search, setSearch]             = useState("");

  const client = ALL_CLIENTS.find((c) => c.id === selectedId)!;
  const numWeeks = weeksFromDateRange(dateRange);
  const rangeLabel = describeDateRange(dateRange);

  // ── Derive display keyword list with sliced position change ──────────────
  const displayKeywords: (TrackedKeyword & { windowChange: number; slicedWeeks: KeywordWeek[] })[] =
    useMemo(() => {
      return client.keywords.map((kw) => {
        const slicedWeeks = kw.weeks.slice(kw.weeks.length - numWeeks);
        const windowChange = slicedChange(kw.weeks, numWeeks);
        return { ...kw, windowChange, slicedWeeks };
      });
    }, [client, numWeeks]);

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return displayKeywords.filter((kw) => {
      if (intentFilter !== "all" && kw.intent !== intentFilter) return false;
      if (search.trim() && !kw.keyword.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [displayKeywords, intentFilter, search]);

  // ── Sort ─────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === "keyword")  cmp = a.keyword.localeCompare(b.keyword);
      if (sortField === "position") cmp = a.currentPosition - b.currentPosition;
      if (sortField === "change")   cmp = a.windowChange - b.windowChange;
      if (sortField === "volume")   cmp = a.searchVolume - b.searchVolume;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "keyword" ? "asc" : "asc");
    }
  };

  const SortIndicator = ({ field }: { field: SortField }) =>
    sortField === field ? (
      <span className="ml-0.5 opacity-60">{sortDir === "asc" ? "↑" : "↓"}</span>
    ) : null;

  // ── Summary KPIs ─────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const all = displayKeywords;
    const top3  = all.filter((k) => k.currentPosition <= 3).length;
    const top10 = all.filter((k) => k.currentPosition <= 10).length;
    const top20 = all.filter((k) => k.currentPosition <= 20).length;
    const improved = all.filter((k) => k.windowChange < 0).length;
    const avgPos = all.length
      ? Math.round((all.reduce((s, k) => s + k.currentPosition, 0) / all.length) * 10) / 10
      : 0;
    return { total: all.length, top3, top10, top20, improved, avgPos };
  }, [displayKeywords]);

  // ── Client change handler ─────────────────────────────────────────────────
  const handleClientChange = (id: string) => {
    setSelectedId(id);
    setExpandedId(null);
    setSearch("");
    setIntentFilter("all");
  };

  // ── Expanded keyword ──────────────────────────────────────────────────────
  const expandedKw = expandedId
    ? displayKeywords.find((k) => k.id === expandedId)
    : null;

  return (
    <div className="space-y-6">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: ACCENT }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--rtm-text-primary)" }}>
          Keyword Rankings
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Individual keyword rank tracking — every tracked keyword with its position, change,
          search volume, ranking URL, and trend history.
        </p>
      </div>

      {/* ── Honest data banner ────────────────────────────────────────────── */}
      <RepresentativeDataBanner />

      {/* ── Selectors row ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Client selector */}
        <div className="flex flex-col gap-1 min-w-[220px]">
          <label className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "var(--rtm-text-muted)" }}>
            Client
          </label>
          <select
            value={selectedId}
            onChange={(e) => handleClientChange(e.target.value)}
            className="text-sm rounded-lg border px-3 py-2 pr-8"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
              appearance: "auto",
            }}
          >
            {ALL_CLIENTS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Shared date-range filter */}
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          accentColor={ACCENT}
          label="Date Range"
        />

        {/* Domain badge */}
        <div className="flex items-center pb-0.5">
          <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
            style={{ background: "var(--rtm-blue-xlight)", color: ACCENT }}>
            {client.domain}
          </span>
        </div>
      </div>

      {/* ── KPI summary cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          {
            label: "Total Keywords",
            value: kpis.total,
            sub: "tracked",
            color: ACCENT,
            bg: "var(--rtm-blue-xlight)",
          },
          {
            label: "Top 3",
            value: kpis.top3,
            sub: `of ${kpis.total}`,
            color: "#059669",
            bg: "#ECFDF5",
          },
          {
            label: "Top 10",
            value: kpis.top10,
            sub: `of ${kpis.total}`,
            color: "#D97706",
            bg: "#FFFBEB",
          },
          {
            label: "Top 20",
            value: kpis.top20,
            sub: `of ${kpis.total}`,
            color: ACCENT,
            bg: "var(--rtm-blue-xlight)",
          },
          {
            label: "Improved",
            value: kpis.improved,
            sub: `over ${rangeLabel}`,
            color: "#059669",
            bg: "#ECFDF5",
          },
          {
            label: "Avg Position",
            value: `#${kpis.avgPos}`,
            sub: "across all kws",
            color: kpis.avgPos <= 10 ? "#059669" : kpis.avgPos <= 20 ? ACCENT : "#DC2626",
            bg: kpis.avgPos <= 10 ? "#ECFDF5" : kpis.avgPos <= 20 ? "var(--rtm-blue-xlight)" : "#FEF2F2",
          },
        ].map(({ label, value, sub, color, bg }) => (
          <div key={label} className="rounded-xl border p-3.5 flex flex-col gap-0.5"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
            <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Keyword table section ──────────────────────────────────────────── */}
      <SectionWrapper
        title={`${client.name} — All Tracked Keywords`}
        description={`${kpis.total} keywords · ${rangeLabel} · representative data`}
      >
        {/* ── Filter/search bar ──────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 items-center mb-4">
          {/* Keyword search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter keywords…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm rounded-lg border pl-8 pr-3 py-1.5 w-52 focus:outline-none"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
            />
            <svg className="absolute left-2.5 top-2 w-3.5 h-3.5" fill="none"
              stroke="currentColor" viewBox="0 0 24 24"
              style={{ color: "var(--rtm-text-muted)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
          </div>

          {/* Intent filter */}
          <div className="flex rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--rtm-border)" }}>
            {(["all", "local", "service", "informational", "brand"] as const).map((v, idx, arr) => (
              <button
                key={v}
                onClick={() => setIntentFilter(v)}
                className="px-3 py-1.5 text-[11px] font-semibold capitalize transition-colors"
                style={{
                  background: intentFilter === v ? ACCENT : "var(--rtm-surface)",
                  color: intentFilter === v ? "#fff" : "var(--rtm-text-secondary)",
                  borderRight: idx < arr.length - 1 ? "1px solid var(--rtm-border)" : "none",
                }}
              >
                {v === "all" ? "All" : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Results count */}
          <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
            {sorted.length} of {kpis.total} keywords
          </span>
        </div>

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border)" }}>
                {/* Keyword */}
                <th
                  className="text-left pb-2 pr-3 text-[11px] font-bold uppercase tracking-widest cursor-pointer select-none"
                  style={{ color: "var(--rtm-text-muted)", minWidth: 200 }}
                  onClick={() => handleSort("keyword")}
                >
                  Keyword <SortIndicator field="keyword" />
                </th>
                {/* Intent */}
                <th className="text-left pb-2 pr-3 text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--rtm-text-muted)" }}>
                  Intent
                </th>
                {/* Current position */}
                <th
                  className="text-left pb-2 pr-3 text-[11px] font-bold uppercase tracking-widest cursor-pointer select-none"
                  style={{ color: "var(--rtm-text-muted)" }}
                  onClick={() => handleSort("position")}
                >
                  Position <SortIndicator field="position" />
                </th>
                {/* Change */}
                <th
                  className="text-left pb-2 pr-3 text-[11px] font-bold uppercase tracking-widest cursor-pointer select-none"
                  style={{ color: "var(--rtm-text-muted)" }}
                  onClick={() => handleSort("change")}
                >
                  Change <SortIndicator field="change" />
                </th>
                {/* Volume */}
                <th
                  className="text-left pb-2 pr-3 text-[11px] font-bold uppercase tracking-widest cursor-pointer select-none"
                  style={{ color: "var(--rtm-text-muted)" }}
                  onClick={() => handleSort("volume")}
                >
                  Vol/mo <SortIndicator field="volume" />
                </th>
                {/* Ranking URL */}
                <th className="text-left pb-2 pr-3 text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--rtm-text-muted)", minWidth: 180 }}>
                  Ranking URL
                </th>
                {/* Sparkline */}
                <th className="text-left pb-2 text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--rtm-text-muted)" }}>
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((kw, idx) => {
                const { bg, color } = positionTier(kw.currentPosition);
                const isExpanded = expandedId === kw.id;

                return (
                  <>
                    <tr
                      key={kw.id}
                      onClick={() => setExpandedId(isExpanded ? null : kw.id)}
                      className="cursor-pointer transition-colors group"
                      style={{
                        borderBottom: "1px solid var(--rtm-border-light)",
                        background: isExpanded ? "var(--rtm-blue-xlight)" : "transparent",
                      }}
                    >
                      {/* Keyword cell */}
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-1.5">
                          {/* Expand chevron */}
                          <span
                            className="text-[10px] transition-transform"
                            style={{
                              color: "var(--rtm-text-muted)",
                              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                              display: "inline-block",
                            }}
                          >
                            ▶
                          </span>
                          <span className="font-medium leading-snug"
                            style={{ color: isExpanded ? ACCENT : "var(--rtm-text-primary)" }}>
                            {kw.keyword}
                          </span>
                        </div>
                      </td>

                      {/* Intent */}
                      <td className="py-2.5 pr-3">
                        <IntentBadge intent={kw.intent} />
                      </td>

                      {/* Current position */}
                      <td className="py-2.5 pr-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                          style={{ background: bg, color }}
                        >
                          #{kw.currentPosition}
                        </span>
                      </td>

                      {/* Change */}
                      <td className="py-2.5 pr-3">
                        <ChangeBadge change={kw.windowChange} />
                      </td>

                      {/* Search volume */}
                      <td className="py-2.5 pr-3 font-mono text-xs"
                        style={{ color: "var(--rtm-text-secondary)" }}>
                        {fmtVol(kw.searchVolume)}
                      </td>

                      {/* Ranking URL */}
                      <td className="py-2.5 pr-3">
                        <span
                          className="text-xs font-mono truncate block max-w-[200px]"
                          style={{ color: "var(--rtm-text-muted)" }}
                          title={`${client.domain}${kw.rankingUrl}`}
                        >
                          {kw.rankingUrl}
                        </span>
                      </td>

                      {/* Sparkline */}
                      <td className="py-2.5">
                        <Sparkline
                          data={kw.slicedWeeks.map((w) => w.position)}
                          invertY
                          color={ACCENT}
                        />
                      </td>
                    </tr>

                    {/* ── Expanded detail row ──────────────────────────── */}
                    {isExpanded && expandedKw && expandedKw.id === kw.id && (
                      <tr key={`${kw.id}-detail`}>
                        <td colSpan={7} style={{ padding: 0 }}>
                          <div
                            className="mx-0 mb-1 rounded-xl border p-5 space-y-4"
                            style={{
                              background: "var(--rtm-surface)",
                              borderColor: "var(--rtm-border)",
                              borderTop: `3px solid ${ACCENT}`,
                            }}
                          >
                            {/* Detail header */}
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest mb-1"
                                  style={{ color: ACCENT }}>
                                  Keyword Detail
                                </p>
                                <h3 className="text-lg font-bold"
                                  style={{ color: "var(--rtm-text-primary)" }}>
                                  {expandedKw.keyword}
                                </h3>
                                <p className="text-xs mt-0.5"
                                  style={{ color: "var(--rtm-text-muted)" }}>
                                  {client.domain}{expandedKw.rankingUrl}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2 items-center">
                                <IntentBadge intent={expandedKw.intent} />
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                                  style={{ ...positionTier(expandedKw.currentPosition) }}
                                >
                                  #{expandedKw.currentPosition} current
                                </span>
                                <ChangeBadge change={expandedKw.windowChange} />
                                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                  style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}>
                                  {fmtVol(expandedKw.searchVolume)}/mo est.
                                </span>
                              </div>
                            </div>

                            {/* Detail KPI row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {[
                                {
                                  label: "Best Position",
                                  value: `#${Math.min(...expandedKw.weeks.map((w) => w.position))}`,
                                  color: "#059669",
                                },
                                {
                                  label: "Worst Position",
                                  value: `#${Math.max(...expandedKw.weeks.map((w) => w.position))}`,
                                  color: "#DC2626",
                                },
                                {
                                  label: "Avg Position (13wk)",
                                  value: `#${
                                    Math.round(
                                      (expandedKw.weeks.reduce((s, w) => s + w.position, 0) /
                                        expandedKw.weeks.length) * 10
                                    ) / 10
                                  }`,
                                  color: ACCENT,
                                },
                                {
                                  label: "Weeks Tracked",
                                  value: expandedKw.weeks.length,
                                  color: "var(--rtm-text-primary)",
                                },
                              ].map(({ label, value, color }) => (
                                <div key={label} className="rounded-lg border p-3"
                                  style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
                                  <p className="text-[10px] font-bold uppercase tracking-widest"
                                    style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                                  <p className="text-lg font-bold mt-0.5" style={{ color }}>
                                    {value}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Full rank history chart */}
                            <div>
                              <p className="text-xs font-semibold mb-2"
                                style={{ color: "var(--rtm-text-secondary)" }}>
                                Full 13-week rank history (lower position = better ranking)
                              </p>
                              <div className="rounded-xl border p-4"
                                style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
                                <DetailChart weeks={expandedKw.weeks} accentColor={ACCENT} height={160} />
                                <p className="text-center text-[10px] mt-2"
                                  style={{ color: "var(--rtm-text-muted)" }}>
                                  Y-axis = keyword position (#1 = top result). Lower position number = better ranking.
                                  All figures are illustrative representative data.
                                </p>
                              </div>
                            </div>

                            {/* Weekly data table */}
                            <div>
                              <p className="text-xs font-semibold mb-2"
                                style={{ color: "var(--rtm-text-secondary)" }}>
                                Weekly position breakdown
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {expandedKw.weeks.map((w) => {
                                  const { bg, color } = positionTier(w.position);
                                  return (
                                    <div key={w.week}
                                      className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg border"
                                      style={{ background: bg, borderColor: color + "40", minWidth: 38 }}>
                                      <span className="text-[9px] font-bold"
                                        style={{ color: "var(--rtm-text-muted)" }}>{w.week}</span>
                                      <span className="text-[11px] font-bold" style={{ color }}>
                                        #{w.position}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Close button */}
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                                className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors"
                                style={{
                                  background: "var(--rtm-surface)",
                                  borderColor: "var(--rtm-border)",
                                  color: "var(--rtm-text-secondary)",
                                }}
                              >
                                Close detail ↑
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}

              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm"
                    style={{ color: "var(--rtm-text-muted)" }}>
                    No keywords match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-[10px] mt-3" style={{ color: "var(--rtm-text-muted)" }}>
          Click any row to expand the keyword's full rank history and detailed chart.
          Sort by any column header. All figures are representative/illustrative — not live data.
          Lower position number = higher ranking.
        </p>
      </SectionWrapper>

      {/* ── Footer nav ───────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        <Link href={workspace.dashboardRoute}
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          ← Overview
        </Link>
        <Link href="/seo-local/organic-performance"
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          Organic Performance →
        </Link>
        <Link href="/seo-local/performance"
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          Local Performance →
        </Link>
        <Link href="/seo-local/clients"
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          Clients →
        </Link>
        <Link href={workspace.tasksRoute}
          className="rtm-btn-primary text-sm inline-flex items-center gap-1">
          Tasks →
        </Link>
      </div>
    </div>
  );
}
