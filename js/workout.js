// ============================================================
// PigFit - Workout
// ============================================================

export const WORKOUT_LOSS = 1;

export const WEEKLY_GOAL_PER_PERSON = 3;


// ============================================================
// Date Helpers
// ============================================================

export function getTodayString() {
    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


export function getStartOfWeek(date = new Date()) {
    const result =
        new Date(date);

    const day =
        result.getDay();

    // Monday = first day of week
    const difference =
        day === 0
            ? -6
            : 1 - day;

    result.setDate(
        result.getDate() + difference
    );

    result.setHours(
        0,
        0,
        0,
        0
    );

    return result;
}


// ============================================================
// Submit Workout
// ============================================================

export function submitWorkout(data, user) {
    const today =
        getTodayString();

    let alreadyRewardedToday =
        false;


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


    // --------------------------------------------------------
    // Workout History
    // --------------------------------------------------------

    data.workouts.push({
        user,
        date: today,
        timestamp: Date.now(),
        rewarded:
            !alreadyRewardedToday
    });


    return {
        alreadyRewardedToday
    };
}


// ============================================================
// Weekly Workout Count
// ============================================================

export function getWeeklyWorkoutCount(
    data,
    user
) {
    const weekStart =
        getStartOfWeek();

    return data.workouts.filter(
        workout => {

            if (workout.user !== user) {
                return false;
            }

            if (!workout.rewarded) {
                return false;
            }

            const workoutDate =
                new Date(
                    workout.timestamp
                );

            return workoutDate >= weekStart;
        }
    ).length;
}