import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';

/**
 * Get aggregated metrics for Manager Dashboard (Section 34)
 */
export const getManagerDashboard = async (managerId) => {
  const managerProjects = await Project.find({ createdBy: managerId }).select('_id status members');
  const projectIds = managerProjects.map((p) => p._id);

  // Total and Active Projects
  const totalProjects = managerProjects.length;
  const activeProjects = managerProjects.filter((p) => p.status === 'ACTIVE').length;

  // Unique Members across all Manager's projects
  const uniqueMemberIds = new Set();
  managerProjects.forEach((p) => {
    (p.members || []).forEach((m) => uniqueMemberIds.add(m.toString()));
  });
  const totalUsers = uniqueMemberIds.size;

  // Active Users (logged in within last 24h or isActive)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeUsers = await User.countDocuments({
    _id: { $in: Array.from(uniqueMemberIds) },
    $or: [{ lastSeen: { $gte: oneDayAgo } }, { isActive: true }]
  });

  // Task metrics across manager's projects
  const now = new Date();
  const [
    totalTasks,
    completedTasks,
    pendingTasks,
    tasksInReview,
    tasksInProgress,
    overdueTasks
  ] = await Promise.all([
    Task.countDocuments({ project: { $in: projectIds } }),
    Task.countDocuments({ project: { $in: projectIds }, status: 'COMPLETED' }),
    Task.countDocuments({ project: { $in: projectIds }, status: 'TODO' }),
    Task.countDocuments({ project: { $in: projectIds }, status: 'IN_REVIEW' }),
    Task.countDocuments({ project: { $in: projectIds }, status: 'IN_PROGRESS' }),
    Task.countDocuments({
      project: { $in: projectIds },
      deadline: { $lt: now },
      status: { $ne: 'COMPLETED' }
    })
  ]);

  // Recent Activity in manager's projects
  const recentActivity = await ActivityLog.find({ project: { $in: projectIds } })
    .populate('user', 'name email avatar role')
    .populate('project', 'name')
    .populate('task', 'title status')
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    totalProjects,
    activeProjects,
    totalUsers,
    activeUsers,
    totalTasks,
    completedTasks,
    pendingTasks,
    tasksInReview,
    tasksInProgress,
    overdueTasks,
    recentActivity
  };
};

/**
 * Get aggregated metrics for User Dashboard (Section 35)
 */
export const getUserDashboard = async (userId) => {
  const now = new Date();

  // Tasks assigned to this user
  const [
    assignedTasks,
    inProgress,
    inReview,
    completed,
    todo,
    overdue
  ] = await Promise.all([
    Task.countDocuments({ assignedTo: userId }),
    Task.countDocuments({ assignedTo: userId, status: 'IN_PROGRESS' }),
    Task.countDocuments({ assignedTo: userId, status: 'IN_REVIEW' }),
    Task.countDocuments({ assignedTo: userId, status: 'COMPLETED' }),
    Task.countDocuments({ assignedTo: userId, status: 'TODO' }),
    Task.countDocuments({
      assignedTo: userId,
      deadline: { $lt: now },
      status: { $ne: 'COMPLETED' }
    })
  ]);

  // Recent projects user is a member of
  const recentProjects = await Project.find({ members: userId })
    .populate('createdBy', 'name email avatar')
    .sort({ updatedAt: -1 })
    .limit(5);

  const projectIds = recentProjects.map((p) => p._id);

  // Recent notifications for this user
  const recentNotifications = await Notification.find({ user: userId })
    .populate('relatedUser', 'name avatar')
    .populate('project', 'name')
    .populate('task', 'title')
    .sort({ createdAt: -1 })
    .limit(5);

  const unreadNotificationsCount = await Notification.countDocuments({
    user: userId,
    isRead: false
  });

  // Recent activity in projects the user belongs to
  const recentActivity = await ActivityLog.find({
    $or: [{ project: { $in: projectIds } }, { user: userId }]
  })
    .populate('user', 'name email avatar role')
    .populate('project', 'name')
    .populate('task', 'title status')
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    assignedTasks,
    inProgress,
    inReview,
    completed,
    todo,
    overdue,
    recentProjects,
    recentNotifications,
    unreadNotificationsCount,
    recentActivity
  };
};
