import type { LearningService } from "./learning-service";
import { mockLearningService } from "./mock-learning-service";

/**
 * The single place that decides which implementation the app uses.
 * After the demo: return an API-backed service here instead.
 */
export const learningService: LearningService = mockLearningService;
