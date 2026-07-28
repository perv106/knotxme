require("dotenv").config({ path: path = require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

async function seedDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected. Clearing old collections...");

    // Clear old tables
    await User.deleteMany({});
    await Student.deleteMany({});
    await Attendance.deleteMany({});

    console.log("Seeding Admin and Faculty accounts...");

    // 1. Seed Super Admin
    const admin = await User.create({
      email: "admin@unismart.edu",
      name: "UniSmart Administrator",
      role: "super-admin",
    });

    // 2. Seed Faculty Members
    const faculty1 = await User.create({
      email: "faculty1@unismart.edu",
      name: "Dr. Alice Vance",
      role: "faculty",
      academicYear: "2023-2024",
    });

    const faculty2 = await User.create({
      email: "faculty2@unismart.edu",
      name: "Prof. Bob Miller",
      role: "faculty",
      academicYear: "2023-2024",
    });

    console.log("Seeding Students...");

    // 3. Seed Students
    const studentsGroup1 = [
      { name: "John Doe", rollNumber: "CS23A01", email: "john@unismart.edu", batch: "CS-A", faculty: faculty1._id },
      { name: "Jane Smith", rollNumber: "CS23A02", email: "jane@unismart.edu", batch: "CS-A", faculty: faculty1._id },
      { name: "Alex Carter", rollNumber: "CS23A03", email: "alex@unismart.edu", batch: "CS-A", faculty: faculty1._id },
      { name: "Sarah Jenkins", rollNumber: "CS23A04", email: "sarah@unismart.edu", batch: "CS-A", faculty: faculty1._id },
      { name: "Michael Brown", rollNumber: "CS23A05", email: "michael@unismart.edu", batch: "CS-A", faculty: faculty1._id },
    ];

    const studentsGroup2 = [
      { name: "David Lee", rollNumber: "CS23B01", email: "david@unismart.edu", batch: "CS-B", faculty: faculty2._id },
      { name: "Emily Davis", rollNumber: "CS23B02", email: "emily@unismart.edu", batch: "CS-B", faculty: faculty2._id },
      { name: "Chris Wilson", rollNumber: "CS23B03", email: "chris@unismart.edu", batch: "CS-B", faculty: faculty2._id },
    ];

    const savedStudents1 = await Student.insertMany(studentsGroup1);
    const savedStudents2 = await Student.insertMany(studentsGroup2);
    const allStudents = [...savedStudents1, ...savedStudents2];

    console.log("Generating 20 historical weekday class dates...");

    // Create 20 sequential weekday class dates (excluding Saturday/Sunday)
    const dates = [];
    let curr = new Date();
    // Start 35 days ago to ensure we find 20 weekdays
    curr.setDate(curr.getDate() - 35);
    while (dates.length < 20) {
      const day = curr.getDay();
      if (day !== 0 && day !== 6) {
        dates.push(curr.toISOString().split("T")[0]);
      }
      curr.setDate(curr.getDate() + 1);
    }

    console.log("Seeding attendance records based on historical performance profiles...");

    const attendanceRecords = [];

    // Define performance rules for each student to simulate varying risk levels
    // student -> status probability / specific logs
    for (const date of dates) {
      for (const student of allStudents) {
        let status = "present";

        if (student.rollNumber === "CS23A01") {
          // John Doe: Perfect attendance
          status = "present";
        } else if (student.rollNumber === "CS23A02") {
          // Jane Smith: High attendance (~90%)
          status = Math.random() > 0.1 ? "present" : "absent";
        } else if (student.rollNumber === "CS23A03") {
          // Alex Carter: Medium attendance (~75%)
          status = Math.random() > 0.25 ? "present" : "absent";
        } else if (student.rollNumber === "CS23A04") {
          // Sarah Jenkins: Low attendance (~50% - chronic absentee)
          status = Math.random() > 0.5 ? "present" : "absent";
        } else if (student.rollNumber === "CS23A05") {
          // Michael Brown: Present first 15 classes, then absent for last 5 (critical slide!)
          const dateIndex = dates.indexOf(date);
          status = dateIndex < 15 ? "present" : "absent";
        } else if (student.rollNumber === "CS23B01") {
          // David Lee: Good attendance
          status = Math.random() > 0.1 ? "present" : "absent";
        } else if (student.rollNumber === "CS23B02") {
          // Emily Davis: Declining attendance - absent last 7 classes
          const dateIndex = dates.indexOf(date);
          status = dateIndex < 13 ? "present" : "absent";
        } else if (student.rollNumber === "CS23B03") {
          // Chris Wilson: Perfect attendance
          status = "present";
        }

        attendanceRecords.push({
          student: student._id,
          date,
          status,
          markedBy: student.faculty,
        });
      }
    }

    await Attendance.insertMany(attendanceRecords);

    console.log("\n=============================================");
    console.log("🎉 Seeding completed successfully!");
    console.log(`- Super Admin: admin@unismart.edu`);
    console.log(`- Faculty 1:   faculty1@unismart.edu (Dr. Alice Vance)`);
    console.log(`- Faculty 2:   faculty2@unismart.edu (Prof. Bob Miller)`);
    console.log(`- Students:    ${allStudents.length} seeded`);
    console.log(`- Attendance:  ${attendanceRecords.length} records generated`);
    console.log("=============================================\n");

    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

seedDatabase();
