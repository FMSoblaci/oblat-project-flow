
import React, { useMemo } from 'react';
import { 
  ChartContainer, 
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { format, addDays, startOfDay, endOfMonth, differenceInDays, isBefore } from 'date-fns';
import { formatDatePl } from "@/lib/date-utils";
import { Task } from "@/services/taskService";
import { CalendarClock } from 'lucide-react';

interface TaskTimeAxisProps {
  tasks: Task[];
}

const TaskTimeAxis = ({ tasks }: TaskTimeAxisProps) => {
  const timeAxisData = useMemo(() => {
    if (!tasks.length) return [];

    const today = startOfDay(new Date());
    const endDate = endOfMonth(addDays(today, 60)); // Show up to 2 months in the future
    const days = differenceInDays(endDate, today);

    // Get tasks with due dates
    const tasksWithDueDates = tasks
      .filter(task => task.due_date && task.status !== 'done')
      .map(task => ({
        ...task,
        dueDate: new Date(task.due_date as string)
      }))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    if (!tasksWithDueDates.length) return [];

    // Create data points for tasks grouped by date
    const tasksByDate = tasksWithDueDates.reduce((acc: Record<string, any[]>, task) => {
      const dateKey = format(task.dueDate, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
      return acc;
    }, {});

    const data = [];
    
    // Add the today marker
    data.push({
      date: today,
      label: 'Dziś',
      value: 0,
      isToday: true,
      tasks: []
    });

    // Add task data points
    Object.entries(tasksByDate).forEach(([dateKey, dateTasks]) => {
      const date = new Date(dateKey);
      if (!isBefore(date, today)) { // Only include today and future dates
        data.push({
          date,
          label: formatDatePl(date, 'P'),
          value: dateTasks.length,
          tasks: dateTasks
        });
      }
    });

    return data;
  }, [tasks]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      
      if (data.isToday) {
        return (
          <div className="bg-white p-2 border rounded shadow-sm">
            <p className="text-xs font-medium">Dziś</p>
          </div>
        );
      }
      
      return (
        <div className="bg-white p-2 border rounded shadow-sm max-w-xs">
          <p className="text-xs font-medium mb-1">{data.label}</p>
          <div className="text-xs space-y-1">
            {data.tasks.map((task: Task, i: number) => (
              <div key={i} className="flex justify-between">
                <span className="truncate mr-2">{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!timeAxisData.length) {
    return null;
  }

  return (
    <div className="mt-2 mb-6">
      <div className="flex items-center mb-2">
        <CalendarClock className="h-5 w-5 text-purple-600 mr-2" />
        <h3 className="text-md font-medium text-gray-700">Oś czasu zadań</h3>
      </div>
      <div className="bg-white border rounded-lg p-2 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={timeAxisData}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <XAxis 
              dataKey="label"
              tick={{ fontSize: 10 }}
              tickFormatter={(value, index) => {
                const item = timeAxisData[index];
                if (item.isToday) return 'Dziś';
                return format(item.date, 'd MMM');
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x="Dziś" stroke="#9b87f5" strokeWidth={1} />
            <Bar dataKey="value" maxBarSize={30}>
              {timeAxisData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.isToday ? 'transparent' : '#9b87f5'}
                  radius={[4, 4, 0, 0]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TaskTimeAxis;
