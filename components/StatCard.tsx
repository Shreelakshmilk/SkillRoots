import React, { ReactElement } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactElement;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    purple: 'border-purple-200 bg-purple-50',
    red: 'border-red-200 bg-red-50',
    yellow: 'border-yellow-200 bg-yellow-50',
  };

  const valueColorClasses = {
      blue: 'text-blue-800',
      green: 'text-green-800',
      purple: 'text-purple-800',
      red: 'text-red-800',
      yellow: 'text-yellow-800',
  }

  return (
    <div className={`p-6 rounded-xl shadow-md flex items-center space-x-4 border-2 transition-transform transform hover:-translate-y-1 ${colorClasses[color]}`}>
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-2xl font-bold ${valueColorClasses[color]}`}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
