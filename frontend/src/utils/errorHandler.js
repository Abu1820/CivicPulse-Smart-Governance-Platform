/**
 * Extract clean, user-friendly error messages from API responses or exceptions
 */
export function getErrorMessage(error, defaultMsg = "An error occurred. Please try again.") {
  if (!error) return defaultMsg;

  if (error.response?.data) {
    const data = error.response.data;

    // Direct message property
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }

    // Validation errors map: { fieldName: "validation error message", ... }
    if (typeof data === "object") {
      const messages = Object.values(data).filter(
        (val) => typeof val === "string" && val.trim()
      );
      if (messages.length > 0) {
        return messages[0];
      }
    }

    if (typeof data === "string" && data.trim()) {
      return data;
    }
  }

  if (error.message) {
    return error.message;
  }

  return defaultMsg;
}
