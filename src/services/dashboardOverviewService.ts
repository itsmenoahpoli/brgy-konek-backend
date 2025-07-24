import Complaint from "../models/Complaint";
import Announcement from "../models/Announcement";
import User from "../models/User";

export async function getOverviewStatistics() {
  const [totalComplaints, totalActiveAnnouncements, totalResidents] =
    await Promise.all([
      Complaint.countDocuments(),
      Announcement.countDocuments({ status: "published" }),
      User.countDocuments({ user_type: "resident" }),
    ]);
  return {
    totalComplaints,
    totalActiveAnnouncements,
    totalResidents,
  };
}
