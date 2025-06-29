import React from 'react';
import { Card } from '../ui/Card';
import { UniversityCourse, UserEnrollment, User, LearningPath } from '../../types';
import { Icon } from '../ui/Icons';
import CourseCatalog from './CourseCatalog';

interface UniversityDashboardProps {
    courses: UniversityCourse[];
    enrollments: UserEnrollment[];
    currentUser: User;
    onCourseComplete: (courseId: string) => void;
}

const getRecommendedCourses = (userId: string, allCourses: UniversityCourse[], enrollments: UserEnrollment[]): UniversityCourse[] => {
    const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));
    // Simple logic: return first 3 non-enrolled courses.
    // A real implementation would use AI/role data.
    return allCourses.filter(course => !enrolledCourseIds.has(course.id)).slice(0, 3);
};


const UniversityDashboard: React.FC<UniversityDashboardProps> = ({ courses, enrollments, currentUser, onCourseComplete }) => {
    
    const myAssignments = enrollments.filter(e => e.userId === currentUser.id && e.status !== 'Completed');
    const recommendedCourses = getRecommendedCourses(currentUser.id, courses, enrollments);

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    Learning Dashboard
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Your progress, assignments, and recommendations.
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="My Assignments">
                        {myAssignments.length > 0 ? (
                            <ul className="space-y-4">
                                {myAssignments.map(enrollment => {
                                    const course = courses.find(c => c.id === enrollment.courseId);
                                    if (!course) return null;
                                    return (
                                        <li key={enrollment.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{course.title}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                                  <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                                                </div>
                                                <span className="text-xs font-semibold ml-4">{enrollment.progress}%</span>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                            <p className="text-sm text-center py-6 text-slate-500">No outstanding course assignments. Great job!</p>
                        )}
                    </Card>
                </div>
                <div className="lg:col-span-1">
                     <Card title="Recommended For You">
                         {recommendedCourses.length > 0 ? (
                             <ul className="space-y-3">
                                {recommendedCourses.map(course => (
                                    <li key={course.id} className="flex items-center">
                                        <Icon name="academic-cap" className="h-5 w-5 mr-3 text-primary-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{course.title}</span>
                                    </li>
                                ))}
                            </ul>
                         ) : (
                            <p className="text-sm text-center py-4 text-slate-500">No recommendations right now.</p>
                         )}
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default UniversityDashboard;
