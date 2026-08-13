// ============================================================
// PigFit V1
// ============================================================

// ------------------------------------------------------------
// Game Settings
// ------------------------------------------------------------

const DEFAULT_WEIGHT = 10;

// Pig gains 0.005 kg every hour
const WEIGHT_GAIN_PER_HOUR = 0.005;

// First workout of the day for each person
const WORKOUT_LOSS = 0.15;

// Weekly workout goal for each person
const WEEKLY_GOAL_PER_PERSON = 3;

// localStorage key
const STORAGE_KEY = "pigFitData";


// ============================================================
// DOM Elements
// ============================================================

const pigWeightElement = document.getElementById("pigWeight");
const pigElement = document.getElementById("pig");
const pigMessageElement = document.getElementById("pigMessage");

const meterFillElement = document.getElementById("meterFill");
const bodyStatusElement = document.getElementById("bodyStatus");

const winnieStatusElement = document.getElementById("winnieStatus");
const jackStatusElement = document.getElementById("jackStatus");

const winnieExerciseButton =
    document.getElementById("winnieExerciseButton");

const jackExerciseButton =
    document.getElementById("jackExerciseButton");

const resetButton =
    document.getElementById("resetButton");

const dayCountElement =
    document.getElementById("dayCount");


// ============================================================
// Time Helpers
// ============================================================

function getTodayString() {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getStartOfWeek(date = new Date()) {

    const result = new Date(date);

    const day = result.getDay();

    // Monday = first day of week
    const difference =
        day === 0
            ? -6
            : 1 - day;

    result.setDate(
        result.getDate() + difference
    );

    result.setHours(0, 0, 0, 0);

    return result;
}


function getDayDifference(fromTimestamp, toTimestamp) {

    const from = new Date(fromTimestamp);
    const to = new Date(toTimestamp);

    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    return Math.floor(
        (to - from) / millisecondsPerDay
    );
}


// ============================================================
// Default Data
// ============================================================

function createDefaultData() {

    const now = Date.now();

    return {

        weight: DEFAULT_WEIGHT,

        createdAt: now,

        // Used to calculate how much weight the pig
        // gained while the website was closed
        lastUpdatedAt: now,

        // Last rewarded workout date
        winnieWorkoutDate: null,
        jackWorkoutDate: null,

        // Workout history
        workouts: []
    };
}


// ============================================================
// localStorage
// ============================================================

function loadData() {

    const savedData =
        localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
        return createDefaultData();
    }

    try {

        const parsedData =
            JSON.parse(savedData);

        // Compatibility / missing field protection
        return {

            weight:
                typeof parsedData.weight === "number"
                    ? parsedData.weight
                    : DEFAULT_WEIGHT,

            createdAt:
                parsedData.createdAt ||
                Date.now(),

            lastUpdatedAt:
                parsedData.lastUpdatedAt ||
                Date.now(),

            winnieWorkoutDate:
                parsedData.winnieWorkoutDate ||
                null,

            jackWorkoutDate:
                parsedData.jackWorkoutDate ||
                null,

            workouts:
                Array.isArray(parsedData.workouts)
                    ? parsedData.workouts
                    : []
        };

    } catch (error) {

        console.error(
            "Failed to load PigFit data:",
            error
        );

        return createDefaultData();
    }
}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}


// ============================================================
// Load Game
// ============================================================

let data = loadData();


// ============================================================
// Pig Weight
// ============================================================

function updatePigWeight() {

    const now = Date.now();

    const elapsedMilliseconds =
        now - data.lastUpdatedAt;

    // Prevent invalid / negative time
    if (elapsedMilliseconds <= 0) {
        return;
    }

    const elapsedHours =
        elapsedMilliseconds /
        (1000 * 60 * 60);

    const gainedWeight =
        elapsedHours *
        WEIGHT_GAIN_PER_HOUR;

    data.weight += gainedWeight;

    data.lastUpdatedAt = now;

    saveData();
}


