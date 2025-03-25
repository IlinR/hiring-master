import Executor, { IExecutor } from './Executor';
import ITask from './Task';

export default async function run(executor: IExecutor, queue: AsyncIterable<ITask>, maxThreads = 0) {
    maxThreads = Math.max(0, maxThreads);
    /**
     * Код надо писать сюда
     * Тут что-то вызываем в правильном порядке executor.executeTask для тасков из очереди queue
     */
    const promisesCount = [] 
    let index = maxThreads
    const queues = new Map();
    const activeTasks = [] as Promise<void>[]
    let activeThreads = 0

    const runTask = async (task: ITask) => {
        activeTasks[task.targetId] = executor.executeTask(task)
        if (!queues.get(task.targetId).length) //&& (activeTasks.length<maxThreads || maxThreads!=0) )
            runTask(queues.get(task.targetId).shift())
        else
    }
  
    for await (const task of queue) {
        if (!activeTasks[task.targetid])
            {activeTasks[task.targetid] = executor.executeTask(task)}
        else {
            if (queues.has(task.targetId))
                queues.set(task.targetId,[])
            queues.get(task.targetId).push(task)
        }
            activeTasks[task.targetId].then(()=>{runTask(queues.get(task.targetId).shift())})
        
    }
    return Promise.all(activeTasks)
}
