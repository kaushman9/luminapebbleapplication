import React from 'react';
import { Modal } from '../ui/Modal';
import { UniversityCourse } from '../../types';
import { Icon } from '../ui/Icons';

interface CourseDetailsModalProps {
    course: UniversityCourse;
    onClose: () => void;
    onCourseComplete: (courseId: string) => void;
}

const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({ course, onClose, onCourseComplete }) => {
    
    // In a real app, this would be more complex (e.g., check enrollment status)
    const handleStartCourse = () => {
        onCourseComplete(course.id);
        onClose();
    };

    return (
        <Modal show={true} onClose={onClose} title={course.title} size="2xl">
            <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">{course.description}</p>

                {course.modules.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Modules</h4>
                        <ul className="space-y-2">
                        {course.modules.map(module => (
                            <li key={module.id} className="flex items-center p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                                <Icon name="clipboard-document-check" className="h-5 w-5 mr-3 text-slate-500" />
                                <span className="text-sm font-medium">{module.title}</span>
                                <span className="ml-auto text-xs text-slate-400">{module.moduleType}</span>
                            </li>
                        ))}
                        </ul>
                    </div>
                )}

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleStartCourse}
                        className="px-6 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm"
                    >
                        Start Course & Mark Complete (Demo)
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CourseDetailsModal;