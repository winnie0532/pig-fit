// ============================================================
// PigFit - Storage
// ============================================================

export const STORAGE_KEY = "pigFitData";

export const DEFAULT_WEIGHT = 20;


// ============================================================
// Default Data
// ============================================================

export function createDefaultData() {
    const now = Date.now();

    return {
        weight: DEFAULT_WEIGHT,

        createdAt: now,

        // Last time pig weight was calculated
        lastUpdatedAt: now,

        // Last rewarded workout date
        winnieWorkoutDate: null,
        jackWorkoutDate: null,

        // Workout history
        workouts: []
    };
}


// ============================================================
// Load
// ============================================================

export function loadData() {
    const savedData =
        localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
        return createDefaultData();
    }

    try {
        const parsedData =
            JSON.parse(savedData);

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


// ============================================================
// Save
// ============================================================

export function saveData(data) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}


// ============================================================
// Reset
// ============================================================

export function resetData() {
    localStorage.removeItem(STORAGE_KEY);

    const newData =
        createDefaultData();

    saveData(newData);

    return newData;
}