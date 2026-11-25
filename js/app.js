// ============================================================
// PigFit - App
// ============================================================

import {
    loadData,
    saveData,
    resetData,
    subscribeToData
} from "./storage.js";


import {
    updatePigWeight,
    getPigStatus,
    normalizePigWeight
} from "./pig.js";


import {
    submitWorkout,
    getWeeklyWorkoutCount,
    getTodayString,
    getYesterdayString,
    WEEKLY_GOAL_PER_PERSON
} from "./workout.js";


// ============================================================
// DOM Elements
// ============================================================

const pigWeightElement = document.getElementById("pigWeight");
const pigMessageElement = document.getElementById("pigMessage");
const meterFillElement = document.getElementById("meterFill");

const bodyStatusElement = document.getElementById("bodyStatus");
const winnieStatusElement = document.getElementById("winnieStatus");
const jackStatusElement = document.getElementById("jackStatus");

const winnieExerciseButton = document.getElementById("winnieExerciseButton");
const jackExerciseButton = document.getElementById("jackExerciseButton");
const resetButton = document.getElementById("resetButton");
const winnieBackfillButton = document.getElementById("winnieBackfillButton");
const jackBackfillButton = document.getElementById("jackBackfillButton");

const dayCountElement = document.getElementById("dayCount");

const pigSpriteElement = document.querySelector(".pig-sprite");

// ============================================================
// Game Data
// ============================================================

let data = await loadData();


// ============================================================
// Day Count
// ============================================================

function getDayDifference(
    fromTimestamp,
    toTimestamp
) {
    const from =
        new Date(fromTimestamp);

    const to =
        new Date(toTimestamp);

    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    return Math.floor(
        (to - from) /
        millisecondsPerDay
    );
}


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
// Pig UI
// ============================================================

function updatePigUI() {
    const status = getPigStatus(data.weight);

    if (pigSpriteElement) {
        pigSpriteElement.className =`pig-sprite ${status.sprite}`;
    }

    if (pigWeightElement) {
        pigWeightElement.textContent = data.weight.toFixed(2);
    }

    if (meterFillElement) {
        meterFillElement.style.width = `${status.meter}%`;
    }

    if (bodyStatusElement) {
        bodyStatusElement.textContent = status.label;
    }
}


// ============================================================
// Workout UI
// ============================================================

function hasRewardedWorkoutOnDate(user, date) {
    const dateField = user === "winnie"
        ? "winnieWorkoutDate"
        : "jackWorkoutDate";

    return data[dateField] === date || data.workouts.some(workout =>
        workout.user === user &&
        workout.date === date &&
        workout.rewarded !== false
    );
}


function updateBackfillButtons() {
    const yesterday = getYesterdayString();

    [
        [winnieBackfillButton, "winnie"],
        [jackBackfillButton, "jack"]
    ].forEach(([button, user]) => {
        if (!button) return;

        const alreadyDone = hasRewardedWorkoutOnDate(user, yesterday);
        button.disabled = alreadyDone;
        button.textContent = alreadyDone ? "昨天已補登 ✓" : "補登昨天";
    });
}


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
            "Winnie 和 Jack 都好棒❤️寶哩寶哩!!";

        return;
    }


    if (winnieDone) {
        pigMessageElement.textContent =
            "Winnie 好棒！Jack 換你了！";

        return;
    }


    if (jackDone) {
        pigMessageElement.textContent =
            "Jack 好棒！Winnie 換你了！";

        return;
    }


    const status =
        getPigStatus(
            data.weight
        );

    pigMessageElement.textContent =
        status.message;
}


// ============================================================
// Update UI
// ============================================================

function updateUI() {
    updatePigUI();

    updateWorkoutStatus();

    updateBackfillButtons();

    updateDayCount();

    updateMessage();


    console.log(
        "Pig weight:",
        data.weight.toFixed(6),
        "kg"
    );

    console.log(
        `Winnie weekly: ${getWeeklyWorkoutCount(data, "winnie")}/${WEEKLY_GOAL_PER_PERSON}`
    );

    console.log(
        `Jack weekly: ${getWeeklyWorkoutCount(data, "jack")}/${WEEKLY_GOAL_PER_PERSON}`
    );
}


// ============================================================
// Handle Workout
// ============================================================

async function handleWorkout(user) {
    updatePigWeight(data);

    const result = submitWorkout(data, user);

    normalizePigWeight(data);

    await saveData(data);

    updateUI();

    if (result.alreadyRewardedToday) {
        const displayName = user === "winnie" ? "Winnie" : "Jack";
        pigMessageElement.textContent = `${displayName} 今天已經運動過啦！`;
    }
}


async function handleBackfillWorkout(user) {
    const yesterday = getYesterdayString();
    const displayName = user === "winnie" ? "Winnie" : "Jack";

    if (hasRewardedWorkoutOnDate(user, yesterday)) {
        alert(`${displayName} 昨天已經補登過囉！`);
        return;
    }

    const confirmed = confirm(
        `確定補登 ${displayName} 昨天（${yesterday}）的運動嗎？\n將新增運動紀錄並扣除 0.5 kg。`
    );

    if (!confirmed) return;

    updatePigWeight(data);
    const result = submitWorkout(data, user, yesterday);
    normalizePigWeight(data);

    if (result.alreadyRewarded) {
        alert(`${displayName} 昨天已經獲得運動獎勵，沒有重複扣重。`);
    }

    await saveData(data);
    updateUI();
}


// ============================================================
// Buttons
// ============================================================

if (winnieExerciseButton) {
    winnieExerciseButton.addEventListener(
        "click",
        () => {
            handleWorkout(
                "winnie"
            );
        }
    );
}


if (jackExerciseButton) {
    jackExerciseButton.addEventListener(
        "click",
        () => {
            handleWorkout(
                "jack"
            );
        }
    );
}


if (winnieBackfillButton) {
    winnieBackfillButton.addEventListener("click", () => {
        handleBackfillWorkout("winnie");
    });
}

if (jackBackfillButton) {
    jackBackfillButton.addEventListener("click", () => {
        handleBackfillWorkout("jack");
    });
}


// ============================================================
// Reset
// ============================================================

if (resetButton) {
    resetButton.addEventListener("click", async () => {
        const confirmed = confirm("確定要重置 PigFit 嗎？所有運動紀錄都會消失。");

        if (!confirmed) {
            return;
        }

        data = await resetData();
        updateUI();
    });
}


// ============================================================
// Real-time Pig Weight
// ============================================================

setInterval(() => {
    updatePigWeight(data);
    updateUI();
}, 1000);

setInterval(() => {
    saveData(data);
}, 20000);

// ============================================================
// Initialize PigFit
// ============================================================

// Calculate weight gained while website
// was closed.

updatePigWeight(data);

await saveData(data);

updateUI();

subscribeToData(remoteData => {
    data = remoteData;
    updateUI();
});