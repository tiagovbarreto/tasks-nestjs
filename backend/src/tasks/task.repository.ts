import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";
import { Task } from "./task.entity";
import { CreateTaskDTO } from "./dto/create-task-dto";
import { TasksFilterDTO } from "./dto/task-filter-dto";
import { User } from "../auth/user.entity";

@EntityRepository(Task)
export class TaskRepository extends Repository <Task>{

    async createTask(createTaskDTO: CreateTaskDTO, user: User): Promise <Task>{
        const { description, status, title } = createTaskDTO;

        const task = this.create();
        task.user = user;
        task.title = title;
        task.description = description;
        task.status = status;
        await task.save();

        delete task.user;

        return task;
    }

    async getTasks(taskFilterDTO: TasksFilterDTO, user: User): Promise <Task[]>{
        const { search, status } = taskFilterDTO;
        const query: SelectQueryBuilder<Task> = this.createQueryBuilder('task');

        query.where('task.userId = :userId', {userId: user.id});

        if (status) {
          query.andWhere('task.status = :status', { status });
        }

        if (search) {
          query.andWhere('(task.title LIKE :search OR task.description LIKE :search)', {search: `%${search}%`});
        }

        return await query.getMany();
    }

}
