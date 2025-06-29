import React, { useState } from 'react';
import { User, UniversityCourse, UserEnrollment, UserCertification, LearningPath } from '../types';
import { Icon } from '../components/ui/Icons';
import UniversityDashboard from '../components/university/UniversityDashboard';
import CourseCatalog from '../components/university/CourseCatalog';
import ExplorePaths from '../components/university/ExplorePaths';
import MyTeamDevelopment from '../components/university/MyTeamDevelopment';

interface UniversityProps {
    courses: UniversityCourse[];
    enrollments: UserEnrollment[];
    certifications: UserCertification[];
    learningPaths: LearningPath[];
    currentUser: User;
    users: User[];
    onCourseComplete: (courseId: string) => void;
}

const University: React.FC<UniversityProps> = (props) => {
    const [activePage, setActivePage] = useState('Dashboard');
    const { currentUser } = props;

    const isManager = currentUser.assignments.some(a => a.positionTitle.toLowerCase().includes('manager'));

    const renderContent = () => {
        switch (activePage) {
            case 'Dashboard':
                return <UniversityDashboard {...props} />;
            case 'Course Catalog':
                return <CourseCatalog {...props} />;
            case 'Explore Paths':
                return <ExplorePaths {...props} />;
            case 'My Team\'s Development':
                return <MyTeamDevelopment {...props} />;
            case 'Live & Group Sessions':
            case 'My Transcript & Achievements':
                 return (
                    <div className="text-center py-20">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{activePage}</h1>
                        <p className="mt-2 text-slate-500">This page is under construction.</p>
                    </div>
                );
            default:
                return <UniversityDashboard {...props} />;
        }
    };
    
    const navItems: { name: string; icon: React.ComponentProps<typeof Icon>['name'] }[] = [
        { name: 'Dashboard', icon: 'home' },
        { name: 'Explore Paths', icon: 'rocket-launch' },
        { name: 'Course Catalog', icon: 'book-open' },
        { name: 'Live & Group Sessions', icon: 'users' },
        { name: 'My Transcript & Achievements', icon: 'academic-cap' },
    ];

    if (isManager) {
        navItems.push({ name: 'My Team\'s Development', icon: 'shield-check' });
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
            {/* Tab navigation bar */}
            <div className="flex-shrink-0 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {navItems.map(item => (
                        <button
                            key={item.name}
                            onClick={() => setActivePage(item.name)}
                            className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activePage === item.name
                                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-200 dark:hover:border-slate-600'
                            }`}
                        >
                            <Icon name={item.icon} className="h-5 w-5 mr-2" />
                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
                {renderContent()}
            </div>
        </div>
    );
};

export default University;