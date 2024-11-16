import { TaskModel as taskModel } from "../models/taskModel.js";

export const getTaskStatusPercentage = async (req, res) => {
    try {
        // Barcha tasklarni olish
        const tasks = await taskModel.find();

        // Umumiy tasklar soni
        const totalTasks = tasks.length;

        // Status bo'yicha foizlarni hisoblash
        let jarayondaCount = 0;
        let tugatildiCount = 0;
        let biriktirilmaganCount = 0;

        tasks.forEach(task => {
            if (task.status_content === "Jarayonda") {
                jarayondaCount++;
            } else if (task.status_content === "Tugatildi") {
                tugatildiCount++;
            } else {
                biriktirilmaganCount++;
            }
        });

        // Foizlarni hisoblash
        const statusPercentage = {
            Jarayonda: ((jarayondaCount / totalTasks) * 100).toFixed(2),
            Tugatildi: ((tugatildiCount / totalTasks) * 100).toFixed(2),
            Biriktirilmagan: ((biriktirilmaganCount / totalTasks) * 100).toFixed(2),
        };

        // Javobni qaytarish
        res.json({
            totalTasks,
            statusPercentage
        });
    } catch (error) {
        res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
    }
};