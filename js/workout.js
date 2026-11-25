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


export function getYesterdayString() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, "0");
    const day = String(yesterday.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getWorkoutDateField(user) {
    return user === "winnie"
        ? "winnieWorkoutDate"
        : "jackWorkoutDate";
}


function hasRewardedWorkout(data, user, date) {
    const dateField = getWorkoutDateField(user);

    return data[dateField] === date || data.workouts.some(workout =>
        workout.user === user &&
        workout.date === date &&
        workout.rewarded !== false
    );
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

export function submitWorkout(
    data,
    user,
    workoutDate = getTodayString()
) {
    const alreadyRewarded =
        hasRewardedWorkout(data, user, workoutDate);

    if (!alreadyRewarded) {
        data.weight -= WORKOUT_LOSS;

        const dateField = getWorkoutDateField(user);

        // Keep the latest rewarded date so today's status is not
        // overwritten when yesterday is entered retroactively.
        if (!data[dateField] || workoutDate >= data[dateField]) {
            data[dateField] = workoutDate;
        }
    }

    const timestamp = workoutDate === getTodayString()
        ? Date.now()
        : new Date(`${workoutDate}T12:00:00`).getTime();

    data.workouts.push({
        user,
        date: workoutDate,
        timestamp,
        rewarded: !alreadyRewarded
    });

    return {
        alreadyRewardedToday: alreadyRewarded,
        alreadyRewarded
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

            const workoutDate = workout.date
                ? new Date(`${workout.date}T00:00:00`)
                : new Date(workout.timestamp);

            return workoutDate >= weekStart;
        }
    ).length;
}