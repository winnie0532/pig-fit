// ============================================================
// PigFit - Workout
// ============================================================

export const WORKOUT_LOSS = 0.5;

export const WEEKLY_GOAL_PER_PERSON = 4;


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
// ============================================================
// Date Helpers
// ============================================================

export function getYesterdayString() {
    const date = new Date();

    date.setDate(date.getDate() - 1);

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
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

// ============================================================
// Backfill Workout
// ============================================================

export function backfillWorkout(
    data,
    user,
    workoutDate
) {
    const dateField =
        user === "winnie"
            ? "winnieWorkoutDate"
            : "jackWorkoutDate";

    // Check whether this user already has a record
    const alreadyExists =
        data[dateField] === workoutDate ||
        data.workouts.some(workout =>
            workout.user === user &&
            workout.date === workoutDate
        );

    if (alreadyExists) {
        return {
            alreadyExists: true
        };
    }

    // Deduct 0.5 kg
    data.weight -= WORKOUT_LOSS;

    // Preserve the latest rewarded date
    if (
        !data[dateField] ||
        workoutDate > data[dateField]
    ) {
        data[dateField] = workoutDate;
    }

    // Save workout history
    data.workouts.push({
        user,
        date: workoutDate,
        timestamp: new Date(
            `${workoutDate}T12:00:00`
        ).getTime(),
        rewarded: true
    });

    return {
        alreadyExists: false
    };
}