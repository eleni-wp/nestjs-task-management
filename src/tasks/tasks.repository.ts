import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';

@Injectable()
export class tasksRepository {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.tasksRepository.createQueryBuilder('tasks');
    query.where({ user });
    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    if (search) {
      query.andWhere(
        'LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)',
        { search: `%${search}%` },
      );
    }
    const tasks = await query.leftJoinAndSelect('tasks.user', 'user').getMany();
    return tasks;
  }
  public async createTask(
    createTaskDto: CreateTaskDto,
    user: User,
  ): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.tasksRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });
    await this.tasksRepository.save(task);
    return task;
  }
  async findOneBy(id: string, user: User) {
    return this.tasksRepository.findOne({ where: { id, user } });
  }
  async delete(id: string, user: User) {
    return this.tasksRepository.delete({ id, user });
  }
  async save(task: Task) {
    return this.tasksRepository.save(task);
  }
}
