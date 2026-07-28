const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const { sendExcel } = require("../utils/exportExcel");
const { predictRisk } = require("../utils/mlModel");

// GET /api/faculty/students
async function getStudents(req, res) {
  try {
    const students = await Student.find({ faculty: req.user._id });
    return res.status(200).json(students);
  } catch (err) {
    console.error("Error fetching students", err);
    return res.status(500).json({ message: "An error occurred while fetching students." });
  }
}

// POST /api/faculty/attendance
async function markAttendance(req, res) {
  try {
    const { date, attendance } = req.body; // date: YYYY-MM-DD, attendance: { [studentId]: 'present' | 'absent' }
    if (!date || !attendance) {
      return res.status(400).json({ message: "Date and attendance data are required." });
    }

    const studentIds = Object.keys(attendance);
    if (studentIds.length === 0) {
      return res.status(400).json({ message: "No attendance records provided." });
    }

    // Verify all students belong to this faculty
    const students = await Student.find({
      _id: { $in: studentIds },
      faculty: req.user._id,
    });

    if (students.length !== studentIds.length) {
      return res.status(403).json({ message: "You can only mark attendance for your assigned students." });
    }

    const operations = studentIds.map((studentId) => {
      const status = attendance[studentId];
      return Attendance.findOneAndUpdate(
        { student: studentId, date },
        { status, markedBy: req.user._id },
        { upsert: true, new: true }
      );
    });

    await Promise.all(operations);

    return res.status(200).json({ message: "Attendance marked successfully." });
  } catch (err) {
    console.error("Error marking attendance", err);
    return res.status(500).json({ message: "An error occurred while saving attendance." });
  }
}

// GET /api/faculty/attendance-dates
async function getAttendanceHistory(req, res) {
  try {
    const dates = await Attendance.find({ markedBy: req.user._id }).distinct("date");
    // Sort dates descending (newest first)
    const sortedDates = dates.sort((a, b) => new Date(b) - new Date(a));
    return res.status(200).json(sortedDates);
  } catch (err) {
    console.error("Error fetching attendance dates", err);
    return res.status(500).json({ message: "An error occurred while fetching dates." });
  }
}

// GET /api/faculty/report
async function exportReport(req, res) {
  try {
    const students = await Student.find({ faculty: req.user._id });
    const studentIds = students.map((s) => s._id);

    const attendanceRecords = await Attendance.find({
      student: { $in: studentIds },
    });

    const columns = [
      { header: "Student Name", key: "name", width: 25 },
      { header: "Roll Number", key: "rollNumber", width: 15 },
      { header: "Batch", key: "batch", width: 12 },
      { header: "Total Classes", key: "totalDays", width: 15 },
      { header: "Classes Present", key: "presentDays", width: 15 },
      { header: "Attendance Rate (%)", key: "percentage", width: 20 },
    ];

    const rows = students.map((student) => {
      const studentAttendance = attendanceRecords.filter(
        (a) => a.student.toString() === student._id.toString()
      );
      const totalDays = studentAttendance.length;
      const presentDays = studentAttendance.filter((a) => a.status === "present").length;
      const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

      return {
        name: student.name,
        rollNumber: student.rollNumber,
        batch: student.batch,
        totalDays,
        presentDays,
        percentage: `${percentage}%`,
      };
    });

    const filename = `Attendance_Report_${req.user.name.replace(/\s+/g, "_")}.xlsx`;
    await sendExcel(res, filename, columns, rows);
  } catch (err) {
    console.error("Error exporting report", err);
    return res.status(500).json({ message: "An error occurred while generating the report." });
  }
}

// GET /api/faculty/insights
async function getSmartInsights(req, res) {
  try {
    const students = await Student.find({ faculty: req.user._id });
    const studentIds = students.map((s) => s._id);

    const attendanceRecords = await Attendance.find({
      student: { $in: studentIds },
    });

    const insights = [];
    const predictedAbsentees = [];

    students.forEach((student) => {
      const studentAttendance = attendanceRecords.filter(
        (a) => a.student.toString() === student._id.toString()
      );

      const prediction = predictRisk(studentAttendance);

      const data = {
        studentId: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        batch: student.batch,
        currentRate: prediction.currentRate,
        projectedRate: prediction.projectedRate,
        engagementScore: prediction.engagementScore,
        riskLevel: prediction.riskLevel,
        recommendation: prediction.recommendation,
      };

      insights.push(data);

      if (prediction.riskLevel === "High") {
        predictedAbsentees.push(data);
      }
    });

    // Sort insights by engagement score ascending (worst first)
    insights.sort((a, b) => a.engagementScore - b.engagementScore);

    return res.status(200).json({
      insights,
      predictedAbsentees,
    });
  } catch (err) {
    console.error("Error generating insights", err);
    return res.status(500).json({ message: "An error occurred while generating insights." });
  }
}

module.exports = {
  getStudents,
  markAttendance,
  getAttendanceHistory,
  exportReport,
  getSmartInsights,
};
