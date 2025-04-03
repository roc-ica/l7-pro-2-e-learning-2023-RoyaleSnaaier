import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { Course, Exercise, Lesson } from '../types/course';

// Auth Slice
interface AuthState {
  user: {
    id: number;
    username: string;
    email: string;
  } | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

const initialAuthState: AuthState = {
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<any>) {
      state.loading = false;
      state.user = action.payload;
      state.isLoggedIn = true;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isLoggedIn = false;
    },
  }
});

// Course Slice
interface CoursesState {
  list: Course[];
  current: Course | null;
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
}

const initialCoursesState: CoursesState = {
  list: [],
  current: null,
  lessons: [],
  loading: false,
  error: null
};

const coursesSlice = createSlice({
  name: 'courses',
  initialState: initialCoursesState,
  reducers: {
    fetchCoursesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCoursesSuccess(state, action: PayloadAction<Course[]>) {
      state.loading = false;
      state.list = action.payload;
    },
    fetchCoursesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrent(state, action: PayloadAction<Course>) {
      state.current = action.payload;
    },
    setLessons(state, action: PayloadAction<Lesson[]>) {
      state.lessons = action.payload;
    },
    addCourse(state, action: PayloadAction<Course>) {
      state.list.push(action.payload);
    },
    updateCourse(state, action: PayloadAction<Course>) {
      const index = state.list.findIndex(course => course.course_id === action.payload.course_id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
      if (state.current?.course_id === action.payload.course_id) {
        state.current = action.payload;
      }
    },
    removeCourse(state, action: PayloadAction<number>) {
      state.list = state.list.filter(course => course.course_id !== action.payload);
      if (state.current?.course_id === action.payload) {
        state.current = null;
      }
    }
  }
});

// Lesson and Exercise Slice
interface LessonState {
  current: Lesson | null;
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
}

const initialLessonState: LessonState = {
  current: null,
  exercises: [],
  loading: false,
  error: null
};

const lessonSlice = createSlice({
  name: 'lesson',
  initialState: initialLessonState,
  reducers: {
    fetchLessonStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchLessonSuccess(state, action: PayloadAction<Lesson>) {
      state.loading = false;
      state.current = action.payload;
      state.exercises = action.payload.exercises || [];
    },
    fetchLessonFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addExercise(state, action: PayloadAction<Exercise>) {
      state.exercises.push(action.payload);
    },
    updateExercise(state, action: PayloadAction<Exercise>) {
      const index = state.exercises.findIndex(ex => ex.exercise_id === action.payload.exercise_id);
      if (index !== -1) {
        state.exercises[index] = action.payload;
      }
    },
    removeExercise(state, action: PayloadAction<number>) {
      state.exercises = state.exercises.filter(ex => ex.exercise_id !== action.payload);
    }
  }
});

// User Progress Slice
interface UserProgressState {
  totalLessons: number;
  completedLessons: number;
  courseProgress: {
    courseId: number;
    title: string;
    progress: number;
    completed: number;
    total: number;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
    progress: number;
    maxProgress: number;
  }[];
  loading: boolean;
  error: string | null;
}

const initialProgressState: UserProgressState = {
  totalLessons: 0,
  completedLessons: 0,
  courseProgress: [],
  achievements: [],
  loading: false,
  error: null
};

const progressSlice = createSlice({
  name: 'progress',
  initialState: initialProgressState,
  reducers: {
    fetchProgressStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProgressSuccess(state, action: PayloadAction<any>) {
      state.loading = false;
      state.totalLessons = action.payload.totalLessons || 0;
      state.completedLessons = action.payload.completedLessons || 0;
      state.courseProgress = action.payload.courseProgress || [];
      state.achievements = action.payload.achievements || [];
    },
    fetchProgressFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateLessonCompletion(state, action: PayloadAction<{ lessonId: number; courseId: number; completed: boolean }>) {
      // Update course progress when lesson is completed
      const { courseId, completed } = action.payload;
      const courseIndex = state.courseProgress.findIndex(cp => cp.courseId === courseId);
      
      if (courseIndex !== -1 && completed) {
        state.courseProgress[courseIndex].completed += 1;
        state.courseProgress[courseIndex].progress = 
          (state.courseProgress[courseIndex].completed / state.courseProgress[courseIndex].total) * 100;
        state.completedLessons += 1;
      }
    }
  }
});

// Combine slices into the store
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    courses: coursesSlice.reducer,
    lesson: lessonSlice.reducer,
    progress: progressSlice.reducer
  }
});

// Export action creators
export const authActions = authSlice.actions;
export const coursesActions = coursesSlice.actions;
export const lessonActions = lessonSlice.actions;
export const progressActions = progressSlice.actions;

// Define types for state and dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
