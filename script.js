(() => {
  "use strict";

  // ==============================
  // SmartGrid AI - Application State
  // ==============================

  const normal = {
    solar: 86,
    demand: 72,
    battery: 78,
    stability: 98,
    renewable: 91
  };

  const peak = {
    solar: 31,
    demand: 118,
    battery: 52,
    stability: 94,
    renewable: 67
  };

  let peakMode = false;

  // ==============================
  // Forecast Data
  // ==============================

  const charts = {
    normalSolar: [0, 0, 0, 12, 38, 72, 94, 88, 64, 28, 5, 0],
    normalDemand: [42, 35, 30, 48, 62, 68, 74, 70, 67, 92, 105, 76],
    peakDemand: [42, 35, 30, 48, 62, 68, 74, 70, 67, 120, 132, 90]
  };

  // ==============================
  // Helper
  // ==============================

  const $ = (id) => document.getElementById(id);

  // ==============================
  // DOM Elements
  // ==============================

  const els = {
    solar: $("solarValue"),
    demand: $("demandValue"),
    battery: $("batteryValue"),
    stability: $("stabilityValue"),

    renewable: $("renewableValue"),
    sdgRenewable: $("sdgRenewable"),
    sdgStability: $("sdgStability"),

    batteryProgress: $("batteryProgress"),

    flowSolar: $("flowSolar"),
    flowBattery: $("flowBattery"),
    flowDemand: $("flowDemand"),

    alertBanner: $("alertBanner"),
    alertStability: $("alertStability"),

    simulationBtn: $("simulationBtn"),
    simulationLabel: $("simulationLabel"),
    systemState: $("systemState"),

    aiTitle: $("aiTitle"),
    aiDescription: $("aiDescription"),

    batteryRecommendation: $("batteryRecommendation"),
    batteryRecommendationText: $("batteryRecommendationText"),

    p2pText: $("p2pText"),

    demandChange: $("demandChange"),

    solarLine: $("solarLine"),
    demandLine: $("demandLine"),

    solarArea: $("solarArea"),
    demandArea: $("demandArea"),

    solarPoint: $("solarPoint"),
    demandPoint: $("demandPoint"),

    clock: $("systemClock")
  };

  // ==============================
  // Utility Functions
  // ==============================

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function setMetric(element, value) {
    if (element) {
      element.textContent = Math.round(value);
    }
  }

  // ==============================
  // Update Dashboard
  // ==============================

  function updateDashboard(data) {
    setMetric(els.solar, data.solar);
    setMetric(els.demand, data.demand);
    setMetric(els.battery, data.battery);
    setMetric(els.stability, data.stability);

    setMetric(els.renewable, data.renewable);
    setMetric(els.sdgRenewable, data.renewable);
    setMetric(els.sdgStability, data.stability);

    // Battery progress bar
    if (els.batteryProgress) {
      els.batteryProgress.style.width =
        `${clamp(data.battery, 0, 100)}%`;
    }

    // Live energy flow
    if (els.flowSolar) {
      els.flowSolar.textContent =
        `${Math.round(data.solar)} kW`;
    }

    if (els.flowBattery) {
      els.flowBattery.textContent =
        `${Math.round(data.battery)}%`;
    }

    if (els.flowDemand) {
      els.flowDemand.textContent =
        `${Math.round(data.demand)} kW`;
    }

    // Demand comparison
    if (els.demandChange) {
      els.demandChange.innerHTML = peakMode
        ? "<span>↗</span> 63.9% vs. baseline"
        : "<span>↘</span> 3.2% vs. baseline";

      els.demandChange.className =
        `metric-footer ${peakMode ? "negative" : "positive"}`;
    }
  }

  // ==============================
  // SVG Chart Helpers
  // ==============================

  function pointsFor(
    values,
    width = 960,
    height = 268,
    max = 140
  ) {
    const left = 0;
    const top = 20;
    const bottom = 20;

    const usableHeight =
      height - top - bottom;

    const step =
      width / (values.length - 1);

    return values.map((value, index) => {
      const x =
        left + index * step;

      const y =
        top +
        (1 - value / max) *
          usableHeight;

      return [
        Number(x.toFixed(2)),
        Number(y.toFixed(2))
      ];
    });
  }

  function polyline(points) {
    return points
      .map(([x, y]) => `${x},${y}`)
      .join(" ");
  }

  function areaPath(
    points,
    width = 960,
    baseY = 288
  ) {
    const start = points[0];
    const end = points[points.length - 1];

    return (
      `M ${start[0]} ${baseY} ` +
      `L ${polyline(points)
        .replace(/ /g, " L ")} ` +
      `L ${end[0]} ${baseY} Z`
    );
  }

  // ==============================
  // Render Forecast Chart
  // ==============================

  function renderChart() {
    if (
      !els.solarLine ||
      !els.demandLine
    ) {
      return;
    }

    const solar =
      charts.normalSolar;

    const demand =
      peakMode
        ? charts.peakDemand
        : charts.normalDemand;

    const solarPoints =
      pointsFor(solar);

    const demandPoints =
      pointsFor(demand);

    // Lines
    els.solarLine.setAttribute(
      "points",
      polyline(solarPoints)
    );

    els.demandLine.setAttribute(
      "points",
      polyline(demandPoints)
    );

    // Filled areas
    if (els.solarArea) {
      els.solarArea.setAttribute(
        "d",
        areaPath(solarPoints)
      );
    }

    if (els.demandArea) {
      els.demandArea.setAttribute(
        "d",
        areaPath(demandPoints)
      );
    }

    // Find highest points
    const solarPeakIndex =
      solar.indexOf(
        Math.max(...solar)
      );

    const demandPeakIndex =
      demand.indexOf(
        Math.max(...demand)
      );

    const solarPeak =
      solarPoints[solarPeakIndex];

    const demandPeak =
      demandPoints[demandPeakIndex];

    // Position markers
    if (els.solarPoint) {
      els.solarPoint.setAttribute(
        "cx",
        solarPeak[0]
      );

      els.solarPoint.setAttribute(
        "cy",
        solarPeak[1]
      );
    }

    if (els.demandPoint) {
      els.demandPoint.setAttribute(
        "cx",
        demandPeak[0]
      );

      els.demandPoint.setAttribute(
        "cy",
        demandPeak[1]
      );
    }
  }

  // ==============================
  // Normal / Peak Mode
  // ==============================

  function applyMode() {
    const data =
      peakMode ? peak : normal;

    updateDashboard(data);
    renderChart();

    if (peakMode) {

      // Show alert
      if (els.alertBanner) {
        els.alertBanner.classList.remove(
          "hidden"
        );
      }

      if (els.alertStability) {
        els.alertStability.textContent =
          `${data.stability}%`;
      }

      // Button
      if (els.simulationBtn) {
        els.simulationBtn.classList.add(
          "active"
        );

        els.simulationBtn.setAttribute(
          "aria-pressed",
          "true"
        );
      }

      if (els.simulationLabel) {
        els.simulationLabel.textContent =
          "Reset system";
      }

      // System status
      if (els.systemState) {
        els.systemState.textContent =
          "PEAK RESPONSE ACTIVE";
      }

      // AI Advisor
      if (els.aiTitle) {
        els.aiTitle.textContent =
          "Peak demand successfully managed";
      }

      if (els.aiDescription) {
        els.aiDescription.textContent =
          "AI has activated battery support, load shifting and community P2P matching to maintain grid stability.";
      }

      // Battery recommendation
      if (els.batteryRecommendation) {
        els.batteryRecommendation.textContent =
          "Discharge battery";
      }

      if (els.batteryRecommendationText) {
        els.batteryRecommendationText.textContent =
          "25 kW available for peak support";
      }

      // P2P
      if (els.p2pText) {
        els.p2pText.textContent =
          "12 households can provide surplus energy";
      }

    } else {

      // Hide alert
      if (els.alertBanner) {
        els.alertBanner.classList.add(
          "hidden"
        );
      }

      // Button
      if (els.simulationBtn) {
        els.simulationBtn.classList.remove(
          "active"
        );

        els.simulationBtn.setAttribute(
          "aria-pressed",
          "false"
        );
      }

      if (els.simulationLabel) {
        els.simulationLabel.textContent =
          "Simulate peak";
      }

      // System status
      if (els.systemState) {
        els.systemState.textContent =
          "SYSTEM ONLINE";
      }

      // AI Advisor
      if (els.aiTitle) {
        els.aiTitle.textContent =
          "System operating efficiently";
      }

      if (els.aiDescription) {
        els.aiDescription.textContent =
          "Renewable generation is sufficient for current demand. Battery reserves are being optimized for evening usage.";
      }

      // Battery recommendation
      if (els.batteryRecommendation) {
        els.batteryRecommendation.textContent =
          "Reserve battery";
      }

      if (els.batteryRecommendationText) {
        els.batteryRecommendationText.textContent =
          "Keep 20% reserve for evening peak";
      }

      // P2P
      if (els.p2pText) {
        els.p2pText.textContent =
          "6 households have surplus energy";
      }
    }
  }

  // ==============================
  // Toggle Peak Simulation
  // ==============================

  function toggleSimulation() {
    peakMode = !peakMode;

    applyMode();
  }

  // ==============================
  // Live Clock
  // ==============================

  function updateClock() {
    if (!els.clock) {
      return;
    }

    const now = new Date();

    els.clock.textContent =
      new Intl.DateTimeFormat(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        }
      ).format(now);
  }

  // ==============================
  // Simulated Live Telemetry
  // ==============================

  function simulateTelemetry() {

    // Don't change values during
    // peak-demand demonstration.
    if (peakMode) {
      return;
    }

    const drift =
      (value, amount) =>
        value +
        (Math.random() - 0.5) *
          amount;

    const live = {

      solar: clamp(
        drift(normal.solar, 2.4),
        82,
        90
      ),

      demand: clamp(
        drift(normal.demand, 2.8),
        68,
        76
      ),

      battery: clamp(
        drift(normal.battery, 0.5),
        76,
        80
      ),

      stability: clamp(
        drift(normal.stability, 0.2),
        97,
        99
      ),

      renewable: clamp(
        drift(normal.renewable, 0.4),
        89,
        93
      )
    };

    updateDashboard(live);
  }

  // ==============================
  // Event Listeners
  // ==============================

  if (els.simulationBtn) {
    els.simulationBtn.addEventListener(
      "click",
      toggleSimulation
    );
  }

  // ==============================
  // Initial Load
  // ==============================

  updateClock();
  applyMode();

  // Update clock every second
  window.setInterval(
    updateClock,
    1000
  );

  // Simulate telemetry every 3.5 seconds
  window.setInterval(
    simulateTelemetry,
    3500
  );

})();
