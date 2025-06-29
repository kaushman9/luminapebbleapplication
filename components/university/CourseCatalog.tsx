import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { UniversityCourse, UserEnrollment, User } from '../../types';
import { Icon } from '../ui/Icons';
import CourseDetailsModal from './CourseDetailsModal';

interface CourseCatalogProps {
    courses: UniversityCourse[];
    enrollments: UserEnrollment[];
    currentUser: User;
    onCourseComplete: (courseId: string) => void;
}


const CourseCatalog: React.FC<CourseCatalogProps> = (props) => {
    const [selectedCourse, setSelectedCourse] = useState<UniversityCourse | null>(null);
    const [filter, setFilter] = useState('');
    
    const filteredCourses = props.courses.filter(c => 
        c.title.toLowerCase().includes(filter.toLowerCase()) ||
        c.description.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    Course Catalog
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Browse all available learning content.
                </p>
            </div>
            
             <div className="relative max-w-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Icon name="magnifying-glass" className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:ring-primary-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                    <Card key={course.id} bodyClassName="p-0 flex flex-col">
                        <div className="p-5 flex-grow">
                             <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{course.title}</h3>
                             <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">{course.description}</p>
                        </div>
                        <div className="p-5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                             <button 
                                onClick={() => setSelectedCourse(course)}
                                className="w-full text-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm"
                            >
                                View Details
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
            
            {selectedCourse && (
                <CourseDetailsModal
                    course={selectedCourse}
                    onClose={() => setSelectedCourse(null)}
                    onCourseComplete={props.onCourseComplete}
                />
            )}
        </div>
    );
};

export default CourseCatalog;