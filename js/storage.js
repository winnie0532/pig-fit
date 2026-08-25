// ============================================================
// PigFit - Storage
// ============================================================

import { db } from "./firebase.js";
import {
    doc,
    getDoc,
    onSnapshot,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export const DEFAULT_WEIGHT = 10;

const PIG_DOCUMENT = doc(db, "pigfit", "sharedPig");


// ============================================================
// Default Data
// ============================================================

export function createDefaultData() {
    const now = Date.now();

    return {
        weight: DEFAULT_WEIGHT,
        createdAt: now,
        lastUpdatedAt: now,
        winnieWorkoutDate: null,
        jackWorkoutDate: null,
        workouts: []
    };
}

function normalizeSavedData(savedData) {
    const now = Date.now();

    return {
        weight:
            typeof savedData.weight === "number"
                ? savedData.weight
                : DEFAULT_WEIGHT,

        createdAt:
            savedData.createdAt || now,

        lastUpdatedAt:
            savedData.lastUpdatedAt || now,

        winnieWorkoutDate:
            savedData.winnieWorkoutDate || null,

        jackWorkoutDate:
            savedData.jackWorkoutDate || null,

        workouts:
            Array.isArray(savedData.workouts)
                ? savedData.workouts
                : []
    };
}
// ============================================================
// Load
// ============================================================

export async function loadData() {
    try {
        const snapshot = await getDoc(PIG_DOCUMENT);

        if (!snapshot.exists()) {
            const newData = createDefaultData();
            await saveData(newData);
            return newData;
        }

        return normalizeSavedData(snapshot.data());

    } catch (error) {
        console.error("Failed to load PigFit data:", error);
        return createDefaultData();
    }
}

export function subscribeToData(onDataChanged) {
    return onSnapshot(
        PIG_DOCUMENT,

        snapshot => {
            if (!snapshot.exists()) {
                return;
            }

            onDataChanged(
                normalizeSavedData(snapshot.data())
            );
        },

        error => {
            console.error(
                "Failed to sync PigFit data:",
                error
            );
        }
    );
}
// ============================================================
// Save
// ============================================================

export async function saveData(data) {
    try {
        await setDoc(PIG_DOCUMENT, data);
    } catch (error) {
        console.error("Failed to save PigFit data:", error);
    }
}


// ============================================================
// Reset
// ============================================================

export async function resetData() {
    const newData = createDefaultData();

    await saveData(newData);

    return newData;
}