// ============================================================
// Workout
// ============================================================

function submitWorkout(user) {

    // First update pig weight to this exact moment
    updatePigWeight();

    const today =
        getTodayString();

    let alreadyRewardedToday = false;


    // --------------------------------------------------------
    // Winnie
    // --------------------------------------------------------

    if (user === "winnie") {

        alreadyRewardedToday =
            data.winnieWorkoutDate === today;

        if (!alreadyRewardedToday) {

            data.weight -= WORKOUT_LOSS;

            data.winnieWorkoutDate =
                today;
        }
    }


    // --------------------------------------------------------
    // Jack
    // --------------------------------------------------------

    if (user === "jack") {

        alreadyRewardedToday =
            data.jackWorkoutDate === today;

        if (!alreadyRewardedToday) {

            data.weight -= WORKOUT_LOSS;

            data.jackWorkoutDate =
                today;
        }
    }


    // Pig cannot weigh less than 0
    data.weight =
        Math.max(0, data.weight);


    // --------------------------------------------------------
    // Save workout history
    // --------------------------------------------------------

    data.workouts.push({

        user: user,

        date: today,

        timestamp: Date.now(),

        rewarded:
            !alreadyRewardedToday
    });


    saveData();

    animatePig();

    updateUI();


    // --------------------------------------------------------
    // Message
    // --------------------------------------------------------

    if (alreadyRewardedToday) {

        const displayName =
            user === "winnie"
                ? "Winnie"
                : "Jack";

        pigMessageElement.textContent =
            `${displayName} 今天已經拿過減重獎勵了！`;

    }
}


// ============================================================
// Weekly Workout Count
// ============================================================

function getWeeklyWorkoutCount(user) {

    const weekStart =
        getStartOfWeek();

    return data.workouts.filter(
        workout => {

            if (workout.user !== user) {
                return false;
            }

            // Only rewarded workouts count toward
            // the weekly PigFit goal
            if (!workout.rewarded) {
                return false;
            }

            const workoutDate =
                new Date(workout.timestamp);

            return workoutDate >= weekStart;
        }
    ).length;
}


// ============================================================
// Pig Status
// ============================================================

function getPigStatus() {

    if (data.weight < 8) {

        return {
            label: "TOO SKINNY",
            scale: 0.80,
            meter: 10,
            message:
                "我已經太瘦了啦！"
        };
    }


    if (data.weight < 10) {

        return {
            label: "FIT",
            scale: 0.90,
            meter: 25,
            message:
                "我現在超 FIT！"
        };
    }


    if (data.weight < 12) {

        return {
            label: "HEALTHY",
            scale: 1.00,
            meter: 40,
            message:
                "目前體態很健康！"
        };
    }


    if (data.weight < 14) {

        return {
            label: "CHUBBY",
            scale: 1.10,
            meter: 60,
            message:
                "我好像開始圓起來了……"
        };
    }


    if (data.weight < 17) {

        return {
            label: "FAT",
            scale: 1.22,
            meter: 80,
            message:
                "你們是不是最近偷懶了！"
        };
    }


    return {
        label: "MEGA PIG",
        scale: 1.35,
        meter: 100,
        message:
            "救命！快去運動！！！"
    };
}


// ============================================================
// Pig Appearance
// ============================================================

function updatePigAppearance() {

    const status =
        getPigStatus();

    if (pigElement) {

        pigElement.style.setProperty(
            "--pig-scale",
            status.scale
        );

        pigElement.style.transform =
            `scale(${status.scale})`;
    }


    if (meterFillElement) {

        meterFillElement.style.width =
            `${status.meter}%`;
    }


    if (bodyStatusElement) {

        bodyStatusElement.textContent =
            status.label;
    }
}


// ============================================================
// Workout Status
// ============================================================

