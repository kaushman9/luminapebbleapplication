import React, { useState } from 'react';
import { UniversityCourse, LearningPath, ProjectTemplate, AssetTypeConfig } from '../types';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icons';
import { CourseBuilderModal } from '../components/curriculum-studio/CourseBuilderModal';
import { PathwayBuilderModal } from '../components/curriculum-studio/PathwayBuilderModal';

interface CurriculumStudioProps {
  courses: UniversityCourse[];
  learningPaths: LearningPath[];
  templates: ProjectTemplate[];
  assetTypeConfigs: AssetTypeConfig[];
  onSaveCourse: (course: UniversityCourse) => void;
  onSaveLearningPath: (path: LearningPath) => void;
}

const CurriculumStudio: React.FC<CurriculumStudioProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'paths'>('courses');
  const [editingCourse, setEditingCourse] = useState<UniversityCourse | null>(null);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);

  const handleEditCourse = (course: UniversityCourse) => setEditingCourse(course);
  const handleNewCourse = () => setEditingCourse({ id: `course-${Date.now()}`, title: '', description: '', assetTypeRelevance: [], modules: [] });

  const handleEditPath = (path: LearningPath) => setEditingPath(path);
  const handleNewPath = () => setEditingPath({ id: `path-${Date.now()}`, title: '', description: '', stages: [] });

  const handleSaveCourse = (course: UniversityCourse) => {
    props.onSaveCourse(course);
    setEditingCourse(null);
  }

  const handleSavePath = (path: LearningPath) => {
    props.onSaveLearningPath(path);
    setEditingPath(null);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Curriculum Studio</h1>
      
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('courses')} className={activeTab === 'courses' ? 'border-primary-500 text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-200 dark:hover:border-slate-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'}>
            Course Builder
          </button>
          <button onClick={() => setActiveTab('paths')} className={activeTab === 'paths' ? 'border-primary-500 text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-200 dark:hover:border-slate-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'}>
            Pathway Builder
          </button>
        </nav>
      </div>

      {activeTab === 'courses' && (
        <Card title="Manage Courses" action={
          <button onClick={handleNewCourse} className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm">
            <Icon name="plus" className="h-4 w-4 mr-2" /> New Course
          </button>
        }>
          <ul className="divide-y divide-slate-200/80 dark:divide-slate-800">
            {props.courses.map(course => (
              <li key={course.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{course.title}</p>
                  <p className="text-sm text-slate-500">{course.modules.length} modules</p>
                </div>
                <button onClick={() => handleEditCourse(course)} className="p-2 text-slate-500 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"><Icon name="pencil" className="h-4 w-4"/></button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {activeTab === 'paths' && (
        <Card title="Manage Learning Paths" action={
          <button onClick={handleNewPath} className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm">
            <Icon name="plus" className="h-4 w-4 mr-2" /> New Path
          </button>
        }>
          <ul className="divide-y divide-slate-200/80 dark:divide-slate-800">
            {props.learningPaths.map(path => (
              <li key={path.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{path.title}</p>
                  <p className="text-sm text-slate-500">{path.stages.length} stages</p>
                </div>
                <button onClick={() => handleEditPath(path)} className="p-2 text-slate-500 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"><Icon name="pencil" className="h-4 w-4"/></button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {editingCourse && (
        <CourseBuilderModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSave={handleSaveCourse}
          assetTypeConfigs={props.assetTypeConfigs}
        />
      )}

      {editingPath && (
        <PathwayBuilderModal
          path={editingPath}
          onClose={() => setEditingPath(null)}
          onSave={handleSavePath}
          allCourses={props.courses}
          allProjectTemplates={props.templates}
        />
      )}

    </div>
  );
};

export default CurriculumStudio;