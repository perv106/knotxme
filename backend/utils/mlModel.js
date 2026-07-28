const fs = require("fs");
const path = require("path");

// Load configurable weights, fallback to default values if file read fails
function getWeights() {
  const configPath = path.join(__dirname, "../config/ml_weights.json");
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to load ML weights, using defaults", err);
  }
  return {
    wRecent: 0.7,
    wOverall: 0.3,
    highRiskThreshold: 0.75,
    mediumRiskThreshold: 0.85,
    semesterTotalClasses: 90,
  };
}

/**
 * Predicts attendance risk and calculates engagement scores
 * @param {Array} attendanceRecords - Array of attendance objects sorted by date ascending
 */
function predictRisk(attendanceRecords) {
  const weights = getWeights();
  const totalClasses = weights.semesterTotalClasses || 90;

  const elapsed = attendanceRecords.length;
  if (elapsed === 0) {
    return {
      currentRate: 1.0,
      projectedRate: 1.0,
      engagementScore: 100,
      riskLevel: "Low",
      consecutiveAbsences: 0,
      recommendation: "No attendance records available. Keep up the good work once classes start!",
    };
  }

  // Calculate overall attendance rate
  const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
  const overallRate = presentCount / elapsed;

  // Calculate recent attendance rate (last 10 classes)
  const recentRecords = attendanceRecords.slice(-10);
  const recentPresentCount = recentRecords.filter((r) => r.status === "present").length;
  const recentRate = recentRecords.length > 0 ? recentPresentCount / recentRecords.length : overallRate;

  // Calculate consecutive absences from the end of the stream
  let consecutiveAbsences = 0;
  for (let i = attendanceRecords.length - 1; i >= 0; i--) {
    if (attendanceRecords[i].status === "absent") {
      consecutiveAbsences++;
    } else {
      break;
    }
  }

  // Predict future attendance probability
  // AR_future = wRecent * recentRate + wOverall * overallRate
  const projectedFutureRate = weights.wRecent * recentRate + weights.wOverall * overallRate;

  // Expected present days at the end of the semester
  const remainingClasses = Math.max(0, totalClasses - elapsed);
  const projectedPresentDays = presentCount + projectedFutureRate * remainingClasses;
  const projectedRate = Math.min(1, Math.max(0, projectedPresentDays / totalClasses));

  // Determine risk level based on thresholds
  let riskLevel = "Low";
  if (projectedRate < weights.highRiskThreshold) {
    riskLevel = "High";
  } else if (projectedRate < weights.mediumRiskThreshold) {
    riskLevel = "Medium";
  }

  // Calculate engagement score (0 to 100)
  // Base score is a weighted combination of overall and recent rates
  let engagementScore = (weights.wOverall * overallRate + weights.wRecent * recentRate) * 100;
  // Deduct 5 points per consecutive absence
  engagementScore = Math.max(0, Math.min(100, Math.round(engagementScore - consecutiveAbsences * 5)));

  // Generate actionable recommendation
  let recommendation = "Maintain current attendance schedule.";
  if (consecutiveAbsences >= 3) {
    recommendation = `Alert: Student has missed ${consecutiveAbsences} consecutive classes. Schedule an urgent check-in.`;
  } else if (riskLevel === "High") {
    recommendation = `High Risk: Projected to finish with ${(projectedRate * 100).toFixed(0)}% attendance. Send email warning immediately.`;
  } else if (riskLevel === "Medium") {
    recommendation = `Medium Risk: Monitor attendance over the next 5 sessions. Consider sending a friendly check-in.`;
  } else if (recentRate < 0.6) {
    recommendation = "Recent slip in attendance. Check in with student to verify engagement.";
  }

  return {
    currentRate: Math.round(overallRate * 100) / 100,
    projectedRate: Math.round(projectedRate * 100) / 100,
    engagementScore,
    riskLevel,
    consecutiveAbsences,
    recommendation,
  };
}

module.exports = { predictRisk };
