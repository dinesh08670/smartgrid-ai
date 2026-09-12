// ==========================================
// SMARTGRID AI - PROTOTYPE CONTROLLER
// ==========================================

let peakMode = false;

const state = {
    solar: 86,
    demand: 72,
    battery: 78,
    stability: 98,
    renewable: 91
};


// ==========================================
// DOM ELEMENTS
// ==========================================

const solarValue = document.getElementById("solarValue");
const demandValue = document.getElementById("demandValue");
const batteryValue = document.getElementById("batteryValue");
const stabilityValue = document.getElementById("stabilityValue");

const batteryProgress =
    document.getElementById("batteryProgress");

const renewableValue =
    document.getElementById("renewableValue");

const sdgRenewable =
    document.getElementById("sdgRenewable");

const flowSolar =
    document.getElementById("flowSolar");

const flowBattery =
    document.getElementById("flowBattery");

const flowDemand =
    document.getElementById("flowDemand");

const alertBox =
    document.getElementById("alertBox");

const peakButton =
    document.getElementById("peakButton");

const aiTitle =
    document.getElementById("aiTitle");

const aiDescription =
    document.getElementById("aiDescription");

const batteryRecommendation =
    document.getElementById("batteryRecommendation");

const batteryRecommendationText =
    document.getElementById("batteryRecommendationText");

const demandTrend =
    document.getElementById("demandTrend");

const alertStability =
    document.getElementById("alertStability");


// ==========================================
// CHART
// ==========================================

const normalSolar = [
    0,
    0,
    0,
    12,
    38,
    72,
    94,
    88,
    64,
    28,
    5,
    0
];

const normalDemand = [
    42,
    35,
    30,
    48,
    62,
    68,
    74,
    70,
    67,
    92,
    105,
    76
];

const peakDemand = [
    42,
    35,
    30,
    48,
    62,
    68,
    74,
    70,
    67,
    120,
    132,
    90
];

const labels = [
    "00:00",
    "02:00",
    "04:00",
    "06:00",
    "08:00",
    "10:00",
    "12:00",
    "14:00",
    "16:00",
    "18:00",
    "20:00",
    "22:00"
];


const ctx =
    document.getElementById("energyChart").getContext("2d");


const solarGradient =
    ctx.createLinearGradient(0, 0, 0, 280);

solarGradient.addColorStop(
    0,
    "rgba(250,204,21,.25)"
);

solarGradient.addColorStop(
    1,
    "rgba(250,204,21,0)"
);


const demandGradient =
    ctx.createLinearGradient(0, 0, 0, 280);

demandGradient.addColorStop(
    0,
    "rgba(56,189,248,.18)"
);

demandGradient.addColorStop(
    1,
    "rgba(56,189,248,0)"
);


const energyChart =
    new Chart(ctx, {

        type: "line",

        data: {

            labels: labels,

            datasets: [

                {
                    label: "Solar",
                    data: normalSolar,

                    borderColor: "#facc15",

                    backgroundColor: solarGradient,

                    fill: true,

                    tension: .4,

                    borderWidth: 2.5,

                    pointRadius: 0,

                    pointHoverRadius: 5
                },

                {
                    label: "Demand",
                    data: normalDemand,

                    borderColor: "#38bdf8",

                    backgroundColor: demandGradient,

                    fill: true,

                    tension: .4,

                    borderWidth: 2.5,

                    pointRadius: 0,

                    pointHoverRadius: 5
                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {
                intersect: false,
                mode: "index"
            },

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    backgroundColor: "#111827",

                    borderColor: "#26334a",

                    borderWidth: 1,

                    titleColor: "#ffffff",

                    bodyColor: "#94a3b8",

                    padding: 10

                }

            },

            scales: {

                x: {

                    grid: {
                        display: false
                    },

                    ticks: {
                        color: "#64748b",
                        font: {
                            size: 8
                        }
                    }
                },

                y: {

                    beginAtZero: true,

                    grid: {
                        color: "#1e293b"
                    },

                    ticks: {
                        color: "#64748b",
                        font: {
                            size: 8
                        }
                    }
                }

            }

        }

    });


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {

    solarValue.textContent =
        Math.round(state.solar);

    demandValue.textContent =
        Math.round(state.demand);

    batteryValue.textContent =
        Math.round(state.battery);

    stabilityValue.textContent =
        Math.round(state.stability);

    renewableValue.textContent =
        Math.round(state.renewable);

    sdgRenewable.textContent =
        Math.round(state.renewable) + "%";

    batteryProgress.style.width =
        state.battery + "%";

    flowSolar.textContent =
        Math.round(state.solar) + " kW";

    flowBattery.textContent =
        Math.round(state.battery) + "%";

    flowDemand.textContent =
        Math.round(state.demand) + " kW";

}


// ==========================================
// NORMAL SYSTEM
// ==========================================

function normalSystem() {

    peakMode = false;

    state.solar = 86;
    state.demand = 72;
    state.battery = 78;
    state.stability = 98;
    state.renewable = 91;


    alertBox.classList.add("hidden");


    peakButton.classList.remove("active");

    peakButton.innerHTML =
        `<i class="fa-solid fa-triangle-exclamation"></i>
         Simulate Peak Demand`;


    aiTitle.textContent =
        "System operating efficiently";


    aiDescription.textContent =
        "Renewable generation is sufficient for current demand. Battery reserves are being optimized for evening usage.";


    batteryRecommendation.textContent =
        "Reserve battery";


    batteryRecommendationText.textContent =
        "Keep 20% reserve for evening peak";


    demandTrend.className =
        "trend down";

    demandTrend.innerHTML =
        `<i class="fa-solid fa-arrow-down"></i>
         3.2%`;


    energyChart.data.datasets[1].data =
        normalDemand;

    energyChart.update();


    updateDashboard();

}


// ==========================================
// PEAK DEMAND SIMULATION
// ==========================================

function activatePeakMode() {

    peakMode = true;


    // Simulated emergency conditions

    state.solar = 31;
    state.demand = 118;
    state.battery = 52;
    state.stability = 94;
    state.renewable = 67;


    alertBox.classList.remove("hidden");


    alertStability.textContent =
        state.stability + "%";


    peakButton.classList.add("active");

    peakButton.innerHTML =
        `<i class="fa-solid fa-rotate-left"></i>
         Reset System`;


    aiTitle.textContent =
        "Peak demand successfully managed";


    aiDescription.textContent =
        "AI has activated battery support, load shifting and community P2P energy matching to maintain grid stability.";


    batteryRecommendation.textContent =
        "Discharge battery";


    batteryRecommendationText.textContent =
        "25 kW available for peak support";


    demandTrend.className =
        "trend down
