import { Doctor } from "../models/doctor.model.js";
import { Patient } from "../models/patient.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Function to get the last N months in "YYYY-MM" format
const getLastMonthKeys = (months) => {
  const now = new Date();
  return Array.from({ length: months }, (_, index) => {
    const offset = months - 1 - index;
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1),
    );
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  });
};

// get dashboard stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const { months, top } = req.validatedQuery ?? req.query;

  const monthKeys = getLastMonthKeys(months);
  const [startYear, startMonth] = monthKeys[0].split("-").map(Number);
  const rangeStart = new Date(Date.UTC(startYear, startMonth - 1, 1));

  const now = new Date();
  const startOfThisMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  const [
    totalDoctors,
    totalPatients,
    newPatientsThisMonth,
    patientsPerDoctor,
    monthlyCounts,
    patientsByCondition,
    recentPatients,
  ] = await Promise.all([
    Doctor.estimatedDocumentCount(),
    Patient.estimatedDocumentCount(),
    Patient.countDocuments({ createdAt: { $gte: startOfThisMonth } }),

    Doctor.find({}, { name: 1, patientCount: 1 })
      .sort({ patientCount: -1 })
      .limit(top)
      .lean(),

    Patient.aggregate([
      { $match: { createdAt: { $gte: rangeStart } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),

    Patient.aggregate([
      { $group: { _id: "$condition", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),

    Patient.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name condition createdAt")
      .lean(),
  ]);

  const countByMonth = new Map(
    monthlyCounts.map((item) => [item._id, item.count]),
  );
  const patientsOverTime = monthKeys.map((month) => ({
    month,
    count: countByMonth.get(month) ?? 0,
  }));

  const averagePatientsPerDoctor = totalDoctors
    ? Math.round(totalPatients / totalDoctors)
    : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totals: {
          totalDoctors,
          totalPatients,
          averagePatientsPerDoctor,
          newPatientsThisMonth,
        },
        patientsPerDoctor: patientsPerDoctor.map((doctor) => ({
          doctorId: doctor._id,
          name: doctor.name,
          count: doctor.patientCount,
        })),
        patientsOverTime,
        patientsByCondition: patientsByCondition.map((item) => ({
          condition: item._id,
          count: item.count,
        })),
        recentPatients,
      },
      "Dashboard stats fetched successfully",
    ),
  );
});

export { getDashboardStats };
