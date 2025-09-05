import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

// Teacher marks attendance for a class
export const markClassAttendance = async (req, res) => {
  try {
    const { students, date } = req.body;
    const teacherId = req.user.id;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ status: "error", message: "Students array is required" });
    }

    const attendanceDate = date ? new Date(date) : new Date();

    const records = [];
    for (const s of students) {
      const student = await User.findById(s.studentId);
      if (!student || student.role !== "student") continue;

      // prevent duplicate attendance for same student + day
      const existing = await Attendance.findOne({
        student: student._id,
        date: {
          $gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
          $lt: new Date(attendanceDate.setHours(23, 59, 59, 999)),
        },
      });

      if (existing) {
        existing.status = s.status || "present"; // update if teacher overrides
        await existing.save();
        records.push(existing);
      } else {
        const record = new Attendance({
          student: student._id,
          teacher: teacherId,
          markedBy: "teacher",
          status: s.status || "present",
          date: attendanceDate,
        });
        await record.save();
        records.push(record);
      }
    }

    res.json({
      status: "success",
      message: "Attendance marked successfully",
      count: records.length,
      data: records,
    });
  } catch (err) {
    console.error("Teacher attendance error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// Teacher fetches student list
// Teacher fetches student list (ready-to-use JSON for attendance)
export const getStudentsForClass = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("_id name email uuid");

    // build template JSON for attendance
    const attendanceTemplate = {
      date: new Date().toISOString().split("T")[0], // today’s date in YYYY-MM-DD
      students: students.map(s => ({
        studentId: s._id,
        status: "present" // default, teacher can change manually
      }))
    };

    res.json({
      status: "success",
      count: students.length,
      data: students,
      attendanceTemplate
    });
  } catch (err) {
    console.error("Get students error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};



// Teacher views attendance records for their class
export const getClassAttendance = async (req,res)=> {
  try {
    const teacherId  = req.user.id;
    const records = await Attendance.find({ teacher: teacherId})
    .populates("student", "name email uuid")
    .populates("teacher", "name email uuid")
    res.json({
      status:"success", 
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error("Get class attendance error:", err);
    res.status(500).json({message: "Server error"});
  }
}