function updateWorkoutStatus() {

    const today =
        getTodayString();

    const winnieDone =
        data.winnieWorkoutDate === today;

    const jackDone =
        data.jackWorkoutDate === today;


    if (winnieStatusElement) {

        winnieStatusElement.textContent =
            winnieDone
                ? "DONE ✓"
                : "NOT YET";

        winnieStatusElement.classList.toggle(
            "done",
            winnieDone
        );
    }


    if (jackStatusElement) {

        jackStatusElement.textContent =
            jackDone
                ? "DONE ✓"
                : "NOT YET";

        jackStatusElement.classList.toggle(
            "done",
            jackDone
        );
    }
}


// ============================================================
// Day Count
// ============================================================

function updateDayCount() {

    if (!dayCountElement) {
        return;
    }

    const passedDays =
        getDayDifference(
            data.createdAt,
            Date.now()
        );

    dayCountElement.textContent =
        passedDays + 1;
}


// ============================================================
// Pig Message
// ============================================================

function updateMessage() {

    if (!pigMessageElement) {
        return;
    }

    const today =
        getTodayString();

    const winnieDone =
        data.winnieWorkoutDate === today;

    const jackDone =
        data.jackWorkoutDate === today;


    if (winnieDone && jackDone) {

        pigMessageElement.textContent =
            "Winnie 和 Jack 今天都有運動！我瘦了！";

        return;
    }


    if (winnieDone) {

        pigMessageElement.textContent =
            "Winnie 今天完成了！Jack 換你了！";

        return;
    }


    if (jackDone) {

        pigMessageElement.textContent =
            "Jack 今天完成了！Winnie 換你了！";

        return;
    }


    pigMessageElement.textContent =
        getPigStatus().message;
}


// ============================================================
// Animation
// ============================================================

function animatePig() {

    if (!pigElement) {
        return;
    }

    pigElement.classList.remove(
        "bounce"
    );

    // Force browser reflow so animation
    // can play again
    void pigElement.offsetWidth;

    pigElement.classList.add(
        "bounce"
    );
}


// ============================================================
// Update UI
// ============================================================

function updateUI() {

    if (pigWeightElement) {

        pigWeightElement.textContent =
            data.weight.toFixed(3);
    }


    updatePigAppearance();

    updateWorkoutStatus();

    updateDayCount();

    updateMessage();


    // For development
    console.log(
        "Pig weight:",
        data.weight.toFixed(6),
        "kg"
    );

    console.log(
        `Winnie weekly: ${getWeeklyWorkoutCount("winnie")}/${WEEKLY_GOAL_PER_PERSON}`
    );

    console.log(
        `Jack weekly: ${getWeeklyWorkoutCount("jack")}/${WEEKLY_GOAL_PER_PERSON}`
    );
}


// ============================================================
// Buttons
// ============================================================

if (winnieExerciseButton) {

    winnieExerciseButton.addEventListener(
        "click",
        () => {
            submitWorkout("winnie");
        }
    );
}


if (jackExerciseButton) {

    jackExerciseButton.addEventListener(
        "click",
        () => {
            submitWorkout("jack");
        }
    );
}


// ============================================================
// Reset
// ============================================================

if (resetButton) {

    resetButton.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "確定要重置 PigFit 嗎？所有運動紀錄都會消失。"
                );

            if (!confirmed) {
                return;
            }


            localStorage.removeItem(
                STORAGE_KEY
            );


            data =
                createDefaultData();


            saveData();

            updateUI();
        }
    );
}


// ============================================================
// Real-time Weight Update
// ============================================================

// Update according to actual elapsed time,
// rather than blindly adding 0.005 / 3600 every second.
//
// This also makes the calculation more reliable
// when the browser delays timers.

setInterval(
    () => {

        updatePigWeight();

        updateUI();

    },
    1000
);


// ============================================================
// Initialize PigFit
// ============================================================

// Calculate weight gained while the website
// was closed / refreshed.

updatePigWeight();

updateUI();