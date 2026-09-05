// FriendQ Matching Engine (Pure JavaScript)

/**
 * Calculates matching percentage between current user and other users.
 * 
 * @param {Object} currentUserResponse - { completedCategories: string[], categoryAnswers: Array<{ categoryId, answers, questionOrder }> }
 * @param {Array<Object>} otherUsersList - Array of user objects with categoryAnswers and profile
 * @returns {Array<Object>} Sorted list of matched users with match percentage and matched categories
 */
export function getMatches(currentUserResponse, otherUsersList = []) {
  if (
    !currentUserResponse ||
    !currentUserResponse.completedCategories ||
    currentUserResponse.completedCategories.length === 0
  ) {
    return [];
  }

  // Create a map of current user's answers by categoryId
  const userAnswersByCategory = new Map();
  currentUserResponse.categoryAnswers.forEach((ca) => {
    userAnswersByCategory.set(ca.categoryId, ca);
  });

  const matches = otherUsersList
    .map((otherUser) => {
      let totalMatchingAnswers = 0;
      let totalQuestionsCompared = 0;
      const matchedCategories = [];

      // Compare answers for each category the other user has answered
      (otherUser.categoryAnswers || []).forEach((otherCategoryAnswers) => {
        const userCategoryAnswers = userAnswersByCategory.get(
          otherCategoryAnswers.categoryId
        );

        if (userCategoryAnswers) {
          matchedCategories.push(otherCategoryAnswers.categoryId);

          // Map current user's answers by questionId
          const userAnswerMap = new Map();
          userCategoryAnswers.questionOrder.forEach((qId, idx) => {
            userAnswerMap.set(qId, userCategoryAnswers.answers[idx]);
          });

          // Compare other user's answers to current user's
          otherCategoryAnswers.questionOrder.forEach((qId, idx) => {
            const userAnswer = userAnswerMap.get(qId);
            if (userAnswer !== undefined) {
              totalQuestionsCompared++;
              if (userAnswer === otherCategoryAnswers.answers[idx]) {
                totalMatchingAnswers++;
              }
            }
          });
        }
      });

      // Calculate overall percentage
      const matchPercentage =
        totalQuestionsCompared > 0
          ? Math.round((totalMatchingAnswers / totalQuestionsCompared) * 100)
          : 0;

      return {
        id: otherUser.id,
        name: otherUser.name || "Anonymous",
        image: otherUser.image || null,
        bio: otherUser.bio || "",
        gender: otherUser.gender || "",
        socialLinks: otherUser.socialLinks || {},
        galleryImages: otherUser.galleryImages || [],
        matchPercentage,
        matchedCategories,
        categoryAnswers: otherUser.categoryAnswers || [],
        isRealUser: Boolean(otherUser.isRealUser),
      };
    })
    .filter((match) => match.matchedCategories.length > 0);

  // Sort descending by matchPercentage
  return matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

/**
 * Calculates match percentage for a single specific category.
 * 
 * @param {Object} userAnswers - { answers: number[], questionOrder: number[] }
 * @param {Object} otherAnswers - { answers: number[], questionOrder: number[] }
 * @returns {number} Match percentage (0-100)
 */
export function calculateCategoryMatch(userAnswers, otherAnswers) {
  if (!userAnswers || !otherAnswers) return 0;

  const answerMap = new Map();
  userAnswers.questionOrder.forEach((questionId, index) => {
    answerMap.set(questionId, userAnswers.answers[index]);
  });

  let matching = 0;
  let compared = 0;

  otherAnswers.questionOrder.forEach((questionId, index) => {
    const userAnswer = answerMap.get(questionId);
    if (userAnswer !== undefined) {
      compared++;
      if (userAnswer === otherAnswers.answers[index]) {
        matching++;
      }
    }
  });

  return compared > 0 ? Math.round((matching / compared) * 100) : 0;
}
