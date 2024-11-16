import jwt from "jsonwebtoken";
import moment from 'moment-timezone';
import { partModel } from "../models/partModel.js";
import { TaskModel as taskModel } from "../models/taskModel.js";
import { UsersModel as usersModel } from "../models/usersModel.js";
import { projectModel as Project } from "../models/projectModel.js";
import { deletedProjectsModel } from "../models/deletedProjectsModel.js";

async function getTasksByProjectWithSpecificStatusPercentages(projectId) {
    try {
        // 1. Ushbu projectga tegishli partlarni topish
        const parts = await partModel.find({ project_id: projectId });

        // 2. Ushbu partlarga tegishli tasklarni topish
        const partIds = parts.map(part => part._id); // barcha part idlarini yig'ish
        const tasks = await taskModel.find({ part_id: { $in: partIds } });

        // 3. Status bo'yicha foizlarni hisoblash
        const totalTasks = tasks.length;

        // Status qiymatlarini sanash uchun boshqaruv obyektini yaratamiz
        const statusCounts = {
            'Qabul qilmadi': 0,
            'Qabul qildi': 0,
            'Jarayonda': 0,
            'Tugatildi': 0,
            'Biriktirilmagan': 0 // Biriktirilmagan tasklarni sanash uchun
        };

        // Task larni ko'rib chiqib, har bir status_content ni sanaymiz
        tasks.forEach(task => {
            if (!task.status_content || task.status_content === null) {
                statusCounts['Biriktirilmagan'] += 1;
            } else if (statusCounts.hasOwnProperty(task.status_content)) {
                statusCounts[task.status_content] += 1;
            }
        });

        // Har bir statusning foizini hisoblaymiz
        const statusPercentages = {};
        for (const status in statusCounts) {
            statusPercentages[status] = (statusCounts[status] / totalTasks) * 100;
        }

        // 4. Natija
        return {
            totalTasks,
            statusPercentages,
        };
    } catch (err) {
        res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
    }
}

export default {
    async getAllProjects(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 8;

            const skip = (page - 1) * limit;

            const projects = await Project.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalProjects = await Project.countDocuments();

            res.status(200).json({
                message: 'success',
                projects: projects,
                currentPage: page,
                totalPages: Math.ceil(totalProjects / limit),
                totalProjects: totalProjects
            });
        } catch (err) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async createProject(req, res) {
        try {
            const { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY);

            let { project_name, project_type } = req.body;
            let projectData = await Project.countDocuments();
            const newProjectNumber = projectData + 1;

            // Barcha `partModel` hujjatlarini topish
            const parts_data_a = await partModel.findOne({ _id: "6731e930495be82b4f6ef566" });
            const parts_data_b = await partModel.findOne({ _id: "6731e942495be82b4f6ef574" });
            const parts_data_c = await partModel.findOne({ _id: "6731e94b495be82b4f6ef57d" });
            const parts_data_d = await partModel.findOne({ _id: "6731e958495be82b4f6ef589" });
            const parts_data_e = await partModel.findOne({ _id: "6731e98e495be82b4f6ef5c0" });
            const partsData = [parts_data_a, parts_data_b, parts_data_c, parts_data_d, parts_data_e];

            let createdData = await Project.create({
                project_name: project_name,
                user_id: payload.id,
                createdAt: moment.tz('Asia/Tashkent').toDate(),
                project_number: `${project_type}_${newProjectNumber}`
            });

            // Part ma'lumotlarini yangi project_id bilan yaratish va saqlash
            for (const part of partsData) {
                if (part) {
                    const newPartData = {
                        project_number: createdData.project_number,
                        part_number: part.part_number,
                        link: part.link,
                        project_id: createdData._id, // yangi project_id qiymatini qo'shish
                    };

                    const newPart = new partModel(newPartData);
                    await newPart.save();

                    // Eski part ID bilan bog'langan `Task` hujjatlarini topish
                    const oldTasks = await taskModel.find({ part_id: part._id });

                    // Har bir `Task` ni yangi `part_id` bilan nusxa qilish va saqlash
                    for (const oldTask of oldTasks) {
                        const newTaskData = {
                            ...oldTask.toObject(), // eski `Task` ma'lumotlari
                            part_id: newPart._id,
                            createdAt: moment.tz('Asia/Tashkent').toDate() // yangi `part_id` bilan yangilash
                        };
                        delete newTaskData._id; // eski ID ni o'chirish

                        const newTask = new taskModel(newTaskData);
                        await newTask.save(); // yangi `Task` hujjatini saqlash
                    }
                }
            }

            res.status(201).json({ createdData, status: 201 });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Xato yuz berdi', error });
        }
    },

    async getProjectById(req, res) {
        try {
            const { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY)

            const project = await Project.findById(req.params.id).populate({ path: "user_id", select: "email rule" })
            const userData = await usersModel.findOne({ _id: payload.id })
            const result = await getTasksByProjectWithSpecificStatusPercentages(req.params.id)

            if (!project) {
                return res.status(404).json({
                    message: 'Not found'
                })
            }

            if (userData.super_admin === true) {
                return res.status(200).json({
                    message: 'success',
                    project,
                    total_tasks: result.totalTasks,
                    data_percent: {
                        status_percentages: result.statusPercentages
                    }
                });
            } else {
                // Agar admin bo'lmasa, linkni olib tashlaymiz
                const { link, ...projectWithoutLink } = project.toObject(); // Loyiha ma'lumotlarini olish va linkni olib tashlash
                return res.status(200).json({
                    message: 'success',
                    project: projectWithoutLink,
                    total_tasks: result.totalTasks,
                    data_percent: {
                        status_percentages: result.statusPercentages
                    }
                });
            }
        } catch (err) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async updateProject(req, res) {
        try {
            const { project_number, project_name, director, stb } = req.body

            const updateProject = await Project.findByIdAndUpdate(req.params.id, {
                project_number,
                project_name,
                director,
                stb
            })

            res.status(200).json({
                message: 'success',
                updateProject
            })
        } catch (err) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async removeProject(req, res) {
        try {
            const { id } = req.params;
            let projectData = await Project.findOne({ _id: id })

            if (!projectData) {
                return res.status(404).json({ msg: "Данные не найдены", status: 404 })
            }

            await deletedProjectsModel.create({
                project_number: projectData.project_number,
                project_name: projectData.project_name,
                user_id: projectData.user_id,
                stb: projectData.stb,
                link: projectData.link,
                createdAt: projectData.createdAt
            })

            let DeletedData = await Project.findOneAndDelete({ _id: projectData._id })

            res.status(200).json({ DeletedData, msg: 'Удален успешно', status: 200 });
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async searchProjects(req, res) {
        try {
            let { value } = req.query;


            if (!value) {
                return res.status(400).json({ msg: "bad request", status: 400 });
            }

            const regexValue = new RegExp(value, "i");
            let projectData = await Project.find({
                $or: [
                    {
                        project_number: { $regex: regexValue },
                    },
                    {
                        project_name: { $regex: regexValue }
                    },
                ],
            })

            if (!projectData.length) {
                return res.status(404).json({ msg: "user not found", status: 404 });
            }

            res.status(200).json({ projectData, status: 200 });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    }
}